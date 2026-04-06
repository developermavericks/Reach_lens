import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('reachlens.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_mentions INTEGER DEFAULT 0,
    google_mentions INTEGER DEFAULT 0,
    reddit_mentions INTEGER DEFAULT 0,
    raw_data JSON
  )
`);

export default db;
