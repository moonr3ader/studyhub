require('dotenv').config();
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const axios = require('axios');

// --- DATABASE MODELS ---
const User = require('./models/User');
const Guild = require('./models/Guild');
const Challenge = require('./models/Challenge');
const Submission = require('./models/Submission');
const Badge = require('./models/Badge');

// --- APP INITIALIZATION ---
const app = express();
const server = http.createServer(app);

// --- MIDDLEWARE & CONFIG ---
app.use(cors());
app.use(express.json());

// --- SOCKET CONFIG ---
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// --- DB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Linked'))
  .catch((err) => console.error('❌ DB Error:', err));


// =========================================================
// RPG HELPERS & SCHEMAS
// =========================================================

// Formula: Level = floor(sqrt(XP / 100)) + 1
const calculateLevel = (totalXp) => Math.floor(Math.sqrt(totalXp / 100)) + 1;

// Temporary schema for random trial questions
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
      xp: 100, 
      level: 1
    });

    // NEW: Award the initial badges
    const trialBadge = await Badge.findOne({ badgeTitle: "Trial Survivor" });
    const earlyBadge = await Badge.findOne({ badgeTitle: "Early Adopter" });
    if (trialBadge) newUser.badges.push(trialBadge._id);
    if (earlyBadge) newUser.badges.push(earlyBadge._id);
    
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
    const user = await User.findOne({ firebaseUid: req.params.uid }).populate('badges');
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
    const existingUser = await User.findOne({ 
      username: new RegExp(`^${username}$`, 'i') 
    });

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
 * Secret dev route to grant a user infinite power and Admin status.
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
    user.isAdmin = true; 

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

    // Award Team Player badge
    const teamBadge = await Badge.findOne({ badgeTitle: "Team Player" });
    if (teamBadge && !user.badges.includes(teamBadge._id)) {
      user.badges.push(teamBadge._id);
    }

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

    guild.pendingRequests.push(user._id);
    await guild.save();

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

    guild.pendingRequests = guild.pendingRequests.filter(id => id.toString() !== targetUserId);
    guild.members.push(targetUserId);
    await guild.save();

    // UPDATED: Now properly fetches the user, updates their status, and awards the "Team Player" badge
    const user = await User.findById(targetUserId);
    if(user) {
      user.pendingGuildID = null;
      user.isInGuild = true;
      user.guildID = guild._id;

      const teamBadge = await Badge.findOne({ badgeTitle: "Team Player" });
      if (teamBadge && !user.badges.includes(teamBadge._id)) {
        user.badges.push(teamBadge._id);
      }
      await user.save();
    }

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
    
    guild.pendingRequests = guild.pendingRequests.filter(id => id.toString() !== targetUserId);
    await guild.save();

    await User.findByIdAndUpdate(targetUserId, { pendingGuildID: null });
    res.status(200).json({ message: "Application declined." });
  } catch (err) { 
    res.status(500).json({ error: "Decline failed" }); 
  }
});

// KICK MEMBER (Leader Only)
app.post('/api/guilds/:id/kick', async (req, res) => {
  const { adminUid, targetMemberId } = req.body;
  const guildId = req.params.id;

  try {
    const guild = await Guild.findById(guildId);
    const admin = await User.findOne({ firebaseUid: adminUid });

    if (!guild || !admin) return res.status(404).json({ error: "Guild or Admin not found." });

    if (String(guild.adminID) !== String(admin._id)) {
      return res.status(403).json({ error: "Only the Leader holds the power of banishment." });
    }

    if (String(targetMemberId) === String(guild.adminID)) {
      return res.status(400).json({ error: "The Leader cannot leave their own post this way." });
    }

    guild.members = guild.members.filter(m => String(m) !== String(targetMemberId));
    await guild.save();

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

// UPDATE GUILD details
app.patch('/api/guilds/:id', async (req, res) => {
  const { adminUid, guildName, guildDescription } = req.body;
  try {
    const guild = await Guild.findById(req.params.id);
    if (!guild) return res.status(404).json({ error: "Guild not found" });

    const user = await User.findOne({ firebaseUid: adminUid });
    if (!user || String(guild.adminID) !== String(user._id)) {
      return res.status(403).json({ error: "Only the Leader can forge changes." });
    }

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

// SAVE FORGE CODE
app.put('/api/guilds/:guildId/save', async (req, res) => {
  try {
    const { guildId } = req.params;
    const { code } = req.body;
    await Guild.findByIdAndUpdate(guildId, { savedCode: code });
    res.status(200).json({ message: 'Code saved to the Forge successfully.' });
  } catch (error) {
    console.error('Error saving code:', error);
    res.status(500).json({ error: 'Failed to save code to database' });
  }
});

// FETCH FORGE CODE
app.get('/api/guilds/:guildId', async (req, res) => {
  try {
    const { guildId } = req.params;
    const guild = await Guild.findById(guildId); 
    if (!guild) return res.status(404).json({ error: 'Guild not found' });
    res.status(200).json({ savedCode: guild.savedCode });
  } catch (error) {
    console.error('Error fetching guild code:', error);
    res.status(500).json({ error: 'Failed to fetch code from database' });
  }
});


// =========================================================
// CHALLENGE ROUTES
// =========================================================

// Submit code for a challenge
app.post('/api/challenges/:challengeId/submit', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId, guildId, code, languageId } = req.body; 

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });

    // --- DECISION LOGIC: CASES 13 & 17 ---
    // If the challenge is no longer active, reject the submission immediately.
    if (!challenge.active) {
      return res.status(400).json({ error: 'Challenge Ended!' });
    }

    // Check if the challenge has expired (42-hour timer)
    if (challenge.expiresAt && new Date() > challenge.expiresAt) {
      return res.status(400).json({ error: 'Challenge Ended! The 42-hour window has closed.' });
    }

    const realUser = await User.findOne({ firebaseUid: userId });
    if (!realUser) return res.status(404).json({ error: 'Adventurer record not found.' });

    // --- DECISION LOGIC ---
    // If it's a guild challenge, but the user isn't in a guild, reject them!
    if (challenge.challengeType === 'guild' && !realUser.isInGuild) {
      return res.status(403).json({ error: 'Join a guild first!' });
    }

    let passedAllTests = true;
    let finalOutput = '';
    let errorMessage = '';

    // Judge0 looping and XP awarding logic
    for (let i = 0; i < challenge.testCases.length; i++) {
      const testCase = challenge.testCases[i];

      const judgeResponse = await axios.post('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
        source_code: code,
        language_id: languageId,
        stdin: testCase.input 
      }, {
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY, 
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      });

      const result = judgeResponse.data;

      if (result.stderr || result.compile_output) {
        passedAllTests = false;
        errorMessage = result.stderr || result.compile_output;
        break; 
      }

      const actualOutput = result.stdout ? result.stdout.trim() : '';
      const expected = testCase.expectedOutput.trim();

      if (actualOutput !== expected) {
        passedAllTests = false;
        finalOutput = `Test Case ${i + 1} Failed.\nExpected: ${expected}\nGot: ${actualOutput}`;
        break;
      }
      
      finalOutput = `All test cases passed successfully!`;
    }

    const newSubmission = new Submission({
      challengeId,
      guildId,
      userId: realUser._id,
      submittedCode: code,
      isValid: passedAllTests,
      submissionStatus: passedAllTests ? 'valid' : 'invalid',
      xpAwarded: passedAllTests ? challenge.totalXP : 0
    });
    await newSubmission.save();

    let earnedBadge = null;
    if (passedAllTests) {
      const badge = await Badge.findOne({ badgeTitle: "Bug Squasher" });

      if (challenge.challengeType === 'guild') {
        // --- MULTIPLAYER RAID XP LOGIC ---
        // 1. Ask Socket.io for every connection currently sitting in this Guild's room
        const activeSockets = await io.in(guildId).fetchSockets();

        // 2. Extract their UIDs (Using Set to remove duplicates if someone has two tabs open)
        const activeUids = [...new Set(activeSockets.map(s => s.data.uid).filter(Boolean))];

        // 3. Find all those specific users in the database at once
        const activeMembers = await User.find({ firebaseUid: { $in: activeUids } });

        // 4. Loop through and award everyone the loot!
        for (let member of activeMembers) {
          member.xp = (member.xp || 0) + challenge.totalXP;
          member.level = calculateLevel(member.xp);
          if (badge && !member.badges.includes(badge._id)) {
            member.badges.push(badge._id);
          }
          await member.save();
        }
        earnedBadge = badge; 

      } else {
        // --- SOLO XP LOGIC ---
        realUser.xp = (realUser.xp || 0) + challenge.totalXP;
        realUser.level = calculateLevel(realUser.xp);
        if (badge && !realUser.badges.includes(badge._id)) {
          realUser.badges.push(badge._id);
          earnedBadge = badge;
        }
        await realUser.save();
      }
    }

    res.status(200).json({
      success: passedAllTests,
      message: passedAllTests ? 'Challenge Complete!' : 'Challenge Failed.',
      output: passedAllTests ? finalOutput : (errorMessage || finalOutput),
      xpEarned: passedAllTests ? challenge.totalXP : 0,
      newBadge: earnedBadge
    });
  } catch (error) {
    console.error("Submission Error:", error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

// Fetch ALL active challenges for the Quest Board
app.get('/api/challenges', async (req, res) => {
  try {
    const now = new Date();
    // Finds active challenges where expiresAt is strictly in the future!
    const challenges = await Challenge.find({ 
      active: true,
      expiresAt: { $gt: now } 
    }).sort({ totalXP: 1 });
    
    res.status(200).json(challenges);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quests" });
  }
});

// Fetch a specific challenge by ID
app.get('/api/challenges/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });
    res.status(200).json(challenge);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch challenge" });
  }
});

// =========================================================
// ADMIN ZONE
// =========================================================

const verifyAdmin = async (uid) => {
  const user = await User.findOne({ firebaseUid: uid });
  return user && user.isAdmin === true;
};

// Fetch ALL users
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

// Forcefully disband guild
app.delete('/api/admin/guilds/:id', async (req, res) => {
  const { adminUid } = req.body;
  try {
    if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });

    const guild = await Guild.findById(req.params.id);
    if (!guild) return res.status(404).json({ error: "Guild not found." });

    await User.updateMany(
      { _id: { $in: guild.members } },
      { $set: { isInGuild: false, guildID: null } }
    );

    await Guild.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Guild has been eradicated." });
  } catch (err) {
    res.status(500).json({ error: "Destruction failed." });
  }
});

// Banish user
app.delete('/api/admin/users/:id', async (req, res) => {
  const { adminUid } = req.body;
  try {
    if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: "User not found." });

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

// UPDATE a User
app.patch('/api/admin/users/:id', async (req, res) => {
  const { adminUid, username, xp, isAdmin, isQualified } = req.body;
  try {
    if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });
    
    const updateData = { username, xp, isAdmin, isQualified };
    if (xp !== undefined) updateData.level = calculateLevel(xp);

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json(updatedUser);
  } catch (err) { 
    res.status(500).json({ error: "Failed to update user." }); 
  }
});

// CREATE a User manually
app.post('/api/admin/users', async (req, res) => {
  const { adminUid, username, firebaseUid, xp } = req.body;
  try {
    if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });
    
    const newUser = new User({
      username: username || "Manual_Entry",
      firebaseUid: firebaseUid || `manual_${Date.now()}`,
      xp: xp || 0,
      level: calculateLevel(xp || 0),
      isQualified: true
    });
 
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) { 
    res.status(500).json({ error: "Failed to create user." }); 
  }
});

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
  } catch (err) { 
    res.status(500).json({ error: "Failed to update guild." }); 
  }
});

// CREATE a Guild manually
app.post('/api/admin/guilds', async (req, res) => {
  const { adminUid, guildName, guildDescription, targetAdminId } = req.body;
  try {
    if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });
    
    const creatorId = targetAdminId || (await User.findOne({ firebaseUid: adminUid }))._id;

    const newGuild = new Guild({
      guildName: guildName || "System_Forged_Guild",
      guildDescription: guildDescription || "Forged by the Gods.",
      adminID: creatorId,
      members: [creatorId]
    });
  
    await newGuild.save();
    
    await User.findByIdAndUpdate(creatorId, { isInGuild: true, guildID: newGuild._id });
    res.status(201).json(newGuild);
  } catch (err) { 
    res.status(500).json({ error: "Failed to force-create guild." }); 
  }
});


// =========================================================
// SOCKET.IO (REAL-TIME ROOMS)
// =========================================================

const roomMemory = {}; 

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_guild_room', ({ guildId, username, uid }) => {
    socket.join(guildId); 

    socket.data.guildId = guildId;
    socket.data.username = username;
    socket.data.uid = uid;

    const systemMessage = {
      sender: 'System',
      text: `${username} has entered the Forge.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    };

    if (!roomMemory[guildId]) roomMemory[guildId] = [];
    
    roomMemory[guildId].push(systemMessage);
    if (roomMemory[guildId].length > 50) roomMemory[guildId].shift();

    socket.to(guildId).emit('receive_message', systemMessage);
    socket.emit('message_history', roomMemory[guildId]);
  });

  socket.on('leave_guild_room', (guildId) => {
    socket.leave(guildId);
    
    if (socket.data.username) {
      const systemMessage = {
        sender: 'System',
        text: `${socket.data.username} has left the Forge.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      };
      
      if (roomMemory[guildId]) {
        roomMemory[guildId].push(systemMessage);
        if (roomMemory[guildId].length > 50) roomMemory[guildId].shift();
      }
      socket.to(guildId).emit('receive_message', systemMessage);
    }

    const roomSize = io.sockets.adapter.rooms.get(guildId)?.size || 0;
    if (roomSize === 0) delete roomMemory[guildId]; 
  });

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
// STANDARD EXECUTION (JUDGE0)
// =========================================================

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
    const submission = await axios.request(options);
    const token = submission.data.token;
    
    let result;
    let statusId = 1; 
    
    while (statusId === 1 || statusId === 2) {
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

// =========================================================
// TEMPORARY SEEDER ROUTES
// =========================================================

// Temporary Seeder Route for Badges
app.post('/api/seed-badges', async (req, res) => {
  try {
    const badgesToCreate = [
      { badgeTitle: "First Blood", badgeDescription: "Submitted your first line of code in the Forge." },
      { badgeTitle: "Hackathon Hero", badgeDescription: "Won 1st place in a guild challenge." },
      { badgeTitle: "Bug Squasher", badgeDescription: "Successfully passed all test cases on a hard challenge." },
      // --- NEW DB BADGES ---
      { badgeTitle: "Early Adopter", badgeDescription: "Joined the realm during its first age." },
      { badgeTitle: "Trial Survivor", badgeDescription: "Passed the preliminary entry test." },
      { badgeTitle: "Team Player", badgeDescription: "Sworn to a Guild." }
    ];

    await Badge.insertMany(badgesToCreate);
    res.status(200).send("Badges successfully seeded into MongoDB!");
  } catch (error) {
    res.status(500).send("Error seeding badges: " + error.message);
  }
});

// Run this ONCE to fix your existing users!
app.post('/api/sync-badges', async (req, res) => {
  try {
    const users = await User.find();
    const trialBadge = await Badge.findOne({ badgeTitle: "Trial Survivor" });
    const teamBadge = await Badge.findOne({ badgeTitle: "Team Player" });
    const earlyBadge = await Badge.findOne({ badgeTitle: "Early Adopter" });

    for (let user of users) {
      if (earlyBadge && !user.badges.includes(earlyBadge._id)) user.badges.push(earlyBadge._id);
      if (user.isQualified && trialBadge && !user.badges.includes(trialBadge._id)) user.badges.push(trialBadge._id);
      if (user.isInGuild && teamBadge && !user.badges.includes(teamBadge._id)) user.badges.push(teamBadge._id);
      await user.save();
    }
    res.send("All existing users have been retroactively awarded their missing DB Badges!");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Temporary Seeder Route
app.post('/api/seed-challenge', async (req, res) => {
  try {
    const soloChallenge = new Challenge({
      title: "The String Reverser (Solo)",
      description: "Write a program that takes a string as input and prints it backwards.",
      totalXP: 500,
      challengeType: 'solo',
      active: true,
      testCases: [ { input: "hello\n", expectedOutput: "olleh" } ]
    });
   
    const guildChallenge = new Challenge({
      title: "The Guild Array Sorter (Guild Only)",
      description: "Sort an array of numbers. Only sworn Guild members can attempt this!",
      totalXP: 1000,
      challengeType: 'guild',
      active: true,
      testCases: [ { input: "3 1 2\n", expectedOutput: "1 2 3" } ]
    });

    await soloChallenge.save();
    await guildChallenge.save();

    res.json({ message: "Solo and Guild Challenges Created successfully!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Temporary Seeder Route for a Time-Bounded Challenge
app.post('/api/seed-challenge', async (req, res) => {
  try {
    // Calculate exactly 42 hours from right now
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 42);

    const timedChallenge = new Challenge({
      title: "The 42-Hour Sprint",
      description: "A time-sensitive trial! Sort the incoming data perfectly before the clock hits zero.",
      totalXP: 1500,
      challengeType: 'guild', // Can be 'solo' or 'guild'
      active: true,
      expiresAt: expirationDate, // Sets the 42-hour deadline in DB
      testCases: [
        { input: "5 4 3 2 1\n", expectedOutput: "1 2 3 4 5" }
      ]
    });
   
    const saved = await timedChallenge.save();
    res.json({ 
      message: "Timed Challenge Created!", 
      expiresAt: expirationDate.toLocaleString(),
      challengeId: saved._id 
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});