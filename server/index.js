require('dotenv').config();
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const axios = require('axios');

// --- MY DATABASE MODELS ---
const User = require('./models/User');
const Guild = require('./models/Guild');
const Challenge = require('./models/Challenge');
const Submission = require('./models/Submission');
const Badge = require('./models/Badge');

// --- APP & SERVER INIT ---
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// --- SOCKET.IO CONFIG ---
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
// HELPERS & TEMPORARY SCHEMAS
// =========================================================

// RPG Math: Level = floor(sqrt(XP / 100)) + 1
const calculateLevel = (totalXp) => Math.floor(Math.sqrt(totalXp / 100)) + 1;

// Temp schema for the preliminary entry test
const questionSchema = new mongoose.Schema({
  scenario: String,
  options: [{ id: String, text: String, isCorrect: Boolean }],
  failureMessage: String
});
const Question = mongoose.model('Question', questionSchema);


// =========================================================
// USER PORTFOLIO & PROGRESSION
// =========================================================

// Register a new adventurer after passing the trial
app.post('/api/user/qualify', async (req, res) => {
  const { uid, email, username } = req.body;
  try {
    // Prevent duplicate usernames
    const existingUser = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
    if (existingUser) return res.status(400).json({ error: "That name is already claimed by another adventurer." });

    const newUser = new User({
      firebaseUid: uid,
      email: email,
      username: username,
      isQualified: true,
      xp: 100, 
      level: 1
    });

    // Grant starter badges
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

// Reward XP with 24hr cooldown check (The Daily Scroll)
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

// Fetch specific profile
app.get('/api/user/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.uid }).populate('badges');
    if (!user) return res.status(404).json({ error: "Not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Profile fetch failed" });
  }
});

// Update profile settings
app.patch('/api/user/:uid', async (req, res) => {
  const { username } = req.body;
  try {
    const existingUser = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
    if (existingUser && existingUser.firebaseUid !== req.params.uid) {
      return res.status(400).json({ error: "That name is already claimed by another adventurer." });
    }

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: req.params.uid },
      { username: username },
      { returnDocument: 'after' } // Fixed mongoose deprecation warning
    );
    
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "Profile updated successfully!", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Grab a random question for the entry trial
app.get('/api/questions/random', async (req, res) => {
  try {
    const randomQuestion = await Question.aggregate([{ $sample: { size: 1 } }]);
    if (randomQuestion.length === 0) return res.status(404).json({ error: "No trials found in the archives." });
    res.status(200).json(randomQuestion[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to summon a trial." });
  }
});


// =========================================================
// HALL OF FAME (LEADERBOARDS)
// =========================================================

// Top 10 Adventurers
app.get('/api/users/leaderboard', async (req, res) => {
  try {
    const topPlayers = await User.find({}).sort({ xp: -1 }).limit(10).select('username xp level firebaseUid');
    res.status(200).json(topPlayers);
  } catch (err) {
    res.status(500).json({ error: "Player leaderboard failed" });
  }
});

// Top 10 Guilds (Calculates combined member XP on the fly)
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


// =========================================================
// GUILD SYSTEM
// =========================================================

// Fetch all active guilds
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

// Forge a new guild
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

    const teamBadge = await Badge.findOne({ badgeTitle: "Team Player" });
    if (teamBadge && !user.badges.includes(teamBadge._id)) user.badges.push(teamBadge._id);

    await user.save();
    res.status(201).json({ message: "Guild forged!", guild: newGuild });
  } catch (err) {
    res.status(500).json({ error: "Creation failed" });
  }
});

// Request to join a guild
app.post('/api/guilds/join', async (req, res) => {
  const { uid, guildId } = req.body;
  try {
    const user = await User.findOne({ firebaseUid: uid });
    const guild = await Guild.findById(guildId);

    if (!user || !guild) return res.status(404).json({ error: "Record not found." });
    if (user.isInGuild || user.pendingGuildID) return res.status(400).json({ error: "You already have an active or pending oath." });
    if (guild.members.length >= 5) return res.status(400).json({ error: "This guild's roster is full." });

    guild.pendingRequests.push(user._id);
    await guild.save();

    user.pendingGuildID = guild._id;
    await user.save();

    // --- NOTIFY THE GUILD LEADER ---
    const guildAdmin = await User.findById(guild.adminID);
    if (guildAdmin) {
      guildAdmin.notifications.push({
        message: `${user.username} has requested to swear an oath to ${guild.guildName}!`,
        type: 'info'
      });
      await guildAdmin.save();
    }
    // ------------------------------------

    res.status(200).json({ message: "Request sent to the Guild Leader!" });
  } catch (err) {
    res.status(500).json({ error: "Application failed." });
  }
});

// Accept a recruit (Leader Only)
app.post('/api/guilds/:id/accept', async (req, res) => {
  const { targetUserId } = req.body;
  try {
    const guild = await Guild.findById(req.params.id);
    if (guild.members.length >= 5) return res.status(400).json({ error: "Guild is full!" });

    guild.pendingRequests = guild.pendingRequests.filter(id => id.toString() !== targetUserId);
    guild.members.push(targetUserId);
    await guild.save();

    const user = await User.findById(targetUserId);
    if(user) {
      user.pendingGuildID = null;
      user.isInGuild = true;
      user.guildID = guild._id;

      const teamBadge = await Badge.findOne({ badgeTitle: "Team Player" });
      if (teamBadge && !user.badges.includes(teamBadge._id)) user.badges.push(teamBadge._id);

      // --- NOTIFY THE RECRUIT ---
      user.notifications.push({
        message: `Your oath was accepted! You are now officially a member of ${guild.guildName}.`,
        type: 'success'
      });
      // -------------------------------

      await user.save();
    }

    res.status(200).json({ message: "Adventurer accepted!" });
  } catch (err) { 
    res.status(500).json({ error: "Accept failed" }); 
  }
});

// Decline a recruit (Leader Only)
app.post('/api/guilds/:id/decline', async (req, res) => {
  const { targetUserId } = req.body;
  try {
    const guild = await Guild.findById(req.params.id);
    guild.pendingRequests = guild.pendingRequests.filter(id => id.toString() !== targetUserId);
    await guild.save();

    // --- FIX: NOTIFY THE RECRUIT ---
    const targetUser = await User.findById(targetUserId);
    if (targetUser) {
      targetUser.pendingGuildID = null;
      targetUser.notifications.push({
        message: `Your application to ${guild.guildName} was declined by the leader.`,
        type: 'warning'
      });
      await targetUser.save();
    }
    // -------------------------------

    await User.findByIdAndUpdate(targetUserId, { pendingGuildID: null });
    res.status(200).json({ message: "Application declined." });
  } catch (err) { 
    res.status(500).json({ error: "Decline failed" }); 
  }
});

// Kick a member (Leader Only)
app.post('/api/guilds/:id/kick', async (req, res) => {
  const { adminUid, targetMemberId } = req.body;
  try {
    const guild = await Guild.findById(req.params.id);
    const admin = await User.findOne({ firebaseUid: adminUid });

    if (!guild || !admin) return res.status(404).json({ error: "Guild or Admin not found." });
    if (String(guild.adminID) !== String(admin._id)) return res.status(403).json({ error: "Only the Leader holds the power of banishment." });
    if (String(targetMemberId) === String(guild.adminID)) return res.status(400).json({ error: "The Leader cannot leave their own post this way." });

    guild.members = guild.members.filter(m => String(m) !== String(targetMemberId));
    await guild.save();

    await User.findByIdAndUpdate(targetMemberId, { isInGuild: false, guildID: null });
    res.status(200).json({ message: "Adventurer has been removed from the roster." });
  } catch (err) {
    res.status(500).json({ error: "Banishment failed." });
  }
});

// Update Guild Info
app.patch('/api/guilds/:id', async (req, res) => {
  const { adminUid, guildName, guildDescription } = req.body;
  try {
    const guild = await Guild.findById(req.params.id);
    const user = await User.findOne({ firebaseUid: adminUid });
    
    if (!guild || !user || String(guild.adminID) !== String(user._id)) {
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

// Save code state in the Forge
app.put('/api/guilds/:guildId/save', async (req, res) => {
  try {
    await Guild.findByIdAndUpdate(req.params.guildId, { savedCode: req.body.code });
    res.status(200).json({ message: 'Code saved to the Forge successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save code to database' });
  }
});

// Clear a user's notifications
app.put('/api/user/:uid/notifications/clear', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Mark all as read
    user.notifications.forEach(n => n.isRead = true);
    await user.save();

    res.status(200).json({ message: "Notifications cleared!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

// =========================================================
// QUESTS & SUBMISSIONS (JUDGE0)
// =========================================================

// Fetch ALL active challenges for the Quest Board
app.get('/api/challenges', async (req, res) => {
  try {
    const now = new Date();
    // Return permanent quests OR timed quests that haven't expired yet
    const challenges = await Challenge.find({ 
      active: true,
      $or: [
        { expiresAt: { $exists: false } }, 
        { expiresAt: null },               
        { expiresAt: { $gt: now } }        
      ]
    }).sort({ totalXP: 1 });
    
    res.status(200).json(challenges);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quests" });
  }
});

// Fetch a specific challenge by ID (Loads the Quest Modal in the Forge)
app.get('/api/challenges/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });
    res.status(200).json(challenge);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch challenge" });
  }
});

// Submit and grade code via Judge0
app.post('/api/challenges/:challengeId/submit', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId, guildId, code, languageId } = req.body; 

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });

    // Enforce time limits
    const now = new Date();
    if (!challenge.active || (challenge.expiresAt && now > challenge.expiresAt)) {
      return res.status(400).json({ error: 'This bounty has expired or is no longer active!' });
    }

    const realUser = await User.findOne({ firebaseUid: userId });
    if (!realUser) return res.status(404).json({ error: 'Adventurer record not found.' });

    if (challenge.challengeType === 'guild' && !realUser.isInGuild) {
      return res.status(403).json({ error: 'You must swear an oath to a Guild to attempt this trial!' });
    }

    // ANTI-CHEAT: Check if they already solved it
    let existingSuccess = await Submission.findOne({
      challengeId: challenge._id,
      isValid: true,
      ...(challenge.challengeType === 'guild' ? { guildId } : { userId: realUser._id })
    });

    if (existingSuccess) {
      return res.status(400).json({ 
        error: challenge.challengeType === 'guild' 
          ? 'Your Guild has already conquered this trial and claimed the bounty!' 
          : 'You have already conquered this trial and claimed the bounty!' 
      });
    }

    // Run code through Judge0
    let passedAllTests = true;
    let finalOutput = '';
    let errorMessage = '';

    for (let testCase of challenge.testCases) {
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
        finalOutput = `Test Failed.\nExpected: ${expected}\nGot: ${actualOutput}`;
        break;
      }
    }
    
    if(passedAllTests) finalOutput = `All test cases passed successfully!`;

    // Save the submission record
    await new Submission({
      challengeId,
      guildId,
      userId: realUser._id,
      submittedCode: code,
      isValid: passedAllTests,
      submissionStatus: passedAllTests ? 'valid' : 'invalid',
      xpAwarded: passedAllTests ? challenge.totalXP : 0
    }).save();

    let earnedBadge = null;

    // Award XP & Gamification Rewards
    if (passedAllTests) {
      // Check if the challenge has a rare badge. If not, give the standard one
      let badge = null;
      if (challenge.rewardBadgeId) {
        badge = await Badge.findById(challenge.rewardBadgeId);
      } else {
        badge = await Badge.findOne({ badgeTitle: "Bug Squasher" });
      }

      if (challenge.challengeType === 'guild') {
        // --- MULTIPLAYER RAID XP LOGIC ---
        const activeSockets = await io.in(guildId).fetchSockets();
        const activeUids = [...new Set(activeSockets.map(s => s.data.uid).filter(Boolean))];
        const activeMembers = await User.find({ firebaseUid: { $in: activeUids } });

        for (let member of activeMembers) {
          member.xp = (member.xp || 0) + challenge.totalXP;
          member.level = calculateLevel(member.xp);

          if (badge && !member.badges.includes(badge._id)) member.badges.push(badge._id);
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
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

// Fallback manual execution route
app.post('/api/execute', async (req, res) => {
  const { code, languageId } = req.body;
  try {
    const submission = await axios.post('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
      language_id: languageId,
      source_code: code
    }, {
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    });

    res.json({
      stdout: submission.data.stdout,
      stderr: submission.data.stderr,
      compile_output: submission.data.compile_output
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute code' });
  }
});


// =========================================================
// ADMIN ZONE & GOD MODE
// =========================================================

const verifyAdmin = async (uid) => {
  const user = await User.findOne({ firebaseUid: uid });
  return user && user.isAdmin === true;
};

// Grant God Mode
app.post('/api/dev/make-admin', async (req, res) => {
  const { uid } = req.body;
  try {
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ error: "Adventurer not found." });

    user.xp = 9999999;
    user.level = calculateLevel(user.xp);
    user.isAdmin = true; 
    await user.save();

    res.status(200).json({ message: "God Mode activated. Admin privileges granted.", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to grant Admin powers." });
  }
});

// Get all users
app.get('/api/admin/users', async (req, res) => {
  const { adminUid } = req.query;
  try {
    if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });
    res.status(200).json(await User.find().sort({ createdAt: -1 }));
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
      await Guild.findByIdAndUpdate(targetUser.guildID, { $pull: { members: targetUser._id } });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Adventurer has been banished from reality." });
  } catch (err) {
    res.status(500).json({ error: "Banishment failed." });
  }
});

// Manually update user
app.patch('/api/admin/users/:id', async (req, res) => {
  const { adminUid, username, xp, isAdmin, isQualified } = req.body;
  try {
    if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });
    
    const updateData = { username, xp, isAdmin, isQualified };
    if (xp !== undefined) updateData.level = calculateLevel(xp);

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' });
    res.status(200).json(updatedUser);
  } catch (err) { 
    res.status(500).json({ error: "Failed to update user." }); 
  }
});

// Manually update guild
app.patch('/api/admin/guilds/:id', async (req, res) => {
  const { adminUid, guildName, guildDescription } = req.body;
  try {
    if (!(await verifyAdmin(adminUid))) return res.status(403).json({ error: "Access Denied." });
    
    const updatedGuild = await Guild.findByIdAndUpdate(
      req.params.id, 
      { guildName, guildDescription }, 
      { returnDocument: 'after' }
    );
    res.status(200).json(updatedGuild);
  } catch (err) { 
    res.status(500).json({ error: "Failed to update guild." }); 
  }
});


// =========================================================
// SOCKET.IO REAL-TIME FORGE ROOMS
// =========================================================

const roomMemory = {}; 

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_guild_room', ({ guildId, username, uid }) => {
    socket.join(guildId); 
    socket.data = { guildId, username, uid };

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
      const msg = {
        sender: 'System',
        text: `${socket.data.username} has left the Forge.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      };
      if (roomMemory[guildId]) {
        roomMemory[guildId].push(msg);
        if (roomMemory[guildId].length > 50) roomMemory[guildId].shift();
      }
      socket.to(guildId).emit('receive_message', msg);
    }
    const roomSize = io.sockets.adapter.rooms.get(guildId)?.size || 0;
    if (roomSize === 0) delete roomMemory[guildId]; 
  });

  socket.on('disconnect', () => {
    const { guildId, username } = socket.data;
    if (guildId && username) {
      const msg = {
        sender: 'System',
        text: `${username} disconnected.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      };
      if (roomMemory[guildId]) {
        roomMemory[guildId].push(msg);
        if (roomMemory[guildId].length > 50) roomMemory[guildId].shift();
      }
      socket.to(guildId).emit('receive_message', msg);
    }
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

  socket.on('disconnecting', () => {
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        const remaining = io.sockets.adapter.rooms.get(room)?.size - 1 || 0;
        if (remaining === 0) delete roomMemory[room];
      }
    });
  });
});


// --- SERVER START ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 GuildDev Server live on port ${PORT}`));