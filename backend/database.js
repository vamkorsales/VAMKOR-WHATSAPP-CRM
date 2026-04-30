const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  db.serialize(() => {
    // Customers Table
    db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT,
        email TEXT,
        countryCode TEXT,
        dialCode TEXT,
        source TEXT,
        tag TEXT,
        campaign TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Messages Table
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        message TEXT,
        direction TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(customer_id) REFERENCES customers(id)
      )
    `);

    // Templates Table
    db.run(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT,
        content TEXT,
        category TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Integration Settings (Key-Value pairs essentially)
    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);
    
    // Seed settings if empty
    db.get("SELECT COUNT(*) as count FROM settings", (err, row) => {
        if (!err && row.count === 0) {
            const defaultSettings = [
                { key: 'webhookVerified', value: 'false' }
            ];
            const stmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
            defaultSettings.forEach(s => stmt.run(s.key, s.value));
            stmt.finalize();
        }
    });
  });
  console.log('Database initialized successfully.');
};

module.exports = { db, initDb };
