import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "content.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS ContentPlan (
    id TEXT PRIMARY KEY,
    propertyId TEXT NOT NULL,
    planType TEXT NOT NULL,
    title TEXT NOT NULL,
    promptSummary TEXT,
    payload TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

export default db;
