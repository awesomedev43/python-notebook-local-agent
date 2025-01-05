// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::sync::mpsc::{channel, Receiver, Sender};
use std::{sync::Mutex, time::Duration};

use job_scheduler::JobScheduler;
use serde::{Deserialize, Serialize};
use tauri::{App, AppHandle, Manager, State};

mod runner;

#[derive(Debug)]
struct AppState {
    executable_path: String,
    data_directory: String,
    job_sender: Sender<NotebookJob>,
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

    let uuid = runner::execute_notebook(app, executable_path, data_directory, run_args.nb_path);
    return format!("{:?}", uuid);
}

#[derive(Debug)]
struct NotebookJob {
    path: String,
    cron_schedule: String,
}

fn scheduler_loop<'r>(
    job_receiver: &mut Receiver<NotebookJob>,
    exit_receiver: &mut Receiver<bool>,
    sched: &mut JobScheduler<'r>,
) {
    loop {
        let job = job_receiver.recv_timeout(Duration::from_millis(1000));
        if job.is_ok() {
            println!("Job: {:?}", job);
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
            path: run_args.nb_path,
            cron_schedule: run_args.cron_string,
        })
        .unwrap();

    String::from("")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let (job_sender, mut job_receiver) = channel::<NotebookJob>();
    let (exit_sender, mut exit_receiver) = channel::<bool>();

    std::thread::spawn(move || {
        let mut scheduler = JobScheduler::new();
        scheduler_loop(&mut job_receiver, &mut exit_receiver, &mut scheduler);
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app: &mut App| {
            app.manage(Mutex::new(AppState {
                executable_path: String::from(""),
                data_directory: String::from(""),
                job_sender: job_sender,
            }));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            run_notebook,
            configure_app,
            schedule_notebook
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    exit_sender.send(false).unwrap();
}
