import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Users, Plus, Swords, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GuildHub = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [guilds, setGuilds] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDesc, setNewGuildDesc] = useState('');

  const fetchGuilds = async () => {
    try {
      const [guildsRes, leaderboardRes] = await Promise.all([
        axios.get('http://localhost:5000/api/guilds'),
        axios.get('http://localhost:5000/api/guilds/leaderboard')
      ]);
      setGuilds(guildsRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (err) {
      console.error("Failed to fetch guilds:", err);
      setError("The Guild Hub is currently offline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuilds();
  }, []);

  // FORGE A NEW GUILD (Corrected)
  const handleForgeGuild = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("You must be logged in!");

    try {
      await axios.post('http://localhost:5000/api/guilds/create', {
        name: newGuildName,
        description: newGuildDesc,
        adminUid: currentUser.uid
      });
      
      alert("Guild forged successfully!");
      setShowModal(false);
      navigate('/dashboard'); // Teleport to dashboard to see the new guild status

    } catch (err) {
      alert(err.response?.data?.error || "Failed to forge the guild.");
    }
  };

  // JOIN A GUILD (Fixed Success/Fail Conflict)
  const handleJoinGuild = async (guildId) => {
    if (!currentUser) return alert("You must be logged in to join a team!");

    try {
      const response = await axios.post('http://localhost:5000/api/guilds/join', {
        uid: currentUser.uid,
        guildId: guildId
      });

      if (response.status === 200) {
        alert("Success! You have been drafted into the guild.");
        return navigate('/dashboard'); // Use 'return' to stop function execution here!
      }
      
    } catch (err) {
      alert(err.response?.data?.error || "Failed to join the guild.");
    }
  };

  // Removed the duplicate handleCreate function that was at the bottom 
  // as it was redundant and used undefined variables.

  if (loading) {
    return <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-purple-500 font-mono animate-pulse">Loading the Hub...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-10 relative">
      <div className="max-w-6xl mx-auto">

        {/* Navigation */}
        <button onClick={() => navigate('/dashboard')} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6 gap-6">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
              <Shield className="text-purple-500" size={48} /> Guild Hub
            </h1>
            <p className="text-slate-400 mt-3 max-w-lg">Find a team of adventurers to conquer quests and build projects together.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-2"
          >
            <Plus size={20} /> Forge New Guild
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-8">{error}</div>}

        {/* HALL OF FAME LEADERBOARD */}
        <div className="mb-12 bg-gradient-to-r from-[#161B22] to-purple-900/10 border border-purple-500/20 rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            🏆 Hall of Fame <span className="text-sm font-normal text-purple-400 font-mono">(Top Guilds by XP)</span>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-widest border-b border-white/5">
                  <th className="pb-4 font-bold pl-4">Rank</th>
                  <th className="pb-4 font-bold">Guild Name</th>
                  <th className="pb-4 font-bold">Members</th>
                  <th className="pb-4 font-bold text-right pr-4">Total Power (XP)</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((team, index) => (
                  <tr key={`lb-${team._id}`} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4 pl-4 font-mono text-purple-400 font-bold">#{index + 1}</td>
                    <td className="py-4 font-bold text-white group-hover:text-purple-300 transition-colors">{team.guildName}</td>
                    <td className="py-4 text-slate-400 font-mono">{team.memberCount}/5</td>
                    <td className="py-4 font-mono text-emerald-400 font-bold text-right pr-4">{team.totalXP?.toLocaleString()} XP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Guild Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guilds.map((guild) => (
            <div key={guild._id} className="bg-[#161B22] border border-white/5 rounded-3xl p-6 hover:border-purple-500/30 transition-all group flex flex-col shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{guild.guildName}</h3>
                <span className="bg-[#0B0E14] text-slate-400 px-3 py-1 rounded-lg text-xs font-mono border border-white/5 flex items-center gap-2">
                  <Users size={12} /> {guild.members?.length || 0}/5
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-6 flex-1 italic">"{guild.guildDescription}"</p>
              <button 
                onClick={() => handleJoinGuild(guild._id)}
                className="w-full bg-[#0B0E14] hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 hover:border-emerald-500 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Swords size={18} /> Request to Join
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE GUILD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161B22] border border-purple-500/30 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-white mb-6">Forge a Guild</h2>
            <form onSubmit={handleForgeGuild} className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Guild Name</label>
                <input 
                  type="text" required
                  value={newGuildName} onChange={(e) => setNewGuildName(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl p-3 outline-none focus:border-purple-500 text-white transition-colors"
                  placeholder="e.g., Syntax Sorcerers"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Guild Creed</label>
                <textarea 
                  required rows="3"
                  value={newGuildDesc} onChange={(e) => setNewGuildDesc(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl p-3 outline-none focus:border-purple-500 text-white resize-none transition-colors"
                  placeholder="What is your team's focus?"
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-black uppercase tracking-widest text-white transition-all active:scale-95 shadow-lg shadow-purple-500/20">
                Establish Guild
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuildHub;