const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true 
    },
    // The instructions
    description: {
        type: String,
        required: true 
    },
    // XP and Badge rewarded for solving it 
    totalXP: { 
        type: Number, 
        default: 0, 
        required: true 
    },
    rewardBadgeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Badge' 
    },
    // Is the hackathon currently running?
    active: { 
        type: Boolean, 
        default: true 
    }, 
    // Optional (expected output or test cases to validate the code automatically)
    testCases: [{ 
        input: String, 
        expectedOutput: String
    }],
    challengeType: { 
        type: String, 
        enum: ['solo', 'guild'], 
        default: 'solo' 
    },
    active: { 
        type: Boolean, 
        default: true 
    },
    expiresAt: { 
        type: Date
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Challenge', challengeSchema);