// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::sync::mpsc::{channel, Receiver, Sender};
use std::{sync::Mutex, time::Duration};

use completed::CompletedDB;
use job_scheduler::{Job, JobScheduler};
use scheduled::{ScheduledDB, ScheduledData};
use serde::{Deserialize, Serialize};
use tauri::{App, AppHandle, Manager, State};
use uuid;

mod completed;
mod runner;
mod scheduled;

#[derive(Debug)]
pub struct AppState {
    pub executable_path: String,
    pub data_directory: String,
    pub job_sender: Sender<NotebookJob>,
    pub job_id_receiver: Receiver<job_scheduler::Uuid>,
    pub scheduled_db: ScheduledDB,
    pub job_cancel_sender: Sender<job_scheduler::Uuid>,
    pub completed_db: CompletedDB,
}

#[derive(Serialize, Deserialize, Debug)]
struct ConfigureArguments {
    executable_path: String,
    data_directory: String,
}

#[tauri::command]
fn configure_app(_app: AppHandle, state: State<'_, Mutex<AppState>>, config: ConfigureArguments) {
    let mut state = state.lock().unwrap();
    state.executable_path = config.executable_path;
    state.data_directory = config.data_directory;
    println!("configure_app {:?}", state);
}

#[derive(Serialize, Deserialize, Debug)]
struct RunArguments {
    nb_path: String,
}

#[tauri::command]
fn run_notebook(
    app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    run_args: RunArguments,
) -> String {
    println!("run_notebook {:?}", run_args);

    let (executable_path, data_directory) = {
        let state = state.lock().unwrap();
        (state.executable_path.clone(), state.data_directory.clone())
    };

    let uuid =
        runner::execute_notebook(app, executable_path, data_directory, run_args.nb_path);
    return format!("{:?}", uuid);
}

#[derive(Debug, Clone)]
pub struct NotebookJob {
    pub path: String,
    pub cron_schedule: String,
    pub executable_path: String,
    pub data_directory: String,
}

fn scheduler_loop<'r>(
    job_receiver: &mut Receiver<NotebookJob>,
    exit_receiver: &mut Receiver<bool>,
    sched: &mut JobScheduler<'r>,
    job_id_sender: &Sender<job_scheduler::Uuid>,
    job_cancel_receiver: &mut Receiver<job_scheduler::Uuid>,
    app_handle: AppHandle,
) {
    loop {
        let job = job_receiver.recv_timeout(Duration::from_millis(1000));
        if job.is_ok() {
            println!("Job: {:?}", job);
            let handle_clone = app_handle.clone();

            let jobclone = job.unwrap();
            let schedule = jobclone.cron_schedule;
            let id = sched.add(Job::new(schedule.parse().unwrap(), move || {
                let uuid = runner::execute_notebook(
                    handle_clone.clone(),
                    jobclone.executable_path.clone(),
                    jobclone.data_directory.clone(),
                    jobclone.path.clone(),
                );
                println!("Scheduled Job with UUID: {:?}", uuid);
            }));
            job_id_sender.send(id).unwrap();
        }

        let exit = exit_receiver.recv_timeout(Duration::from_millis(200));
        if exit.is_ok() && exit.unwrap() {
            println!("Exiting Scheduler Thread");
            break;
        }

        let cancel = job_cancel_receiver.recv_timeout(Duration::from_millis(200));
        if cancel.is_ok() {
            let res = sched.remove(cancel.unwrap());
            println!("Removed job {}: {}", cancel.unwrap(), res);
        }

        sched.tick();
        std::thread::sleep(Duration::from_millis(1000));
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct ScheduledRunArguments {
    nb_path: String,
    cron_string: String,
}

#[tauri::command]
fn schedule_notebook(
    _app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    run_args: ScheduledRunArguments,
) -> String {
    println!("schedule_notebook {:?}", run_args);

    let state = state.lock().unwrap();
    state
        .job_sender
        .send(NotebookJob {
            path: run_args.nb_path.clone(),
            cron_schedule: run_args.cron_string.clone(),
            executable_path: state.executable_path.clone(),
            data_directory: state.data_directory.clone(),
        })
        .unwrap();

    let uuid = state.job_id_receiver.recv();
    if uuid.is_ok() {
        println!("Scheduled with Uuid = {:?}", uuid.unwrap());
    }
    let scheduled_data = ScheduledData {
        nb_path: run_args.nb_path,
        cron_schedule: run_args.cron_string,
        job_id: uuid.unwrap().to_string(),
        id: uuid::Uuid::new_v4().to_string(),
    };
    state.scheduled_db.store(&scheduled_data);

    uuid.unwrap().to_string()
}

#[tauri::command]
fn get_all_scheduled(_app: AppHandle, state: State<'_, Mutex<AppState>>) -> Vec<ScheduledData> {
    println!("get_all_scheduled");
    let state = state.lock().unwrap();
    state.scheduled_db.fetch_all()
}

#[derive(Serialize, Deserialize, Debug)]
struct CancelScheduledRunArguments {
    id: String,
    job_id: String,
}

#[tauri::command]
fn cancel_scheduled_job(
    _app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    cancel_args: Vec<CancelScheduledRunArguments>,
) -> Result<(), String> {
    let state = state.lock().unwrap();

    println!("{:?}", &cancel_args);
    for cancel_arg in cancel_args {
        state
            .job_cancel_sender
            .send(job_scheduler::Uuid::parse_str(&cancel_arg.job_id).unwrap())
            .unwrap();
        state.scheduled_db.delete(&cancel_arg.id);
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let (job_sender, mut job_receiver) = channel::<NotebookJob>();
    let (exit_sender, mut exit_receiver) = channel::<bool>();
    let (job_id_sender, job_id_receiver) = channel::<job_scheduler::Uuid>();
    let (job_cancel_sender, mut job_cancel_receiver) = channel::<job_scheduler::Uuid>();

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app: &mut App| {
            println!(
                "Local database path: {:?}",
                app.path().app_local_data_dir().unwrap().as_path()
            );
            let scheduled_db = ScheduledDB::new(app.path().app_local_data_dir().unwrap().as_path());
            scheduled_db.initialize();

            let completed_db = CompletedDB::new(app.path().app_local_data_dir().unwrap().as_path());
            completed_db.initialize();

            app.manage(Mutex::new(AppState {
                executable_path: String::from(""),
                data_directory: String::from(""),
                job_sender: job_sender,
                job_id_receiver: job_id_receiver,
                scheduled_db,
                job_cancel_sender,
                completed_db,
            }));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            run_notebook,
            configure_app,
            schedule_notebook,
            get_all_scheduled,
            cancel_scheduled_job
        ])
        .build(tauri::generate_context!())
        .expect("failed to build tauri app instance");

    let app_handle = app.handle().clone();

    let handle = std::thread::spawn(move || {
        let mut scheduler = JobScheduler::new();
        scheduler_loop(
            &mut job_receiver,
            &mut exit_receiver,
            &mut scheduler,
            &job_id_sender,
            &mut job_cancel_receiver,
            app_handle,
        );
    });

    app.run(|_app_handle, _event| {});

    exit_sender.send(false).unwrap();
    handle.join().expect("Failed to join");
}
