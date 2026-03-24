import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Terminal, ArrowLeft } from 'lucide-react';

const MyGuild = () => {
  const { id } = useParams(); // The guild ID from the URL
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [guild, setGuild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    const fetchGuildData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/guilds/${id}`);
        setGuild(response.data);
      } catch (err) {
        console.error(err);
        setError("Could not locate this Guild Hall.");
      } finally {
        setLoading(false);
      }
    };

    fetchGuildData();
  }, [id, currentUser, navigate]);

  if (loading) return <div className="min-h-screen bg-[#0B0E14] text-purple-500 flex items-center justify-center animate-pulse font-mono">Unlocking Guild Hall...</div>;
  if (error) return <div className="min-h-screen bg-[#0B0E14] text-red-500 flex items-center justify-center font-bold">{error}</div>;
  if (!guild) return null;

  // Calculate the total power of the guild
  const totalGuildXP = guild.members.reduce((sum, member) => sum + (member.xp || 0), 0);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-slate-500 hover:text-purple-400 transition-colors flex items-center gap-2 font-bold mb-8 uppercase tracking-widest text-sm"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Guild Header Banner */}
        <div className="bg-[#161B22] border border-purple-500/30 rounded-3xl p-10 mb-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="text-purple-500" size={32} />
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase">{guild.guildName}</h1>
              </div>
              <p className="text-slate-400 text-lg max-w-xl mb-4">{guild.guildDescription}</p>
              <div className="flex gap-4">
                <span className="bg-[#0B0E14] text-purple-400 px-4 py-2 rounded-xl text-sm font-mono border border-purple-500/20 flex items-center gap-2">
                  <Users size={16} /> {guild.members.length}/5 Members
                </span>
                <span className="bg-[#0B0E14] text-emerald-400 px-4 py-2 rounded-xl text-sm font-mono border border-emerald-500/20">
                  Total Power: {totalGuildXP} XP
                </span>
              </div>
            </div>

            {/* The Portal to Phase 4! */}
            <button 
              onClick={() => navigate(`/workspace/${guild._id}`)}
              className="bg-purple-600 hover:bg-purple-500 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-white transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-3 hover:scale-105"
            >
              <Terminal size={24} /> Enter The Forge
            </button>
          </div>
        </div>

        {/* Guild Roster */}
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest">Active Roster</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guild.members.map((member) => (
            <div key={member._id} className="bg-[#161B22] border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                {member.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{member.username}</h3>
                <p className="text-slate-400 font-mono text-sm">Level {member.level} • {member.xp} XP</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MyGuild;