require('dotenv').config();
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const User = require('./models/User');
const Guild = require('./models/Guild');

const app = express();
const server = http.createServer(app);

// --- SOCKET CONFIG ---
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// --- DB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Atlas Linked'))
    .catch((err) => console.error('❌ DB Error:', err));

// --- RPG HELPERS ---
// Formula: Level = floor(sqrt(XP / 100)) + 1
const calculateLevel = (totalXp) => Math.floor(Math.sqrt(totalXp / 100)) + 1;

// =========================================================
// USER ROUTES
// =========================================================

// Handle quest completion & initial registration
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
                $inc: { xp: 100 } 
            },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: "Qualification failed" });
    }
});

// Reward XP with 24hr cooldown check
app.post('/api/user/award-xp', async (req, res) => {
    const { uid, xpToAdd } = req.body;
    try {
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) return res.status(404).json({ error: "Adventurer not found" });

        const now = new Date();
        const cooldown = 24 * 60 * 60 * 1000;

        if (user.lastClaimed && (now - user.lastClaimed) < cooldown) {
            const timeLeft = cooldown - (now - user.lastClaimed);
            return res.status(403).json({ 
                error: `Scroll recharging. ${Math.floor(timeLeft / 3600000)}h left.` 
            });
        }

        user.xp = (user.xp || 0) + xpToAdd;
        user.level = calculateLevel(user.xp);
        user.lastClaimed = now;
        await user.save();

        res.status(200).json({ success: true, newXp: user.xp, newLevel: user.level, lastClaimed: user.lastClaimed });
    } catch (error) {
        res.status(500).json({ error: "XP award failed" });
    }
});

// Fetch top 10 players by XP
app.get('/api/users/leaderboard', async (req, res) => {
    try {
        const topPlayers = await User.find({}).sort({ xp: -1 }).limit(10).select('username xp level');
        res.status(200).json(topPlayers);
    } catch (err) {
        res.status(500).json({ error: "Player leaderboard failed" });
    }
});

// Fetch specific profile by UID
app.get('/api/user/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.uid });
        if (!user) return res.status(404).json({ error: "Not found" });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: "Profile fetch failed" });
    }
});

// =========================================================
// GUILD ROUTES
// =========================================================

// Calculate top 10 Guilds (Must stay above /api/guilds/:id)
app.get('/api/guilds/leaderboard', async (req, res) => {
    try {
        const guilds = await Guild.find().populate('members', 'xp');
        const leaderboard = guilds.map(guild => ({
            _id: guild._id,
            guildName: guild.guildName,
            memberCount: guild.members.length,
            totalXP: guild.members.reduce((sum, m) => sum + (m?.xp || 0), 0)
        }));

        leaderboard.sort((a, b) => b.totalXP - a.totalXP);
        res.status(200).json(leaderboard.slice(0, 10));
    } catch (err) {
        res.status(500).json({ error: "Guild leaderboard failed" });
    }
});

// Fetch all active guilds for the Hub
app.get('/api/guilds', async (req, res) => {
    try {
        const guilds = await Guild.find().populate('members', 'username level');
        res.status(200).json(guilds);
    } catch (err) {
        res.status(500).json({ error: "Hub load failed" });
    }
});

// Fetch specific guild by ID
app.get('/api/guilds/:id', async (req, res) => {
    try {
        const guild = await Guild.findById(req.params.id).populate('members', 'username level xp isQualified');
        if (!guild) return res.status(404).json({ error: "Guild not found" });
        res.status(200).json(guild);
    } catch (err) {
        res.status(500).json({ error: "Guild Hall restricted" });
    }
});

// Create new guild
app.post('/api/guilds/create', async (req, res) => {
    const { name, description, adminUid, requiresApproval } = req.body;
    try {
        const user = await User.findOne({ firebaseUid: adminUid });
        if (!user || !user.isQualified || user.isInGuild) return res.status(400).json({ error: "You are already in a guild, therefore you're ineligible for guild creation." });

        const newGuild = new Guild({ guildName: name, guildDescription: description, adminID: user._id, members: [user._id], requiresApproval });
        await newGuild.save();
        
        user.isInGuild = true;
        user.guildID = newGuild._id;
        await user.save();
        
        res.status(201).json({ message: "Guild forged!", guild: newGuild });
    } catch (err) {
        res.status(500).json({ error: "Creation failed" });
    }
});

// Join an existing guild
app.post('/api/guilds/join', async (req, res) => {
    const { uid, guildId } = req.body;
    try {
        const user = await User.findOne({ firebaseUid: uid });
        const guild = await Guild.findById(guildId);
        if (!user || !guild || user.isInGuild || guild.members.length >= 5) return res.status(400).json({ error: "Already in a Guild" });

        guild.members.push(user._id);
        await guild.save();
        user.isInGuild = true;
        user.guildID = guild._id;
        await user.save();

        res.status(200).json({ message: `Joined ${guild.guildName}` });
    } catch (err) {
        res.status(500).json({ error: "Internal join error" });
    }
});

/**
 * PATCH /api/guilds/:id
 * Note: Allows the Leader to update guild details.
 * Checks for name collisions before saving.
 */
app.patch('/api/guilds/:id', async (req, res) => {
    const { adminUid, guildName, guildDescription } = req.body;

    try {
        const guild = await Guild.findById(req.params.id);
        if (!guild) return res.status(404).json({ error: "Guild not found" });

        // Verify the requester is actually the admin
        const user = await User.findOne({ firebaseUid: adminUid });
        if (!user || String(guild.adminID) !== String(user._id)) {
            return res.status(403).json({ error: "Only the Leader can forge changes." });
        }

        // Check if the new name is already taken by a DIFFERENT guild
        if (guildName && guildName !== guild.guildName) {
            const existing = await Guild.findOne({ guildName });
            if (existing) return res.status(400).json({ error: "That name is already claimed." });
            guild.guildName = guildName;
        }

        if (guildDescription) guild.guildDescription = guildDescription;

        await guild.save();
        res.status(200).json({ message: "Guild records updated!", guild });

    } catch (err) {
        res.status(500).json({ error: "Update failed." });
    }
});

// =========================================================
// SOCKET.IO (REAL-TIME ROOMS)
// =========================================================

const roomMemory = {}; 

io.on('connection', (socket) => {
    socket.on('join_guild_room', (guildId) => {
        socket.join(guildId); 
        if (!roomMemory[guildId]) roomMemory[guildId] = [];
        socket.emit('message_history', roomMemory[guildId]);
    });

    socket.on('code_update', ({ guildId, code }) => {
        socket.to(guildId).emit('receive_code', code);
    });

    socket.on('send_message', ({ guildId, messageData }) => {
        if (!roomMemory[guildId]) roomMemory[guildId] = [];
        roomMemory[guildId].push(messageData);
        if (roomMemory[guildId].length > 50) roomMemory[guildId].shift(); 
        socket.to(guildId).emit('receive_message', messageData);
    });

    socket.on('leave_guild_room', (guildId) => {
        socket.leave(guildId);
        const roomSize = io.sockets.adapter.rooms.get(guildId)?.size || 0;
        if (roomSize === 0) delete roomMemory[guildId]; 
    });

    socket.on('disconnecting', () => {
        socket.rooms.forEach(room => {
            if (room !== socket.id) {
                const remaining = io.sockets.adapter.rooms.get(room)?.size - 1 || 0;
                if (remaining === 0) delete roomMemory[room];
            }
        });
    });
});

// --- INIT ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));