const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    guildName: { 
        type: String, 
        required: true, 
        unique: true, // No duplicate team names allowed
        trim: true
    },
    guildDescription: { 
        type: String, 
        required: true 
    },
    adminID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Links to the creator's MongoDB ID
        required: true 
    },
    members: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' // An array of player IDs in this guild
    }],
    requiresApproval: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Guild', GuildSchema);