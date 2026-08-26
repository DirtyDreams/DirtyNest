import initSqlJs, { type Database } from "sql.js";
import path from "path";
import fs from "fs";

let db: Database | null = null;

function getDbPath() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "dirtynest.db");
}

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();
  const dbPath = getDbPath();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quick_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT,
      color TEXT DEFAULT '#00FF41',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed default note if empty
  const result = db.exec("SELECT COUNT(*) as count FROM notes");
  const count = result.length > 0 ? result[0].values[0][0] as number : 0;
  if (count === 0) {
    db.run(
      "INSERT INTO notes (content, updated_at) VALUES (?, ?)",
      ["# Welcome to DirtyNest 🪺\n\nStart typing your notes here...", new Date().toISOString()]
    );
  }

  // Seed some quick links if empty
  const linksResult = db.exec("SELECT COUNT(*) as count FROM quick_links");
  const linksCount = linksResult.length > 0 ? linksResult[0].values[0][0] as number : 0;
  if (linksCount === 0) {
    const links = [
      ["GitHub", "https://github.com", "Github", 0],
      ["Stack Overflow", "https://stackoverflow.com", "Code", 1],
      ["Vercel", "https://vercel.com", "Triangle", 2],
      ["ChatGPT", "https://chat.openai.com", "Bot", 3],
      ["Hacker News", "https://news.ycombinator.com", "Newspaper", 4],
    ];
    for (const [name, url, icon, order] of links) {
      db.run(
        "INSERT INTO quick_links (name, url, icon, sort_order) VALUES (?, ?, ?, ?)",
        [name, url, icon, order]
      );
    }
  }

  // Seed calendar events if empty
  const eventsResult = db.exec("SELECT COUNT(*) as count FROM calendar_events");
  const eventsCount = eventsResult.length > 0 ? eventsResult[0].values[0][0] as number : 0;
  if (eventsCount === 0) {
    const today = new Date();
    const events = [
      ["Sprint Planning", null, offsetDate(today, 1), "09:00", "#00FF41"],
      ["Code Review Session", "Review PRs from the team", offsetDate(today, 2), "14:00", "#BF40FF"],
      ["Deploy v2.0", "Production deployment", offsetDate(today, 3), "16:00", "#FF3366"],
      ["Team Standup", null, offsetDate(today, 0), "10:00", "#00E5FF"],
      ["1:1 with Lead", "Weekly sync", offsetDate(today, 5), "11:00", "#FFB800"],
    ];
    for (const [title, desc, date, time, color] of events) {
      db.run(
        "INSERT INTO calendar_events (title, description, date, time, color) VALUES (?, ?, ?, ?, ?)",
        [title, desc, date, time, color]
      );
    }
  }

  // Seed some todos if empty
  const todosResult = db.exec("SELECT COUNT(*) as count FROM todos");
  const todosCount = todosResult.length > 0 ? todosResult[0].values[0][0] as number : 0;
  if (todosCount === 0) {
    const todosData = [
      ["Set up CI/CD pipeline", 0, 0],
      ["Review pull requests", 0, 1],
      ["Update API documentation", 0, 2],
      ["Fix auth token refresh bug", 1, 3],
      ["Deploy staging environment", 0, 4],
    ];
    for (const [text, completed, order] of todosData) {
      db.run(
        "INSERT INTO todos (text, completed, sort_order) VALUES (?, ?, ?)",
        [text, completed, order]
      );
    }
  }

  persistDb();
  return db;
}

function offsetDate(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function persistDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(getDbPath(), buffer);
}

// Type definitions
export interface Todo {
  id: number;
  text: string;
  completed: number;
  sort_order: number;
  created_at: string;
}

export interface Note {
  id: number;
  content: string;
  updated_at: string;
}

export interface QuickLink {
  id: number;
  name: string;
  url: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  color: string;
  created_at: string;
}

// Helper to convert sql.js results to typed arrays
export function queryAll<T>(database: Database, sql: string, params: unknown[] = []): T[] {
  const stmt = database.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}
