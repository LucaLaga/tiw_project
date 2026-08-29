import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const DB_DIR = path.join(import.meta.dirname, '..', '..', 'data');
const DB_FILE = path.join(DB_DIR, 'app.db');
const SCHEMA_FILE = path.join(import.meta.dirname, 'schema.sql');

if(!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(fs.readFileSync(SCHEMA_FILE, 'utf-8'));

export default db;
