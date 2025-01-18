use std::path::Path;

use rusqlite::Connection;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]

pub struct ScheduledData {
    pub nb_path: String,
    pub cron_schedule: String,
    pub job_id: String,
    pub id: String,
}

#[derive(Debug)]
pub struct ScheduledDB {
    connection: Connection,
}

impl ScheduledDB {
    pub fn new(local_data_path: &Path) -> Self {
        let dbpath = local_data_path.join("scheduled.db3");
        Self {
            connection: Connection::open(dbpath).unwrap(),
        }
    }

    pub fn initialize(&self) {
        if self
            .connection
            .execute(
                "CREATE TABLE IF NOT EXISTS scheduledJob (
                id           TEXT NOT NULL,
                jobId        TEXT,
                nbPath       TEXT NOT NULL,
                cronSchedule TEXT NOT NULL
            )",
                (), // empty list of parameters.
            )
            .is_ok()
        {}
    }

    pub fn store(&self, data: &ScheduledData) {
        self.connection
            .execute(
                "INSERT INTO scheduledJob (id, jobId, nbPath, cronSchedule) VALUES (?1, ?2, ?3, ?4)",
                (&data.id, &data.job_id, &data.nb_path, &data.cron_schedule),
            )
            .unwrap();
    }

    pub fn delete(&self, id: &str) {
        self.connection
            .execute("DELETE from scheduledJob where id = ?1", [&id])
            .unwrap();
    }

    pub fn fetch_all(&self) -> Vec<ScheduledData> {
        let mut stmt = self
            .connection
            .prepare("SELECT id, jobId, nbPath, cronSchedule FROM scheduledJob")
            .unwrap();
        let iter = stmt
            .query_map([], |row| {
                Ok(ScheduledData {
                    id: row.get(0).unwrap(),
                    job_id: row.get(1).unwrap(),
                    nb_path: row.get(2).unwrap(),
                    cron_schedule: row.get(3).unwrap(),
                })
            })
            .unwrap();

        iter.map(|x| x.unwrap()).collect()
    }
}
