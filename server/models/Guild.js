const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    // Maximum 100 characters and must be unique [cite: 409]
    guildName: { type: String, required: true, unique: true, maxLength: 100 }, 
    
    // Description of the guild's purpose or theme [cite: 409]
    guildDescription: { type: String, required: true }, 
    
    // Foreign Key referencing the guild administrator [cite: 409]
    adminID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    
    // Indicating if the guild needs approval for joining, defaulting to true [cite: 409]
    requiresApproval: { type: Boolean, default: true }, 
    
    // An array of users who are members of this guild [cite: 409]
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Guild', GuildSchema);