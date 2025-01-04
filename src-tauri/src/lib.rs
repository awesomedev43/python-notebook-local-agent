// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::{App, AppHandle, Manager, State};

mod runner;

#[derive(Default, Debug)]
struct AppState {
    executable_path: String,
    data_directory: String,
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app: &mut App| {
            app.manage(Mutex::new(AppState::default()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![run_notebook, configure_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
