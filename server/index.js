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
 * GET /api/guilds/:id
 * Note: Fetches a specific guild's private dashboard and member roster.
 */
app.get('/api/guilds/:id', async (req, res) => {
    try {
        const guild = await Guild.findById(req.params.id).populate('members', 'username level xp isQualified');
        
        if (!guild) {
            return res.status(404).json({ error: "Guild not found. The ruins are empty." });
        }
        
        res.status(200).json(guild);
    } catch (err) {
        console.error("Guild Hall Error:", err);
        res.status(500).json({ error: "Failed to unlock the Guild Hall doors." });
    }
});

/**
 * GET /api/guilds/leaderboard
 * Note: Calculates the total XP of all members in a guild.
 * Returns the top 10 most powerful guilds sorted by total XP.
 */
app.get('/api/guilds/leaderboard', async (req, res) => {
    try {
        // Fetch all guilds and ONLY pull the 'xp' and 'username' of their members
        const guilds = await Guild.find().populate('members', 'username xp');

        // Map through the guilds and calculate the math
        const leaderboard = guilds.map(guild => {
            // .reduce() is a JavaScript method that adds up an array of numbers
            const totalXP = guild.members.reduce((sum, member) => sum + (member.xp || 0), 0);
            
            return {
                _id: guild._id,
                guildName: guild.guildName,
                memberCount: guild.members.length,
                totalXP: totalXP
            };
        });

        // Sort the array from highest XP to lowest XP
        leaderboard.sort((a, b) => b.totalXP - a.totalXP);

        // Send only the Top 10 back to the frontend
        res.status(200).json(leaderboard.slice(0, 10));

    } catch (err) {
        console.error("Leaderboard Error:", err);
        res.status(500).json({ error: "Failed to load the Hall of Fame." });
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

// 1. The Temporary Brain: Stores messages per guild room
const roomMemory = {}; 

io.on('connection', (socket) => {
    console.log(`👤 User Connected: ${socket.id}`);

    socket.on('join_guild_room', (guildId) => {
        socket.join(guildId); 
        console.log(`User ${socket.id} joined private room: ${guildId}`);

        // 2. Initialize the room's memory if it doesn't exist yet
        if (!roomMemory[guildId]) {
            roomMemory[guildId] = [];
        }

        // 3. Instantly send the existing chat history to the user who just joined/refreshed
        socket.emit('message_history', roomMemory[guildId]);
    });

    socket.on('code_update', ({ guildId, code }) => {
        socket.to(guildId).emit('receive_code', code);
    });

    socket.on('send_message', ({ guildId, messageData }) => {
        // 4. Save the message to the temporary brain
        if (!roomMemory[guildId]) roomMemory[guildId] = [];
        roomMemory[guildId].push(messageData);
        
        // Safety lock: Keep only the last 50 messages so your server RAM doesn't overflow
        if (roomMemory[guildId].length > 50) {
            roomMemory[guildId].shift(); 
        }

        socket.to(guildId).emit('receive_message', messageData);
    });

    // 5. The Cleanup Crew: Wipe memory when the last person leaves
    socket.on('disconnecting', () => {
        socket.rooms.forEach(room => {
            if (room !== socket.id) { // Ignore their default personal room
                // Calculate how many people will be left in the room after this user disconnects
                const remainingUsers = io.sockets.adapter.rooms.get(room)?.size - 1 || 0;
                
                if (remainingUsers === 0 && roomMemory[room]) {
                    delete roomMemory[room]; 
                    console.log(`🧹 Room ${room} is empty. Chat memory wiped.`);
                }
            }
        });
    });

    // 6. Explicitly leaving the room (Navigation in React)
        socket.on('leave_guild_room', (guildId) => {
            socket.leave(guildId); // Remove the user from the room
            console.log(`🚪 User ${socket.id} walked out of room: ${guildId}`);

            // Check how many people are still in the room
            const roomSize = io.sockets.adapter.rooms.get(guildId)?.size || 0;
            
            if (roomSize === 0 && roomMemory[guildId]) {
                delete roomMemory[guildId]; 
                console.log(`🧹 Room ${guildId} is completely empty. Chat memory wiped.`);
            }
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