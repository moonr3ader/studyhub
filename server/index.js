require('dotenv').config();
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

// Models
const User = require('./models/User');
const Guild = require('./models/Guild');

// App Initialization
const app = express();
const server = http.createServer(app);

// Socket.io Configuration
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Note: Ensure this matches the Vite development port
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// =========================================================
// USER ROUTES
// =========================================================

/**
 * POST /api/user/qualify
 * Note: Triggered when an adventurer completes the Preliminary Quest.
 * Utilizes upsert to create a new profile if one does not exist, or updates an existing one.
 */
app.post('/api/user/qualify', async (req, res) => {
    const { uid, username, email } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { firebaseUid: uid },
            { 
                firebaseUid: uid,
                username: username,
                email: email,
                isQualified: true, 
                $inc: { xp: 100 } // Award initial Level 0 completion XP
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update adventurer status." });
    }
});

/**
 * GET /api/user/:uid
 * Note: Fetches the adventurer's complete profile using their Firebase UID.
 */
app.get('/api/user/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.uid });
        
        if (!user) {
            return res.status(404).json({ error: "Adventurer not found in the database." });
        }
        
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch adventurer stats." });
    }
});

// =========================================================
// GUILD ROUTES
// =========================================================

/**
 * POST /api/guilds/create
 * Note: Forges a new guild. Enforces qualification and solo-status rules.
 * Expects 'adminUid' (Firebase UID) in the request body.
 */
app.post('/api/guilds/create', async (req, res) => {
    const { name, description, adminUid, requiresApproval } = req.body;

    try {
        const user = await User.findOne({ firebaseUid: adminUid });
        if (!user) {
            return res.status(404).json({ error: "Adventurer not found." });
        }
        
        // Rule Validation
        if (!user.isQualified) {
            return res.status(403).json({ error: "You must complete the Preliminary Quest before forging a Guild!" });
        }
        if (user.isInGuild) {
            return res.status(400).json({ error: "You are already sworn to a Guild!" }); 
        }

        // Guild Creation
        const newGuild = new Guild({
            guildName: name,
            guildDescription: description,
            adminID: user._id, 
            members: [user._id], 
            requiresApproval: requiresApproval || false
        });

        await newGuild.save();
        
        // Update the creator's profile
        user.isInGuild = true;
        user.guildID = newGuild._id;
        await user.save();
        
        res.status(201).json({ 
            message: "Guild forged successfully!", 
            guild: newGuild 
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: "That Guild name is already taken by another clan." });
        }
        console.error(err);
        res.status(500).json({ error: "Server error: Could not forge the guild." });
    }
});

/**
 * GET /api/guilds
 * Note: Fetches the active roster of all guilds. 
 * Populates the 'members' array with usernames and levels for the Hub UI.
 */
app.get('/api/guilds', async (req, res) => {
    try {
        const guilds = await Guild.find().populate('members', 'username level');
        res.status(200).json(guilds);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load the Guild Hub." });
    }
});

/**
 * POST /api/guilds/join
 * Note: Allows a qualified adventurer to join an existing guild.
 * Enforces maximum capacity (5 members) and prevents multi-guilding.
 */
app.post('/api/guilds/join', async (req, res) => {
    const { uid, guildId } = req.body;
    try {
        // 1. Find the User
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) return res.status(404).json({ error: "Adventurer not found." });

        // 2. Rule Checks for the User
        if (!user.isQualified) return res.status(403).json({ error: "You must complete the Preliminary Quest first." });
        if (user.isInGuild) return res.status(400).json({ error: "You are already sworn to a Guild!" });

        // 3. Find the Guild
        const guild = await Guild.findById(guildId);
        if (!guild) return res.status(404).json({ error: "Guild not found. It may have been disbanded." });

        // 4. Rule Check for the Guild (Capacity)
        if (guild.members.length >= 5) {
            return res.status(400).json({ error: "This Guild is already at maximum capacity (5/5)." });
        }

        // 5. The Alliance (Update Both Documents)
        guild.members.push(user._id); // Add user to guild roster
        await guild.save();

        user.isInGuild = true;        // Mark user as taken
        user.guildID = guild._id;     // Link them to the guild
        await user.save();

        res.status(200).json({ message: `Successfully joined ${guild.guildName}!` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error: Could not join the guild." });
    }
});

// =========================================================
// SOCKET.IO LOGIC (REAL-TIME WORKSPACE)
// =========================================================

io.on('connection', (socket) => {
    console.log(`👤 User Connected: ${socket.id}`);

    /**
     * Note: Handles a user entering the general guild hub or a specific team space.
     */
    socket.on('join_guild', (guildId) => {
        socket.join(guildId);
        console.log(`🛡️ User ${socket.id} joined guild: ${guildId}`);
    });

    socket.on('join_guild_room', (guildId) => {
        socket.join(guildId); 
        console.log(`User ${socket.id} joined private room: ${guildId}`);
    });

    /**
     * Note: Broadcasts code editor changes to all members within the specified guild room.
     */
    socket.on('code_update', ({ guildId, code }) => {
        socket.to(guildId).emit('receive_code', code);
    });

    socket.on('disconnect', () => {
        console.log(`👤 User Disconnected: ${socket.id}`);
    });
});

// =========================================================
// SERVER INITIALIZATION
// =========================================================

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server forging on port ${PORT}`);
});