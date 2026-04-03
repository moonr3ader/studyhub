const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true 
    },
    // The instructions (e.g., "Reverse a string")
    description: {
        type: String,
        required: true 
    },
    // XP rewarded for solving it 
    totalXP: { 
        type: Number, 
        default: 0, 
        required: true 
    },
    // Is the hackathon currently running?
    active: { 
        type: Boolean, 
        default: true 
    }, 
    // Optional: The expected output or test cases to validate the code automatically
    testCases: [{ 
        input: String, 
        expectedOutput: String
    }], 
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Challenge', challengeSchema);