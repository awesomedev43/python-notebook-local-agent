// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::{
    process::{Command, Stdio},
    sync::Mutex,
};

use serde::{Deserialize, Serialize};
use tauri::{App, AppHandle, Manager, State};

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
    _app: AppHandle,
    state: State<'_, Mutex<AppState>>,
    run_args: RunArguments,
) -> String {
    println!("run_notebook {:?}", run_args);

    let (executable_path, data_directory) = {
        let state = state.lock().unwrap();
        (state.executable_path.clone(), state.data_directory.clone())
    };

    tauri::async_runtime::spawn(async move {
        let child = Command::new(executable_path)
            .args(["--version"])
            .current_dir(data_directory)
            .stdin(Stdio::piped())
            .stderr(Stdio::piped())
            .stdout(Stdio::piped())
            .spawn()
            .expect("Failed to spawn executable");

        let output = child.wait_with_output().expect("Failed to get output");
        let raw_output = String::from_utf8(output.stdout).unwrap();
        println!("Raw output: {:?}", raw_output);
    });

    return format!("run_notebook {:?}", run_args);
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
