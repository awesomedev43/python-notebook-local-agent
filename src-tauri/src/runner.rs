use chrono::Utc;
use serde::Serialize;
use std::fs::{self, File};
use std::io::{BufRead, BufReader, Write};
use std::os::windows::process::CommandExt;
use std::path::Path;
use std::process::{Command, Stdio};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};
use uuid::Uuid;

use crate::completed::CompletedJobData;
use crate::AppState;

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct LogRecord<'a> {
    uuid: &'a str,
    date: usize,
    log: &'a str,
}

/**
 * This function will do the following
 * - Generate a UUID
 * - Create a new directory for executing the notebok
 * - Execute the notebook
 * - Save the output to file
 */
pub fn execute_notebook(
    app: AppHandle,
    executable_path: String,
    data_directory: String,
    notebook_path: String,
) -> Uuid {
    let id = Uuid::new_v4();
    let path = Path::new(&notebook_path);
    let filename: String = String::from(path.file_name().unwrap().to_str().unwrap());
    let execution_directory = Path::new(&data_directory).join(id.to_string());

    let id_str = id.to_string();

    tauri::async_runtime::spawn(async move {
        fs::create_dir_all(&execution_directory).expect("Unable to create directory");

        let stdout_file_path = execution_directory.join("output.log");
        let stdout_file = File::create(stdout_file_path).expect("failed to open log");

        let stderr_file_path = execution_directory.join("execution.log");
        let mut stderr_file = File::create(stderr_file_path).expect("failed to open log");

        let outputfile = execution_directory.join(&filename);

        app.emit(
            "notebook_log2",
            LogRecord {
                uuid: id_str.as_str(),
                date: 10,
                log: format!("Starting execution for {}", filename).as_str(),
            },
        )
        .unwrap();

        let mut command = Command::new(&executable_path);
        command
            .args([
                "-m",
                "papermill",
                &notebook_path,
                outputfile.to_str().unwrap(),
            ])
            .current_dir(execution_directory.clone())
            .stderr(Stdio::piped())
            .stdout(stdout_file)
            .env(
                "NBPYTHONRUNNER_EXECDIRECTORY",
                execution_directory.to_str().unwrap(),
            )
            .env("NBPYTHONRUNNER_DATADIR", &data_directory);

        if cfg!(windows) {
            command.creation_flags(CREATE_NO_WINDOW);
        }

        let mut child = command.spawn().expect("Failed to spawn executable");

        let execution_reader = BufReader::new(child.stderr.as_mut().unwrap());
        let execution_lines = execution_reader.lines();

        for line in execution_lines {
            write!(stderr_file, "{}", line.as_ref().unwrap()).expect("Failed to write");
            app.emit(
                "notebook_log2",
                LogRecord {
                    uuid: id_str.as_str(),
                    date: 10,
                    log: line.as_ref().unwrap().as_str(),
                },
            )
            .unwrap();
        }

        child.wait().expect("Failed to execute command");

        app.emit(
            "notebook_log2",
            LogRecord {
                uuid: id_str.as_str(),
                date: 10,
                log: "Finished executing Notebook",
            },
        )
        .unwrap();

        generate_html_report(&app, &executable_path, &filename, &id, &execution_directory);

        {
            let state: State<'_, Mutex<AppState>> = app.state();
            state.lock().unwrap().completed_db.store(&CompletedJobData {
                id: id.to_string(),
                job_id: None,
                output_path: String::from(execution_directory.to_str().unwrap()),
                nb_path: notebook_path,
                completed: Utc::now().timestamp(),
            });
            app.emit("notebook_run_complete", &id_str).unwrap();
        }
    });

    id
}

pub fn generate_html_report(
    app: &AppHandle,
    executable_path: &str,
    filename: &str,
    id: &Uuid,
    execution_directory: &Path,
) {
    let local_data_dir = app.path().app_local_data_dir().unwrap();
    let output_dir = local_data_dir.as_path();
    let output_file = format!("{}.html", id).to_string();

    let mut command = Command::new(executable_path);
    command
        .args([
            "-m",
            "nbconvert",
            "--to",
            "html",
            filename,
            "--output-dir",
            output_dir.to_str().unwrap(),
            "--output",
            &output_file,
        ])
        .current_dir(execution_directory);

    if cfg!(windows) {
        command.creation_flags(CREATE_NO_WINDOW);
    }

    let mut child = command.spawn().expect("Failed to spawn executable");

    child.wait().expect("Failed to execute command");
}
