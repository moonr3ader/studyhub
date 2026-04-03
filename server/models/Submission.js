const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    challengeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Challenge', 
        required: true 
    },
    guildId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Guild' 
    }, 
    
    // If it's a team challenge
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    
    // If it's a solo challenge
    submittedCode: { 
        type: String, 
        required: true 
    },
    isValid: { 
        type: Boolean, 
        default: false 
    }, 
    
    // Did it pass the Judge0 test cases?
    submissionStatus: { 
        type: String, 
        enum: ['pending', 'valid', 'invalid', 'rejected'], 
        default: 'pending' 
    },
    xpAwarded: { 
        type: Number, 
        default: 0 
    },
    submittedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Submission', submissionSchema);