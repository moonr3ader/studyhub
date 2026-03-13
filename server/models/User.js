const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firebaseUid: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isQualified: { type: Boolean, default: false }, // Day 2 requirement
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: String }],
    joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);