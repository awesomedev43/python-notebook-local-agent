use std::path::Path;

use rusqlite::Connection;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct CompletedJobData {
    pub id: String,
    pub job_id: Option<String>,
    pub output_path: String,
    pub nb_path: String,
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
                nb_path      TEXT NOT NULL,
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
                "INSERT INTO completedJob (id, job_id, outputPath, nb_path, completed) VALUES (?1, ?2, ?3, ?4, ?5)",
                (&data.id, &data.job_id, &data.output_path, &data.nb_path, &data.completed),
            )
            .unwrap();
    }

    pub fn fetch_all(&self) -> Vec<CompletedJobData> {
        let mut stmt = self
            .connection
            .prepare("SELECT id, job_id, outputPath, nb_path, completed FROM completedJob")
            .unwrap();
        let iter = stmt
            .query_map([], |row| {
                Ok(CompletedJobData {
                    id: row.get(0).unwrap(),
                    job_id: row.get(1).unwrap(),
                    output_path: row.get(2).unwrap(),
                    nb_path: row.get(3).unwrap(),
                    completed: row.get(4).unwrap(),
                })
            })
            .unwrap();
        iter.map(|x| x.unwrap()).collect()
    }
}
