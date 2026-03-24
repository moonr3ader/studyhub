const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firebaseUid: { 
        type: String, 
        required: true, 
        unique: true 
    },
    username: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    xp: { 
        type: Number, 
        default: 0 
    },
    level: { 
        type: Number, 
        default: 1 
    },
    isQualified: { 
        type: Boolean, 
        default: false // Locks them out of the Guild Hub initially
    },
    isInGuild: { 
        type: Boolean, 
        default: false 
    },
    guildID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Guild',
        default: null
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    lastClaimed: { 
        type: Date,
        default: null 
    }
});

module.exports = mongoose.model('User', UserSchema);