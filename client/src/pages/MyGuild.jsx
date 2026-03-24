import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Terminal, ArrowLeft, Settings, UserMinus, Check, X, Save } from 'lucide-react';

const MyGuild = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [guild, setGuild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Manage State for Leader Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', desc: '' });

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    const fetchGuildData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/guilds/${id}`);
        setGuild(response.data);
        // Prep edit fields in case they are the leader
        setEditData({ name: response.data.guildName, desc: response.data.guildDescription });
      } catch (err) {
        setError("Could not locate this Guild Hall.");
      } finally {
        setLoading(false);
      }
    };

    fetchGuildData();
  }, [id, currentUser, navigate]);

  // Self-Note: Save new guild details to DB (Leader Only)
  const handleSaveGuild = async () => {
    try {
      const res = await axios.patch(`http://localhost:5000/api/guilds/${id}`, {
        adminUid: currentUser.uid,
        guildName: editData.name,
        guildDescription: editData.desc
      });
      setGuild(res.data.guild);
      setIsEditing(false);
      alert("Guild records successfully updated.");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update guild.");
    }
  };

  // Self-Note: Logic to remove a player from the roster
  const handleKickMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to banish this adventurer?")) return;
    try {
      await axios.post(`http://localhost:5000/api/guilds/${id}/kick`, {
        adminUid: currentUser.uid,
        targetMemberId: memberId
      });
      // Refresh local UI by filtering out the kicked member
      setGuild({ ...guild, members: guild.members.filter(m => m._id !== memberId) });
    } catch (err) {
      alert("Failed to kick member.");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0B0E14] text-purple-500 flex items-center justify-center animate-pulse font-mono">Unlocking Guild Hall...</div>;
  if (error) return <div className="min-h-screen bg-[#0B0E14] text-red-500 flex items-center justify-center font-bold">{error}</div>;
  if (!guild) return null;

  const totalGuildXP = guild.members.reduce((sum, member) => sum + (member.xp || 0), 0);
  // const isLeader = guild.members.find(m => m.firebaseUid === currentUser.uid)?._id === guild.adminID;
  // Self-Note: Find the member object whose _id matches the guild's adminID, 
  // then compare their firebaseUid string to the current user's UID.
  const guildLeaderMember = guild.members.find(m => String(m._id) === String(guild.adminID));
  const isLeader = guildLeaderMember?.firebaseUid === currentUser.uid;

  console.log("DEBUG GUILD:", {
    currentUID: currentUser.uid,
    guildAdminRef: guild.adminID,
    calculatedIsLeader: isLeader
  });

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Nav Link */}
        <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-purple-400 transition-colors flex items-center gap-2 font-bold mb-8 uppercase tracking-widest text-xs">
          <ArrowLeft size={14} /> Return to Hub
        </button>

        {/* --- GUILD HEADER --- */}
        <div className="bg-[#161B22] border border-white/5 rounded-3xl p-8 mb-10 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="space-y-4 max-w-xl">
                  <input 
                    className="bg-[#0B0E14] border border-purple-500/50 text-white text-3xl font-black p-3 rounded-xl w-full focus:ring-2 ring-purple-500/20 outline-none"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                  />
                  <textarea 
                    className="bg-[#0B0E14] border border-white/10 text-slate-400 p-3 rounded-xl w-full h-24 outline-none resize-none"
                    value={editData.desc}
                    onChange={(e) => setEditData({...editData, desc: e.target.value})}
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-3">
                    <Shield className="text-purple-500" size={40} />
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">{guild.guildName}</h1>
                  </div>
                  <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">{guild.guildDescription}</p>
                </>
              )}
            </div>

            {/* Action Group */}
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              {isLeader && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button onClick={handleSaveGuild} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                        <Save size={18} /> Save
                      </button>
                      <button onClick={() => setIsEditing(false)} className="bg-slate-800 text-slate-400 px-6 py-3 rounded-xl font-bold hover:text-white transition-all">Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                      <Settings size={18} /> Manage
                    </button>
                  )}
                </div>
              )}
              <button onClick={() => navigate(`/workspace/${guild._id}`)} className="bg-purple-600 hover:bg-purple-500 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-white transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center gap-3 active:scale-95">
                <Terminal size={22} /> Enter Forge
              </button>
            </div>
          </div>
          
          {/* Global Stats */}
          <div className="mt-8 pt-8 border-t border-white/5 flex gap-6">
            <div className="text-sm font-mono"><span className="text-slate-500 uppercase block text-[10px] mb-1">Roster</span> <span className="text-purple-400 font-bold">{guild.members.length} / 5</span></div>
            <div className="text-sm font-mono"><span className="text-slate-500 uppercase block text-[10px] mb-1">Total Power</span> <span className="text-emerald-400 font-bold">{totalGuildXP.toLocaleString()} XP</span></div>
          </div>
        </div>

        {/* --- PENDING APPLICATIONS (Leader Only) --- */}
        {isLeader && guild.pendingMembers?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-black text-yellow-500 mb-6 uppercase tracking-widest flex items-center gap-2">
              <Shield size={20} /> Recruitment Requests
            </h2>
            <div className="space-y-4">
              {guild.pendingMembers.map((req) => (
                <div key={req._id} className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-2xl flex items-center justify-between">
                  <span className="font-bold text-white">{req.username} <span className="text-slate-500 font-normal text-sm ml-2">Lvl {req.level}</span></span>
                  <div className="flex gap-2">
                    <button className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><Check size={18} /></button>
                    <button className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><X size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- ACTIVE MEMBERS --- */}
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
          <Users className="text-purple-500" size={24} /> Active Members
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guild.members.map((member) => {
            const isMemberLeader = member._id === guild.adminID;
            const isMe = member.firebaseUid === currentUser.uid;

            return (
              <div key={member._id} className={`bg-[#161B22] border rounded-2xl p-6 flex items-center gap-4 transition-all relative overflow-hidden group ${isMemberLeader ? 'border-yellow-500/30' : 'border-white/5 hover:border-white/10'}`}>
                {isMemberLeader && <div className="absolute top-0 right-0 bg-yellow-500 text-[#0B0E14] text-[9px] font-black px-3 py-1 uppercase tracking-tighter rounded-bl-lg shadow-lg">Leader</div>}

                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xl shrink-0 ${isMemberLeader ? 'bg-gradient-to-br from-yellow-400 to-amber-600' : 'bg-[#0B0E14] border border-white/5'}`}>
                  {member.username.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{member.username} {isMe && <span className="text-[10px] text-purple-500 ml-1 font-mono">(YOU)</span>}</h3>
                  <div className="flex gap-3 mt-1">
                    <span className="text-slate-500 font-mono text-[10px] uppercase">Lvl {member.level || 1}</span>
                    <span className="text-emerald-500 font-mono text-[10px] uppercase font-bold">{member.xp || 0} XP</span>
                  </div>
                </div>

                {/* Kick Action (Leader Only) */}
                {isLeader && !isMemberLeader && (
                  <button 
                    onClick={() => handleKickMember(member._id)}
                    className="p-2 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <UserMinus size={20} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default MyGuild;