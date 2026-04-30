const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  db.serialize(() => {
    // Users Table (Custom Auth & RBAC)
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password_hash TEXT,
        contact_number TEXT,
        username TEXT UNIQUE,
        company_name TEXT,
        country TEXT,
        role TEXT DEFAULT 'Admin', 
        agency_id TEXT,
        assigned_campaigns TEXT,
        assigned_countries TEXT,
        status TEXT DEFAULT 'Active',
        two_factor_secret TEXT,
        two_factor_enabled BOOLEAN DEFAULT 0,
        whitelisted_ips TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Audit Logs
    db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        agency_id TEXT,
        user_email TEXT,
        action TEXT,
        resource TEXT,
        ip_address TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Roles and Permissions Matrix
    db.run(`
      CREATE TABLE IF NOT EXISTS roles_permissions (
        id TEXT PRIMARY KEY,
        agency_id TEXT,
        role_name TEXT,
        permissions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customers Table
    db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        agency_id TEXT,
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
        agency_id TEXT,
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
        agency_id TEXT,
        name TEXT,
        content TEXT,
        category TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Campaigns Table
    db.run(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        agency_id TEXT,
        name TEXT,
        type TEXT,
        status TEXT DEFAULT 'Active',
        budget_used REAL DEFAULT 0,
        messages_limit INTEGER DEFAULT 0,
        sent INTEGER DEFAULT 0,
        delivered INTEGER DEFAULT 0,
        opened INTEGER DEFAULT 0,
        replied INTEGER DEFAULT 0,
        failed INTEGER DEFAULT 0,
        data_added INTEGER DEFAULT 0,
        assigned_agent TEXT,
        open_time TEXT,
        language TEXT,
        approval_status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Subscriptions Table (Billing)
    db.run(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        agency_id TEXT PRIMARY KEY,
        plan TEXT DEFAULT 'Free',
        status TEXT DEFAULT 'active',
        next_billing_date DATETIME
      )
    `);

    // Payment History Table (Billing)
    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        agency_id TEXT,
        amount REAL,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Integration Settings
    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        agency_id TEXT,
        key TEXT,
        value TEXT,
        PRIMARY KEY (agency_id, key)
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
