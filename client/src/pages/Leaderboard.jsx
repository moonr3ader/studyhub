import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Crown, Users, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Leaderboard = () => {
  const [guilds, setGuilds] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const [guildRes, playerRes] = await Promise.all([
          axios.get('http://localhost:5000/api/guilds/leaderboard'),
          axios.get('http://localhost:5000/api/users/leaderboard')
        ]);
        setGuilds(guildRes.data);
        setPlayers(playerRes.data);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  const RankIcon = ({ rank }) => {
    if (rank === 1) return <Crown className="text-yellow-500 w-6 h-6" />;
    if (rank === 2) return <Medal className="text-slate-400 w-6 h-6" />;
    if (rank === 3) return <Medal className="text-amber-600 w-6 h-6" />;
    return <span className="font-bold text-slate-500">#{rank}</span>;
  };

  if (loading) return <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-purple-500 font-mono">Consulting the Elders...</div>;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation */}
        <button onClick={() => navigate('/dashboard')} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <Trophy className="text-yellow-500 w-16 h-16 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Hall of Fame</h1>
          <p className="text-slate-400 mt-2">The legends of the GuildDev realm.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          
          {/* GUILD RANKINGS */}
          <section>
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <Users className="text-purple-500" /> Top Guilds
            </h2>
            <div className="bg-[#161B22] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#0B0E14]/50 text-xs uppercase text-slate-500 border-b border-white/5">
                    <th className="p-4 text-center">Rank</th>
                    <th className="p-4">Guild</th>
                    <th className="p-4 text-right">Total XP</th>
                  </tr>
                </thead>
                <tbody>
                  {guilds.length > 0 ? guilds.map((guild, i) => (
                    <tr key={guild._id || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 text-center"><RankIcon rank={i + 1} /></td>
                      {/* Use guildName OR name as a fallback */}
                      <td className="p-4 font-bold text-white">{guild.guildName || guild.name || "Unknown Guild"}</td>
                      <td className="p-4 text-right font-mono text-emerald-400 font-bold">
                        {(guild.totalXP || 0).toLocaleString()} XP
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="p-10 text-center text-slate-500 italic">No Guilds found in the archives.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* PLAYER RANKINGS */}
          <section>
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <User className="text-blue-500" /> Top Adventurers
            </h2>
            <div className="bg-[#161B22] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#0B0E14]/50 text-xs uppercase text-slate-500 border-b border-white/5">
                    <th className="p-4 text-center">Rank</th>
                    <th className="p-4">Player</th>
                    <th className="p-4 text-center">Lvl</th>
                    <th className="p-4 text-right">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {players.length > 0 ? players.map((player, i) => (
                    <tr key={player._id || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 text-center"><RankIcon rank={i + 1} /></td>
                      {/* Interactive Profile Link */}
                      <td 
                        className="p-4 font-bold text-white cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() => navigate(`/profile/${player.firebaseUid}`)}
                        title={`Inspect ${player.username}'s Profile`}
                      >
                        {player.username || "Anonymous"}
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20">
                          Lvl {player.level || 1}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono text-blue-400 font-bold">
                        {(player.xp || 0).toLocaleString()} XP
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="p-10 text-center text-slate-500 italic">No Adventurers have claimed glory yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Leaderboard;