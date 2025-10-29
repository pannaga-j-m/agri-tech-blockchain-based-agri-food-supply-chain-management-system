const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true, // No two users can have the same username
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true // Each wallet can only be registered once
    }
});

module.exports = mongoose.model('User', UserSchema);