import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Award, Clock, LogOut } from 'lucide-react'; // Replaced Menu/X with LogOut

const Dashboard = () => {
  const { currentUser, logout } = useAuth(); 
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. DATA FETCHING
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!currentUser) {
        setLoading(false);
        return; 
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/user/${currentUser.uid}`);
        setPlayerData(response.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout(); 
      window.location.href = '/'; 
    } catch (error) {
      console.error("Failed to log out of the Guild:", error);
    }
  };

  // 2. CONDITIONAL RENDERING (Guards)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="text-purple-500 font-mono animate-pulse">Loading Guild Data...</div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-slate-400 mb-4">Your adventurer card is missing from our records.</p>
        <a href="/quest" className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-bold transition-all">
          Complete the Preliminary Quest
        </a>
      </div>
    );
  }

  // 3. RPG MATH & LOGIC
  const currentLevel = playerData.level || 1;
  const nextLevelXp = Math.pow(currentLevel, 2) * 100; 
  const xpPercentage = Math.min((playerData.xp / nextLevelXp) * 100, 100);

  const earnedBadges = ["Early Adopter"];
  if (playerData.isQualified) earnedBadges.push("Trial Survivor");
  if (playerData.isInGuild) earnedBadges.push("Team Player");

  // 4. MAIN DASHBOARD UI
  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 flex flex-col items-center">
      
      {/* TOP NAVIGATION BAR */}
      <nav className="w-full max-w-6xl mx-auto flex justify-between items-center p-6 border-b border-white/5">
        <h2 className="text-2xl font-black text-white italic tracking-tighter">
          Guild<span className="text-purple-500">Dev</span>
        </h2>
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-slate-500 hover:text-red-400 transition-colors"
        >
          <span className="hidden sm:inline">Log Out</span>
          <LogOut size={18} />
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="w-full max-w-6xl p-6 md:p-10 flex-1">
        
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Welcome back, <br className="md:hidden" />
            <span className="text-purple-500">{playerData.username}</span>
          </h1>
          <p className="text-slate-400 font-mono mt-2 text-sm md:text-base">
            Level {playerData.level} Adventurer • {playerData.xp} Total XP
          </p>
        </header>

        {/* Dynamic Action Card (Quest vs Guild Hub) */}
        <div className="mb-10">
          {!playerData.isQualified ? (
            <section className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6 md:p-8 rounded-3xl border border-purple-500/30 shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-black mb-2 text-white">The Preliminary Trial</h3>
                <p className="text-slate-400 mb-6 max-w-lg text-sm md:text-base">You must prove your skill before joining a Guild. Complete the coding challenge to unlock the rest of the platform.</p>
                <a href="/quest" className="inline-block bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] text-sm md:text-base">
                  Begin Level 0 Quest
                </a>
              </div>
            </section>
          ) : (
            <section className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 p-6 md:p-8 rounded-3xl border border-emerald-500/30 shadow-lg relative overflow-hidden">
               <div className="relative z-10 flex flex-col xl:flex-row justify-between xl:items-center gap-6">
                
                {/* Dynamic Text based on Guild Status */}
                <div>
                  <h3 className="text-xl md:text-2xl font-black mb-2 text-white">
                    Status: {playerData.isInGuild ? 'Sworn to a Guild' : 'Qualified Freelancer'}
                  </h3>
                  <p className="text-slate-400 max-w-xl text-sm md:text-base mt-2">
                    {playerData.isInGuild 
                      ? "You are an active member of a Guild. Head to your Guild Hall to collaborate with your team, or visit the Hub to scout the competition."
                      : "You are ready to join a team. Visit the Guild Hub to find your squad or forge your own clan."}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                  
                  {/* Always-on Hub Button */}
                  <button 
                    onClick={() => window.location.href = '/guilds'}
                    className="w-full sm:w-auto bg-[#0B0E14] border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 px-6 py-4 rounded-xl font-black uppercase tracking-widest transition-all text-center text-sm md:text-base"
                  >
                    Guild Hub
                  </button>

                  {/* Dynamic Guild Hall Button */}
                  {playerData.isInGuild && playerData.guildID ? (
                    <button 
                      onClick={() => window.location.href = `/guild/${playerData.guildID}`}
                      className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] text-center text-sm md:text-base"
                    >
                      Enter My Guild
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full sm:w-auto bg-slate-800/50 border border-slate-700/50 text-slate-500 px-8 py-4 rounded-xl font-black uppercase tracking-widest cursor-not-allowed text-center text-sm md:text-base flex items-center justify-center gap-2"
                    >
                      My Guild <span className="text-xs">(Locked)</span>
                    </button>
                  )}
                  
                </div>
              </div>
            </section>
          )}
        </div>

        {/* --- INJECTED PROFILE STATS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* Level & XP Progress Bar */}
          <div className="bg-[#161B22] border border-white/10 rounded-3xl p-6 md:p-8 lg:col-span-2 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-2">
              <h3 className="text-lg md:text-xl font-black flex items-center gap-2 text-white uppercase tracking-widest"><Award className="text-purple-500"/> Progression</h3>
              <span className="text-purple-400 font-mono font-bold text-lg md:text-xl">Lvl {playerData.level}</span>
            </div>
            <div className="w-full bg-[#0B0E14] h-6 rounded-full overflow-hidden mb-3 border border-white/5 shadow-inner">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-500 h-full shadow-[0_0_15px_rgba(168,85,247,0.6)] transition-all duration-1000" 
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between text-xs md:text-sm font-mono font-bold text-slate-500 uppercase tracking-tighter gap-1">
              <span className="text-emerald-400">{playerData.xp} XP Earned</span>
              <span>{nextLevelXp} XP (To Lvl {currentLevel + 1})</span>
            </div>
          </div>

          {/* Badge Summary */}
          <div className="bg-[#161B22] border border-white/10 rounded-3xl p-6 md:p-8 shadow-lg">
            <h3 className="text-lg md:text-xl font-black text-white mb-6 uppercase tracking-widest">Badges</h3>
            <div className="flex flex-wrap gap-4">
              {earnedBadges.map(badge => (
                <div key={badge} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#0B0E14] border border-white/5 flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/50 transition-all cursor-help group shadow-md" title={badge}>
                  <Award className="w-6 h-6 md:w-7 md:h-7 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Quest Log */}
        <div className="bg-[#161B22] border border-white/10 rounded-3xl p-6 md:p-8 shadow-lg">
          <h3 className="text-lg md:text-xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-widest"><Clock className="text-blue-500"/> Recent Quest Log</h3>
          <div className="space-y-4">
            {playerData.isQualified ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-[#0B0E14] rounded-2xl border border-emerald-500/20 hover:border-emerald-500/50 transition-colors shadow-sm gap-4">
                <div>
                  <p className="font-bold text-white text-base md:text-lg">The Preliminary Trial</p>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">GuildDev Entry Test</p>
                </div>
                <div className="text-emerald-400 font-mono font-black text-sm md:text-lg bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20 self-start sm:self-auto">+100 XP</div>
              </div>
            ) : (
              <div className="text-center p-8 bg-[#0B0E14] rounded-2xl border border-dashed border-white/10 text-slate-500 font-mono text-sm md:text-base">
                Your quest log is empty. Complete the trial above to begin!
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;