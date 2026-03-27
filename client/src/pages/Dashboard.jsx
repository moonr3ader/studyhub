import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Award, Clock, LogOut, ShieldAlert } from 'lucide-react';

const Dashboard = () => {
  const { currentUser, logout } = useAuth(); 
  const navigate = useNavigate();
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
      navigate('/');
    } catch (error) {
      console.error("Failed to log out of the Guild:", error);
    }
  };

  // --- CLAIM DAILY REWARD LOGIC ---
  const claimDailyReward = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/user/award-xp', {
        uid: currentUser.uid,
        xpToAdd: 50
      });

      if (response.data.success) {
        setPlayerData({
          ...playerData,
          xp: response.data.newXp,
          level: response.data.newLevel,
          lastClaimed: response.data.lastClaimed // Update timestamp from server
        });

        if (response.data.leveledUp) {
          alert(`✨ LEVEL UP! You reached Level ${response.data.newLevel}!`);
        } else {
          alert("📜 50 XP added to your records.");
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || "The Scroll is currently out of reach.");
    }
  };

  // Countdown State & Effect
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    // Function to calculate the string "Xh Ym"
    const updateCountdown = () => {
      if (!playerData?.lastClaimed) return;

      const last = new Date(playerData.lastClaimed).getTime();
      const now = new Date().getTime();
      const cooldown = 24 * 60 * 60 * 1000;
      const remaining = cooldown - (now - last);

      if (remaining <= 0) {
        setTimeLeft(""); // Timer finished
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    };

    // Run once on mount and then every minute
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);

    return () => clearInterval(timer);
  }, [playerData?.lastClaimed]);

  // Helper to check if button should be locked
  const canClaim = () => {
    if (!playerData?.lastClaimed) return true;
    const last = new Date(playerData.lastClaimed).getTime();
    const now = new Date().getTime();
    const cooldown = 24 * 60 * 60 * 1000;
    return (now - last) >= cooldown;
  };

  const isButtonLocked = !canClaim();

  // 2. CONDITIONAL RENDERING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="text-purple-500 font-mono animate-pulse">Loading Guild Data...</div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-slate-400 mb-4">Your adventurer card is missing from our records.</p>
        <a href="/quest" className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-bold transition-all">
          Complete the Preliminary Quest
        </a>
      </div>
    );
  }

  // 3. RPG MATH
  const currentLevel = playerData.level || 1;
  const nextLevelXp = Math.pow(currentLevel, 2) * 100; 
  const xpPercentage = Math.min((playerData.xp / nextLevelXp) * 100, 100);

  const earnedBadges = ["Early Adopter"];
  if (playerData.isQualified) earnedBadges.push("Trial Survivor");
  if (playerData.isInGuild) earnedBadges.push("Team Player");

  // Self-Note: Add 'pendingGuildID' to the check. 
  // If they have this, they aren't 'Qualified' anymore, but they aren't 'In a Guild' yet.

  const isPending = playerData.pendingGuildID;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 flex flex-col items-center">
      
      {/* TOP NAVIGATION BAR */}
      <nav className="w-full max-w-6xl mx-auto flex justify-between items-center p-6 border-b border-white/5">
        <h2 className="text-2xl font-black text-white italic tracking-tighter cursor-default">
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

      <main className="w-full max-w-6xl p-6 md:p-10 flex-1">
        
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
              Welcome back, 
              <span className="text-purple-500">{playerData.username}</span>
              
              {/* THE ADMIN BADGE */}
              {playerData.isAdmin && (
                <span className="bg-red-500/20 text-red-500 border border-red-500/50 text-[10px] uppercase tracking-widest px-2 py-1 rounded-md shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                  System Admin
                </span>
              )}
            </h1>
            <p className="text-slate-400 font-mono mt-2 text-sm md:text-base">
              Level {playerData.level} Adventurer • {playerData.xp.toLocaleString()} Total XP
            </p>
          </div>
          
          {/* The secret button that only appears for you */}
          {playerData.isAdmin && (
             <button 
                onClick={() => navigate('/admin')} 
                className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] active:scale-95 flex items-center gap-2"
             >
               <ShieldAlert size={16} /> Admin Console
             </button>
          )}
        </header>

        {/* Action Card */}
        <div className="mb-10">
          {isPending ? (
            <section className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 p-6 md:p-8 rounded-3xl border border-yellow-500/30 shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-black mb-2 text-white">Status: Application Sent</h3>
                  <p className="text-slate-400 max-w-lg">The Guild Leader is currently reviewing your credentials. You will be notified once they accept your oath.</p>
                </div>
                <button disabled className="bg-yellow-600/20 text-yellow-500 border border-yellow-500/50 px-8 py-4 rounded-xl font-black uppercase tracking-widest cursor-wait">
                  Pending Approval
                </button>
              </div>
            </section>
          ) : !playerData.isQualified ? (
            <section className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6 md:p-8 rounded-3xl border border-purple-500/30 shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-black mb-2 text-white">The Preliminary Trial</h3>
                <p className="text-slate-400 mb-6 max-w-lg text-sm md:text-base">Complete the coding challenge to unlock the platform.</p>
                <a href="/quest" className="inline-block bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  Begin Quest
                </a>
              </div>
            </section>
          ) : (
            <section className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 p-6 md:p-8 rounded-3xl border border-emerald-500/30 shadow-lg relative overflow-hidden">
               <div className="relative z-10 flex flex-col xl:flex-row justify-between xl:items-center gap-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-black mb-2 text-white">
                    Status: {playerData.isInGuild ? 'Sworn to a Guild' : 'Qualified Freelancer'}
                  </h3>
                  <p className="text-slate-400 max-w-xl text-sm md:text-base mt-2">
                    {playerData.isInGuild 
                      ? "Head to your Guild Hall to collaborate with your team."
                      : "Visit the Guild Hub to find your squad or forge your own clan."}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                  <button onClick={() => window.location.href = '/guilds'} className="w-full sm:w-auto bg-[#0B0E14] border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 px-6 py-4 rounded-xl font-black uppercase tracking-widest transition-all">
                    Guild Hub
                  </button>
                  {playerData.isInGuild && playerData.guildID ? (
                    <button onClick={() => window.location.href = `/guild/${playerData.guildID}`} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                      Enter My Guild
                    </button>
                  ) : (
                    <button disabled className="w-full sm:w-auto bg-slate-800/50 border border-slate-700/50 text-slate-500 px-8 py-4 rounded-xl font-black uppercase tracking-widest cursor-not-allowed">
                      My Guild (Locked)
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* PROGRESS & STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#161B22] border border-white/10 rounded-3xl p-6 md:p-8 lg:col-span-2 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-2">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg md:text-xl font-black flex items-center gap-2 text-white uppercase tracking-widest">
                  <Award className="text-purple-500"/> Progression
                </h3>
                <button onClick={claimDailyReward} disabled={isButtonLocked} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg w-fit transition-all mt-2 
                    ${isButtonLocked 
                      ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed' 
                      : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 active:scale-95 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                    }`}
                >
                  {isButtonLocked 
                    ? `⏳ Recharging (${timeLeft})` 
                    : "✨ Claim Daily Scroll (+50 XP)"
                  }
                </button>
              </div>
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

        {/* Quest Log */}
        <div className="bg-[#161B22] border border-white/10 rounded-3xl p-6 md:p-8 shadow-lg">
          <h3 className="text-lg md:text-xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
            <Clock className="text-blue-500"/> Recent Quest Log
          </h3>
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