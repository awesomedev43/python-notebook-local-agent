use std::path::Path;

use rusqlite::Connection;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct CompletedJobData {
    pub id: String,
    pub job_id: Option<String>,
    pub output_path: String,
    pub completed: i64,
}

#[derive(Debug)]

pub struct CompletedDB {
    connection: Connection,
}

impl CompletedDB {
    pub fn new(local_data_path: &Path) -> Self {
        let dbpath = local_data_path.join("completed.db3");
        Self {
            connection: Connection::open(dbpath).unwrap(),
        }
    }

    pub fn initialize(&self) {
        match self.connection.execute(
            "CREATE TABLE IF NOT EXISTS completedJob (
                id           TEXT NOT NULL,
                job_id       TEXT,
                outputPath   TEXT NOT NULL,
                completed    TIMESTAMP
            )",
            (), // empty list of parameters.
        ) {
            Ok(_) => {}
            Err(e) => println!("Failed to create table {:?}", e),
        }
    }

    pub fn store(&self, data: &CompletedJobData) {
        self.connection
            .execute(
                "INSERT INTO completedJob (id, job_id, outputPath, completed) VALUES (?1, ?2, ?3, ?4)",
                (&data.id, &data.job_id, &data.output_path, &data.completed),
            )
            .unwrap();
    }
}
