require('dotenv').config();
const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Replace with frontend URL
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

// // --- Qualification Route ---
// app.post('/api/users/qualify', async (req, res) => {
//     const { firebaseUid } = req.body;
//     try {
//         const updatedUser = await User.findOneAndUpdate(
//             { firebaseUid },
//             { isQualified: true, $inc: { xp: 50 } }, // Award 50 XP for completing the quest
//             { new: true }
//         );
//         res.status(200).json({ message: "Quest Complete! You are now qualified.", user: updatedUser });
//     } catch (err) {
//         res.status(500).json({ error: "Failed to update qualification status." });
//     }
// });

// When user passes the  initial test, and route updates their status in MongoDB
app.post('/api/user/qualify', async (req, res) => {
  const { uid, username, email } = req.body;
  try {
    // Upsert: Find user by Firebase UID, update if exists, create if not
    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { 
        firebaseUid: uid,
        username: username,
        email: email,
        isQualified: true, 
        $inc: { xp: 100 } // Award initial XP
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update adventurer status" });
  }
});

// --- Get User Profile Route ---
app.get('/api/user/:uid', async (req, res) => {
    try {
        // Find the user in MongoDB using their Firebase UID
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

// --- Socket.io Logic ---
io.on('connection', (socket) => {
    console.log(`👤 User Connected: ${socket.id}`);

    socket.on('join_guild', (guildId) => {
        socket.join(guildId);
        console.log(`🛡️ User ${socket.id} joined guild: ${guildId}`);
    });

    socket.on('disconnect', () => {
        console.log('👤 User Disconnected', socket.id);
    });

    // When a user enters their Guild Workspace
    socket.on('join_guild_room', (guildId) => {
        socket.join(guildId); // User enters a private team room
        console.log(`User ${socket.id} joined room: ${guildId}`);
    });

    // Real-time code syncing 
    socket.on('code_update', ({ guildId, code }) => {
        // syncing code only to guild members
        socket.to(guildId).emit('receive_code', code);
    });

});

const Guild = require('./models/Guild');

// --- Guild Creation Route ---
app.post('/api/guilds/create', async (req, res) => {
    const { name, description, adminId, requiresApproval } = req.body;

    try {
        // 1. Verify the user exists
        const user = await User.findById(adminId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        
        // 2. Core Logic Check: Is the user already in a guild? [cite: 399]
        if (user.isInGuild) {
            return res.status(400).json({ error: "You're already in a guild!" }); 
        }

        // 3. Form the Guild [cite: 349]
        const newGuild = new Guild({
            guildName: name,
            guildDescription: description,
            adminID: adminId, // The creator is automatically appointed as Admin [cite: 399]
            members: [adminId], // The creator is added as the first member
            requiresApproval: requiresApproval !== undefined ? requiresApproval : true
        });

        await newGuild.save();
        
        // 4. Update the User's profile to reflect their new guild status
        user.isInGuild = true;
        user.guildID = newGuild._id;
        await user.save();
        
        res.status(201).json({ 
            message: "Guild forged successfully!", 
            guild: newGuild 
        });

    } catch (err) {
        // Handle MongoDB duplicate key error (code 11000) for unique guild names
        if (err.code === 11000) {
            return res.status(400).json({ error: "That Guild name is already taken." });
        }
        console.error(err);
        res.status(500).json({ error: "Server error: Could not forge the guild." });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server forging on port ${PORT}`);
});