const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Import the User model

const router = express.Router();

// --- REGISTRATION ROUTE ---
// URL: POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, password, walletAddress } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists." });
        }

        // Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            username,
            password: hashedPassword,
            walletAddress
        });

        // Save the user to the database
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error during registration.", error });
    }
});

// --- LOGIN ROUTE ---
// URL: POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password." });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password." });
        }

        // Login successful, return user data (without the password)
        res.status(200).json({
            username: user.username,
            walletAddress: user.walletAddress
        });

    } catch (error) {
        res.status(500).json({ message: "Server error during login.", error });
    }
});

module.exports = router;