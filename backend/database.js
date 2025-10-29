const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database. A new file 'agroledger.db' will be created.
const db = new sqlite3.Database('./agroledger.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the AgroLedger database.');
});

// Create the users table
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    walletAddress TEXT NOT NULL
)`, (err) => {
    if (err) {
        console.error("Error creating table:", err.message);
    } else {
        console.log("Users table is ready.");
    }
});

// Close the database connection
db.close();