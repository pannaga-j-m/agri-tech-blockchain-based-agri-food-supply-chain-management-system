const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5001; // The port your frontend is trying to connect to

// Middleware
app.use(cors()); // Allow cross-origin requests from your frontend
app.use(express.json()); // Allow the server to read JSON from request bodies

// Connect to the database
const db = new sqlite3.Database('./agroledger.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
});

// The registration endpoint
app.post('/api/auth/register', (req, res) => {
    const { username, password, walletAddress } = req.body;

    if (!username || !password || !walletAddress) {
        return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Insert user data into the database
    const sql = `INSERT INTO users (username, password, walletAddress) VALUES (?, ?, ?)`;
    db.run(sql, [username, password, walletAddress], function(err) {
        if (err) {
            console.error(err.message);
            // Handle cases where the username might already exist
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({ message: "Username already exists." });
            }
            return res.status(500).json({ message: "Failed to register user." });
        }
        console.log(`A new user has been created with ID: ${this.lastID}`);
        res.status(201).json({ message: "User registered successfully!", userId: this.lastID });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});