require('dotenv').config();
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const User = require('./models/User');
const Guild = require('./models/Guild');

const axios = require('axios');
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

const questionSchema = new mongoose.Schema({
  scenario: String,
  options: [{
    id: String, // 'A', 'B', 'C'
    text: String,
    isCorrect: Boolean
  }],
  failureMessage: String
});
const Question = mongoose.model('Question', questionSchema);

// =========================================================
// USER ROUTES
// =========================================================

// Handle quest completion & initial registration
app.post('/api/user/qualify', async (req, res) => {
    const { uid, email, username } = req.body;
    try {
        // 1. COLLISION CHECK: Does this exact name exist already?
        const existingUser = await User.findOne({ 
            username: new RegExp(`^${username}$`, 'i') 
        });

        if (existingUser) {
            return res.status(400).json({ error: "That name is already claimed by another adventurer." });
        }

        // 2. Create the User (They passed the check!)
        const newUser = new User({
            firebaseUid: uid,
            email: email,
            username: username,
            isQualified: true,
            xp: 100, // Reward for passing the trial!
            level: 1
        });
        
        await newUser.save();
        res.status(200).json({ message: "Identity forged!", user: newUser });
    } catch (err) {
        res.status(500).json({ error: "Failed to forge identity" });
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

// Get a random Trial Question
app.get('/api/questions/random', async (req, res) => {
    try {
        // Grab exactly 1 random document from the Questions collection
        const randomQuestion = await Question.aggregate([{ $sample: { size: 1 } }]);
        
        if (randomQuestion.length === 0) {
            return res.status(404).json({ error: "No trials found in the archives." });
        }
        
        res.status(200).json(randomQuestion[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to summon a trial." });
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

// Update specific profile by UID (User changing their own settings)
app.patch('/api/user/:uid', async (req, res) => {
    const { username } = req.body;
    try {
        // 1. Collision Check: Does this exact name exist already?
        // Using a regex to make the check case-insensitive (e.g., "Admin" clashes with "admin")
        const existingUser = await User.findOne({ 
            username: new RegExp(`^${username}$`, 'i') 
        });

        // If a user exists with this name AND their UID doesn't match the requester's UID
        if (existingUser && existingUser.firebaseUid !== req.params.uid) {
            return res.status(400).json({ error: "That name is already claimed by another adventurer." });
        }

        // 2. Safe to Update
        const updatedUser = await User.findOneAndUpdate(
            { firebaseUid: req.params.uid },
            { username: username },
            { new: true }
        );
        
        if (!updatedUser) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ message: "Profile updated successfully!", user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: "Failed to update profile" });
    }
});

/**
 * POST /api/dev/make-admin
 * Self-Note: Secret dev route to grant a user infinite power and Admin status.
 * WARNING: Remove or heavily protect this before deploying to production!
 */
app.post('/api/dev/make-admin', async (req, res) => {
    const { uid } = req.body;
    
    try {
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) return res.status(404).json({ error: "Adventurer not found." });

        const GOD_MODE_XP = 9999999;
        
        user.xp = GOD_MODE_XP;
        user.level = calculateLevel(GOD_MODE_XP);
        user.isAdmin = true; // <-- Official Admin Status Granted

        await user.save();
        res.status(200).json({ 
            message: "God Mode activated. Admin privileges granted.", 
            newLevel: user.level,
            newXp: user.xp,
            isAdmin: user.isAdmin
        });
        
    } catch (err) {
        res.status(500).json({ error: "Failed to grant Admin powers." });
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
        // CRITICAL: We MUST populate firebaseUid so the frontend can verify the leader.
        // We MUST ALSO populate pendingRequests so the Leader sees who is applying.
        const guild = await Guild.findById(req.params.id)
            .populate('members', 'username level xp isQualified firebaseUid')
            .populate('pendingRequests', 'username level xp'); 
        
        if (!guild) return res.status(404).json({ error: "Guild not found." });
        
        res.status(200).json(guild);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Create new guild
app.post('/api/guilds/create', async (req, res) => {
    const { name, description, adminUid, requiresApproval } = req.body;
    try {
        const user = await User.findOne({ firebaseUid: adminUid });
        if (!user || !user.isQualified || user.isInGuild) {
            return res.status(400).json({ error: "You are already in a guild, therefore you're ineligible for guild creation." });
        }

        const newGuild = new Guild({ 
            guildName: name, 
            guildDescription: description, 
            adminID: user._id, 
            members: [user._id], 
            requiresApproval 
        });
        await newGuild.save();
        
        user.isInGuild = true;
        user.guildID = newGuild._id;
        await user.save();
        
        res.status(201).json({ message: "Guild forged!", guild: newGuild });
    } catch (err) {
        res.status(500).json({ error: "Creation failed" });
    }
});

// Join an existing guild (Adds to Pending Requests)
app.post('/api/guilds/join', async (req, res) => {
    const { uid, guildId } = req.body;
    try {
        const user = await User.findOne({ firebaseUid: uid });
        const guild = await Guild.findById(guildId);

        if (!user || !guild) return res.status(404).json({ error: "Record not found." });
        if (user.isInGuild || user.pendingGuildID) {
            return res.status(400).json({ error: "You already have an active or pending oath." });
        }
        if (guild.members.length >= 5) {
            return res.status(400).json({ error: "This guild's roster is full." });
        }

        // Add user to the Guild's waitlist
        guild.pendingRequests.push(user._id);
        await guild.save();

        // Mark the user as 'Pending'
        user.pendingGuildID = guild._id;
        await user.save();

        res.status(200).json({ message: "Request sent to the Guild Leader!" });
    } catch (err) {
        res.status(500).json({ error: "Application failed." });
    }
});

// ACCEPT MEMBER (Leader Only)
app.post('/api/guilds/:id/accept', async (req, res) => {
    const { adminUid, targetUserId } = req.body;
    try {
        const guild = await Guild.findById(req.params.id);
        if (guild.members.length >= 5) return res.status(400).json({ error: "Guild is full!" });

        // Remove from pending, add to members
        guild.pendingRequests = guild.pendingRequests.filter(id => id.toString() !== targetUserId);
        guild.members.push(targetUserId);
        await guild.save();

        // Update User
        await User.findByIdAndUpdate(targetUserId, {
            pendingGuildID: null,
            isInGuild: true,
            guildID: guild._id
        });

        res.status(200).json({ message: "Adventurer accepted!" });
    } catch (err) { 
        res.status(500).json({ error: "Accept failed" }); 
    }
});

// DECLINE MEMBER (Leader Only)
app.post('/api/guilds/:id/decline', async (req, res) => {
    const { targetUserId } = req.body;
    try {
        const guild = await Guild.findById(req.params.id);
        
        // Remove from pending array
        guild.pendingRequests = guild.pendingRequests.filter(id => id.toString() !== targetUserId);
        await guild.save();

        // Reset User's pending status
        await User.findByIdAndUpdate(targetUserId, { pendingGuildID: null });
        res.status(200).json({ message: "Application declined." });
    } catch (err) { 
        res.status(500).json({ error: "Decline failed" }); 
    }
});

/**
 * POST /api/guilds/:id/kick
 * Self-Note: Removes a member from the guild. 
 * Only the Leader can trigger this, and they can't kick themselves.
 */
app.post('/api/guilds/:id/kick', async (req, res) => {
    const { adminUid, targetMemberId } = req.body;
    const guildId = req.params.id;

    try {
        const guild = await Guild.findById(guildId);
        const admin = await User.findOne({ firebaseUid: adminUid });

        if (!guild || !admin) return res.status(404).json({ error: "Guild or Admin not found." });

        // Security check: Is the requester the actual leader?
        if (String(guild.adminID) !== String(admin._id)) {
            return res.status(403).json({ error: "Only the Leader holds the power of banishment." });
        }

        // Prevent Leader from accidentally kicking themselves
        if (String(targetMemberId) === String(guild.adminID)) {
            return res.status(400).json({ error: "The Leader cannot leave their own post this way." });
        }

        // 1. Remove member from Guild array
        guild.members = guild.members.filter(m => String(m) !== String(targetMemberId));
        await guild.save();

        // 2. Update the Target User's status
        await User.findByIdAndUpdate(targetMemberId, {
            isInGuild: false,
            guildID: null
        });

        res.status(200).json({ message: "Adventurer has been removed from the roster." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Banishment failed." });
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

// PUT /api/guilds/:guildId/save
app.put('/api/guilds/:guildId/save', async (req, res) => {
  try {
    const { guildId } = req.params;
    const { code } = req.body;

    // Assuming you have a Guild model. Adjust to match your actual schema!
    // This updates the 'savedCode' field for the specific guild.
    await Guild.findByIdAndUpdate(guildId, { savedCode: code });
    
    res.status(200).json({ message: 'Code saved to the Forge successfully.' });
  } catch (error) {
    console.error('Error saving code:', error);
    res.status(500).json({ error: 'Failed to save code to database' });
  }
});

// GET /api/guilds/:guildId
app.get('/api/guilds/:guildId', async (req, res) => {
  try {
    const { guildId } = req.params;

    // Fetch the guild from MongoDB (Ensure 'Guild' matches your Mongoose model name)
    const guild = await Guild.findById(guildId); 
    
    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    // Send the saved code back to the client
    res.status(200).json({ savedCode: guild.savedCode });
    
  } catch (error) {
    console.error('Error fetching guild code:', error);
    res.status(500).json({ error: 'Failed to fetch code from database' });
  }
});

// =========================================================
// ADMIN ZONE
// =========================================================

// Self-Note: Helper function to verify admin status before executing destructive actions.
// In a production app, you would use Firebase Admin SDK to verify secure tokens here.
const verifyAdmin = async (uid) => {
    const user = await User.findOne({ firebaseUid: uid });
    return user && user.isAdmin === true;
};

// Fetch ALL users in the realm
app.get('/api/admin/users', async (req, res) => {
    const { adminUid } = req.query;
    try {
        if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });
        
        const allUsers = await User.find().sort({ createdAt: -1 });
        res.status(200).json(allUsers);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch realm data." });
    }
});

// Forcefully disband (delete) a guild
app.delete('/api/admin/guilds/:id', async (req, res) => {
    const { adminUid } = req.body;
    try {
        if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });

        const guild = await Guild.findById(req.params.id);
        if (!guild) return res.status(404).json({ error: "Guild not found." });

        // 1. Free all members from their oath
        await User.updateMany(
            { _id: { $in: guild.members } },
            { $set: { isInGuild: false, guildID: null } }
        );

        // 2. Destroy the guild
        await Guild.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Guild has been eradicated." });
    } catch (err) {
        res.status(500).json({ error: "Destruction failed." });
    }
});

// Banish (delete) a user completely
app.delete('/api/admin/users/:id', async (req, res) => {
    const { adminUid } = req.body;
    try {
        if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });

        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ error: "User not found." });

        // Self-Note: If they are the admin of a guild, we should technically disband it, 
        // or reassign leadership. For now, we will just remove them from it.
        if (targetUser.isInGuild && targetUser.guildID) {
            await Guild.findByIdAndUpdate(targetUser.guildID, {
                $pull: { members: targetUser._id }
            });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Adventurer has been banished from reality." });
    } catch (err) {
        res.status(500).json({ error: "Banishment failed." });
    }
});

// =========================================================
// ADMIN ZONE (GOD MODE) - CRUD EXTENSION
// =========================================================

// --- ADMIN USER MANAGEMENT ---

// UPDATE a User
app.patch('/api/admin/users/:id', async (req, res) => {
    const { adminUid, username, xp, isAdmin, isQualified } = req.body;
    try {
        if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });
        
        const updateData = { username, xp, isAdmin, isQualified };
        if (xp !== undefined) updateData.level = calculateLevel(xp); // Auto-adjust level if XP changes

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.status(200).json(updatedUser);
    } catch (err) { res.status(500).json({ error: "Failed to update user." }); }
});

// CREATE a User manually (Self-Note: Only creates DB record. Firebase Auth is separate.)
app.post('/api/admin/users', async (req, res) => {
    const { adminUid, username, firebaseUid, xp } = req.body;
    try {
        if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });
        
        const newUser = new User({
            username: username || "Manual_Entry",
            firebaseUid: firebaseUid || `manual_${Date.now()}`, // Fallback if no Firebase ID
            xp: xp || 0,
            level: calculateLevel(xp || 0),
            isQualified: true
        });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) { res.status(500).json({ error: "Failed to create user." }); }
});


// --- ADMIN GUILD MANAGEMENT ---

// UPDATE a Guild
app.patch('/api/admin/guilds/:id', async (req, res) => {
    const { adminUid, guildName, guildDescription } = req.body;
    try {
        if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });
        
        const updatedGuild = await Guild.findByIdAndUpdate(
            req.params.id, 
            { guildName, guildDescription }, 
            { new: true }
        );
        res.status(200).json(updatedGuild);
    } catch (err) { res.status(500).json({ error: "Failed to update guild." }); }
});

// CREATE a Guild manually
app.post('/api/admin/guilds', async (req, res) => {
    const { adminUid, guildName, guildDescription, targetAdminId } = req.body;
    try {
        if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });
        
        // Self-Note: Allows admin to assign a guild to a specific user ID, or themselves
        const creatorId = targetAdminId || (await User.findOne({ firebaseUid: adminUid }))._id;

        const newGuild = new Guild({
            guildName: guildName || "System_Forged_Guild",
            guildDescription: guildDescription || "Forged by the Gods.",
            adminID: creatorId,
            members: [creatorId]
        });
        await newGuild.save();
        
        // Ensure the assigned leader knows they are in a guild now
        await User.findByIdAndUpdate(creatorId, { isInGuild: true, guildID: newGuild._id });

        res.status(201).json(newGuild);
    } catch (err) { res.status(500).json({ error: "Failed to force-create guild." }); }
});

// =========================================================
// SOCKET.IO (REAL-TIME ROOMS)
// =========================================================

const roomMemory = {}; 

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // FIX 1: Added curly braces to destructure the object sent from frontend
    socket.on('join_guild_room', ({ guildId, username }) => {
        socket.join(guildId); 

        // Save the data directly to the socket object
        socket.data.guildId = guildId;
        socket.data.username = username;

        // Create the System message
        const systemMessage = {
            sender: 'System',
            text: `${username} has entered the Forge.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true
        };

        // Initialize room memory if it doesn't exist
        if (!roomMemory[guildId]) roomMemory[guildId] = [];
        
        // Push the system message to memory so late joiners see it
        roomMemory[guildId].push(systemMessage);
        if (roomMemory[guildId].length > 50) roomMemory[guildId].shift();

        // Broadcast to everyone else in the room
        socket.to(guildId).emit('receive_message', systemMessage);

        // Send chat history to the newly joined user
        socket.emit('message_history', roomMemory[guildId]);
    });

    // FIX 2: Combined the two 'leave_guild_room' listeners into one
    socket.on('leave_guild_room', (guildId) => {
        socket.leave(guildId);
        
        if (socket.data.username) {
            const systemMessage = {
                sender: 'System',
                text: `${socket.data.username} has left the Forge.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystem: true
            };
            
            // Save to history and broadcast
            if (roomMemory[guildId]) {
                roomMemory[guildId].push(systemMessage);
                if (roomMemory[guildId].length > 50) roomMemory[guildId].shift();
            }
            socket.to(guildId).emit('receive_message', systemMessage);
        }

        // Memory cleanup: If room is empty, delete its memory
        const roomSize = io.sockets.adapter.rooms.get(guildId)?.size || 0;
        if (roomSize === 0) delete roomMemory[guildId]; 
    });

    // 3. Handle accidental disconnects (closed tab, lost wifi)
    socket.on('disconnect', () => {
        const { guildId, username } = socket.data;
        if (guildId && username) {
            const systemMessage = {
                sender: 'System',
                text: `${username} disconnected.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystem: true
            };
            
            if (roomMemory[guildId]) {
                roomMemory[guildId].push(systemMessage);
                if (roomMemory[guildId].length > 50) roomMemory[guildId].shift();
            }
            socket.to(guildId).emit('receive_message', systemMessage);
        }
    });

    // --- STANDARD CHAT AND CODE SYNCS ---

    socket.on('code_update', ({ guildId, code }) => {
        socket.to(guildId).emit('receive_code', code);
    });

    socket.on('send_message', ({ guildId, messageData }) => {
        if (!roomMemory[guildId]) roomMemory[guildId] = [];
        roomMemory[guildId].push(messageData);
        if (roomMemory[guildId].length > 50) roomMemory[guildId].shift(); 
        
        socket.to(guildId).emit('receive_message', messageData);
    });

    // Memory cleanup for total disconnects
    socket.on('disconnecting', () => {
        socket.rooms.forEach(room => {
            if (room !== socket.id) {
                const remaining = io.sockets.adapter.rooms.get(room)?.size - 1 || 0;
                if (remaining === 0) delete roomMemory[room];
            }
        });
    });
});

// =========================================================
// ENDPOINT TO HANDLE COMPILATION REQUEST
// =========================================================

// POST /api/execute
app.post('/api/execute', async (req, res) => {
  const { code, languageId } = req.body;

  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions',
    params: { base64_encoded: 'false', fields: '*' },
    headers: {
      'content-type': 'application/json',
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    },
    data: {
      language_id: languageId,
      source_code: code
    }
  };

  try {
    // 1. Send code to Judge0
    const submission = await axios.request(options);
    const token = submission.data.token;
    
    // 2. Poll Judge0 for the result (will take a moment to compile/run)
    let result;
    let statusId = 1; // 1 = In Queue, 2 = Processing
    
    while (statusId === 1 || statusId === 2) {
        // Wait 500ms between checks
        await new Promise(resolve => setTimeout(resolve, 500)); 

        const response = await axios.get(
        `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        }
      );
      result = response.data;
      statusId = result.status.id;
    }

    // 3. Send the final output back to the frontend
    res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      time: result.time,
      memory: result.memory
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

// --- INIT ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));