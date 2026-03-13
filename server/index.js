require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Replace with your frontend URL
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

// --- DAY 2: Qualification Route ---
app.post('/api/users/qualify', async (req, res) => {
    const { firebaseUid } = req.body;
    try {
        const updatedUser = await User.findOneAndUpdate(
            { firebaseUid },
            { isQualified: true, $inc: { xp: 50 } }, // Award 50 XP for completing the quest
            { new: true }
        );
        res.status(200).json({ message: "Quest Complete! You are now qualified.", user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: "Failed to update qualification status." });
    }
});

// --- Socket.io Logic (Foundation for Phase 2) ---
io.on('connection', (socket) => {
    console.log(`👤 User Connected: ${socket.id}`);

    socket.on('join_guild', (guildId) => {
        socket.join(guildId);
        console.log(`🛡️ User ${socket.id} joined guild: ${guildId}`);
    });

    socket.on('disconnect', () => {
        console.log('👤 User Disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server forging on port ${PORT}`);
});