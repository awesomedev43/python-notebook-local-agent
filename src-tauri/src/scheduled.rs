use std::path::Path;

use rusqlite::Connection;

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
        match self.connection.execute(
            "CREATE TABLE IF NOT EXISTS scheduledJob (
                id           TEXT NOT NULL,
                jobId        TEXT,
                nbPath       TEXT NOT NULL,
                cronSchedule TEXT NOT NULL
            )",
            (), // empty list of parameters.
        ) {
            Ok(_) => {}
            Err(_) => {}
        }
    }

    pub fn store(&self, data: &ScheduledData) {
        self.connection
            .execute(
                "INSERT INTO scheduledJob (id, jobId, nbPath, cronSchedule) VALUES (?1, ?2, ?3, ?4)",
                (&data.id, &data.job_id, &data.nb_path, &data.cron_schedule),
            )
            .unwrap();
    }
}
