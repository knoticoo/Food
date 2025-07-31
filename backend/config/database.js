const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database setup
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Pets table
    db.run(`CREATE TABLE IF NOT EXISTS pets (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      breed TEXT,
      age INTEGER,
      weight REAL,
      avatar TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id)
    )`);

    // Tasks table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      petId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      scheduledTime DATETIME NOT NULL,
      completedAt DATETIME,
      isRecurring BOOLEAN DEFAULT 0,
      recurrencePattern TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (petId) REFERENCES pets (id)
    )`);

    // Task logs table
    db.run(`CREATE TABLE IF NOT EXISTS task_logs (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL,
      petId TEXT NOT NULL,
      completedAt DATETIME NOT NULL,
      notes TEXT,
      duration INTEGER,
      quantity INTEGER,
      mood TEXT,
      FOREIGN KEY (taskId) REFERENCES tasks (id),
      FOREIGN KEY (petId) REFERENCES pets (id)
    )`);

    // Shared access table
    db.run(`CREATE TABLE IF NOT EXISTS shared_access (
      id TEXT PRIMARY KEY,
      petId TEXT NOT NULL,
      userId TEXT NOT NULL,
      role TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (petId) REFERENCES pets (id),
      FOREIGN KEY (userId) REFERENCES users (id)
    )`);
  });
}

module.exports = db;