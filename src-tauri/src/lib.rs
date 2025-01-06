// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::sync::mpsc::{channel, Receiver, Sender};
use std::{sync::Mutex, time::Duration};

use job_scheduler::{Job, JobScheduler};
use scheduled::{ScheduledDB, ScheduledData};
use serde::{Deserialize, Serialize};
use tauri::{App, AppHandle, Manager, State};
use uuid;

mod runner;
mod scheduled;

#[derive(Debug)]
struct AppState {
    executable_path: String,
    data_directory: String,
    job_sender: Sender<NotebookJob>,
    job_id_receiver: Receiver<job_scheduler::Uuid>,
    scheduled_db: ScheduledDB,
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
        runner::execute_notebook(Some(app), executable_path, data_directory, run_args.nb_path);
    return format!("{:?}", uuid);
}

#[derive(Debug, Clone)]
struct NotebookJob {
    path: String,
    cron_schedule: String,
    executable_path: String,
    data_directory: String,
}

fn scheduler_loop<'r>(
    job_receiver: &mut Receiver<NotebookJob>,
    exit_receiver: &mut Receiver<bool>,
    sched: &mut JobScheduler<'r>,
    job_id_sender: &Sender<job_scheduler::Uuid>,
) {
    loop {
        let job = job_receiver.recv_timeout(Duration::from_millis(1000));
        if job.is_ok() {
            println!("Job: {:?}", job);

            let jobclone = job.unwrap().clone();
            let schedule = jobclone.cron_schedule.clone();
            let id = sched.add(Job::new(schedule.parse().unwrap(), move || {
                let uuid = runner::execute_notebook(
                    None,
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
        job_id: format!("{:?}", uuid),
        id: format!("{:?}", uuid::Uuid::new_v4()),
    };
    state.scheduled_db.store(&scheduled_data);

    format!("{:?}", uuid)
}

#[tauri::command]
fn get_all_scheduled(_app: AppHandle, state: State<'_, Mutex<AppState>>) -> Vec<ScheduledData> {
    println!("get_all_scheduled");
    let state = state.lock().unwrap();
    state.scheduled_db.fetch_all()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let (job_sender, mut job_receiver) = channel::<NotebookJob>();
    let (exit_sender, mut exit_receiver) = channel::<bool>();
    let (job_id_sender, job_id_receiver) = channel::<job_scheduler::Uuid>();

    let handle = std::thread::spawn(move || {
        let mut scheduler = JobScheduler::new();
        scheduler_loop(
            &mut job_receiver,
            &mut exit_receiver,
            &mut scheduler,
            &job_id_sender,
        );
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app: &mut App| {
            let scheduled_db = ScheduledDB::new(app.path().app_local_data_dir().unwrap().as_path());
            scheduled_db.initialize();
            app.manage(Mutex::new(AppState {
                executable_path: String::from(""),
                data_directory: String::from(""),
                job_sender: job_sender,
                job_id_receiver: job_id_receiver,
                scheduled_db,
            }));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            run_notebook,
            configure_app,
            schedule_notebook,
            get_all_scheduled
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    exit_sender.send(false).unwrap();
    handle.join().expect("Failed to join");
}
