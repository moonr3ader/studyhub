const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    badgeTitle: {
        type: String,
        required: true,
        unique: true
    },
    badgeDescription: {
        type: String,
        required: true
    },
    
    // Optional: A URL to an image/icon for the badge
    iconUrl: { 
        type: String 
    }
});

module.exports = mongoose.model('Badge', badgeSchema);