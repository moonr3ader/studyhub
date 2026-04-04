import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Award, Clock, LogOut, ShieldAlert, Trophy, Map, Settings, Bell, CheckCircle, Info } from 'lucide-react';

const Dashboard = () => {
  // ==========================================
  // STATE & CONTEXT
  // ==========================================
  const { currentUser, logout } = useAuth(); 
  const navigate = useNavigate();
  
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // ==========================================
  // DATA FETCHING & EFFECTS
  // ==========================================
  
  // 1. Fetch Initial Player Data
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!currentUser) return setLoading(false);

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

  // 2. Daily Scroll Cooldown Timer
  useEffect(() => {
    const updateCountdown = () => {
      if (!playerData?.lastClaimed) return;

      const last = new Date(playerData.lastClaimed).getTime();
      const now = new Date().getTime();
      const cooldown = 24 * 60 * 60 * 1000;
      const remaining = cooldown - (now - last);

      if (remaining <= 0) {
        setTimeLeft(""); 
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [playerData?.lastClaimed]);


  // ==========================================
  // HANDLERS
  // ==========================================

  const handleLogout = async () => {
    try {
      await logout(); 
      navigate('/');
    } catch (error) {
      console.error("Failed to log out of the Guild:", error);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await axios.put(`http://localhost:5000/api/user/${currentUser.uid}/notifications/clear`);
      setPlayerData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, isRead: true }))
      }));
      setShowNotifications(false);
    } catch (err) {
      console.error("Failed to clear notifications");
    }
  };

  const claimDailyReward = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/user/award-xp', {
        uid: currentUser.uid,
        xpToAdd: 50
      });

      if (response.data.success) {
        setPlayerData(prev => ({
          ...prev,
          xp: response.data.newXp,
          level: response.data.newLevel,
          lastClaimed: response.data.lastClaimed 
        }));

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

  // ==========================================
  // RPG MATH & LOGIC
  // ==========================================
  
  const canClaim = () => {
    if (!playerData?.lastClaimed) return true;
    const last = new Date(playerData.lastClaimed).getTime();
    const now = new Date().getTime();
    return (now - last) >= (24 * 60 * 60 * 1000);
  };

  const isButtonLocked = !canClaim();
  const currentLevel = playerData?.level || 1;
  const nextLevelXp = Math.pow(currentLevel, 2) * 100; 
  const xpPercentage = playerData ? Math.min((playerData.xp / nextLevelXp) * 100, 100) : 0;
  const isPending = playerData?.pendingGuildID;


  // ==========================================
  // RENDER BLOCKS (LOADING & ERRORS)
  // ==========================================
  
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
        <button onClick={() => navigate('/preliminary-quest')} className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-bold transition-all">
          Complete the Preliminary Quest
        </button>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  
  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 flex flex-col items-center">
      
      {/* --- TOP NAVIGATION BAR --- */}
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
        
        {/* --- DASHBOARD HEADER --- */}
        <header className="mb-10 flex justify-between items-start relative z-50">
          
          {/* Left Side: Welcome Text */}
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white flex flex-wrap items-center gap-3">
              Welcome back, 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                {playerData.username}
              </span>
              
              {playerData.isAdmin && (
                <span className="hidden md:inline-block bg-red-500/20 text-red-500 border border-red-500/50 text-[10px] uppercase tracking-widest px-2 py-1 rounded-md shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                  System Admin
                </span>
              )}
            </h1>
            <p className="text-slate-400 font-mono mt-2 text-sm md:text-base">
              Level {playerData.level} Adventurer • {playerData.xp.toLocaleString()} Total XP
            </p>
          </div>

          {/* Right Side: Actions (Notifications & Admin) */}
          <div className="flex items-center gap-3">
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 rounded-xl bg-[#161B22] border border-white/10 hover:border-amber-500/50 transition-colors group shadow-lg"
              >
                <Bell size={20} className={playerData?.notifications?.some(n => !n.isRead) ? "text-amber-500 animate-pulse" : "text-slate-400"} />
                {playerData?.notifications?.some(n => !n.isRead) && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#0B0E14]"></span>
                )}
              </button>

              {/* Dropdown Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-72 md:w-80 bg-[#161B22] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden origin-top-right">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0B0E14]/50">
                    <h4 className="font-bold text-white text-sm">Realm Alerts</h4>
                    <button onClick={handleClearNotifications} className="text-xs text-slate-400 hover:text-white transition-colors">Mark all read</button>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {playerData?.notifications?.filter(n => !n.isRead).length > 0 ? (
                      playerData.notifications.filter(n => !n.isRead).map((notif, idx) => (
                        <div key={idx} className="p-4 border-b border-white/5 flex gap-3 hover:bg-white/[0.02] transition-colors">
                          <div className="mt-0.5 shrink-0">
                            {notif.type === 'success' && <CheckCircle size={16} className="text-emerald-500" />}
                            {notif.type === 'warning' && <ShieldAlert size={16} className="text-red-500" />}
                            {notif.type === 'info' && <Info size={16} className="text-blue-500" />}
                          </div>
                          <p className="text-sm text-slate-300 leading-snug">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-500 text-sm italic">
                        All is quiet in the realm.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Button (Mobile hides text) */}
            {playerData.isAdmin && (
              <button 
                onClick={() => navigate('/admin')} 
                className="bg-red-600 hover:bg-red-500 text-white p-3 md:px-5 md:py-2.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] active:scale-95 flex items-center gap-2"
                title="Admin Console"
              >
                <ShieldAlert size={20} className="md:w-4 md:h-4" /> 
                <span className="hidden md:inline">Admin Console</span>
              </button>
            )}
          </div>
        </header>

        {/* --- ACTION/STATUS CARD --- */}
        <div className="mb-10">
          {isPending ? (
            <section className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 p-6 md:p-8 rounded-3xl border border-yellow-500/30 shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-black mb-2 text-white">Status: Application Sent</h3>
                  <p className="text-slate-400 max-w-lg">The Guild Leader is currently reviewing your credentials. You will be notified once they accept your oath.</p>
                </div>
                <button disabled className="bg-yellow-600/20 text-yellow-500 border border-yellow-500/50 px-8 py-4 rounded-xl font-black uppercase tracking-widest cursor-wait w-full md:w-auto">
                  Pending Approval
                </button>
              </div>
            </section>
          ) : !playerData.isQualified ? (
            <section className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6 md:p-8 rounded-3xl border border-purple-500/30 shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-black mb-2 text-white">The Preliminary Trial</h3>
                <p className="text-slate-400 mb-6 max-w-lg text-sm md:text-base">Complete the coding challenge to unlock the platform.</p>
                <button onClick={() => navigate('/preliminary-quest')} className="inline-block bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  Begin Quest
                </button>
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
                  <button onClick={() => navigate('/guilds')} className="w-full sm:w-auto bg-[#0B0E14] border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 px-6 py-4 rounded-xl font-black uppercase tracking-widest transition-all">
                    Guild Hub
                  </button>
                  {playerData.isInGuild && playerData.guildID ? (
                    <button onClick={() => navigate(`/guild/${playerData.guildID}`)} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]">
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

        {/* --- PROGRESSION & TROPHIES --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* XP Bar */}
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
                  {isButtonLocked ? `⏳ Recharging (${timeLeft})` : "✨ Claim Daily Scroll (+50 XP)"}
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

          {/* Trophy Room */}
          <div className="bg-[#161B22] border border-white/10 rounded-3xl p-6 md:p-8 shadow-lg">
            <h3 className="text-lg md:text-xl font-black text-white mb-6 uppercase tracking-widest">Trophy Room</h3>
            <div className="flex flex-wrap gap-6 md:gap-8">
              {playerData.badges && playerData.badges.length > 0 ? (
                playerData.badges.map(badge => (
                  <div key={badge._id} className="flex flex-col items-center gap-2 w-20 group cursor-help" title={`Achievement: ${badge.badgeDescription}`}>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#0B0E14] border border-purple-500/30 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:border-purple-500/60 transition-all shadow-md shadow-purple-500/10">
                      <Award className="w-6 h-6 md:w-7 md:h-7 text-purple-400 group-hover:scale-110 group-hover:-rotate-12 transition-all" />
                    </div>
                    <span className="text-[10px] text-center font-bold text-slate-400 uppercase leading-tight group-hover:text-purple-400 transition-colors">
                      {badge.badgeTitle}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 font-mono text-sm italic w-full text-center py-4">
                  Your trophy room is empty.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- QUEST LOG --- */}
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
        
        {/* --- REALM FACILITIES --- */}
        <section className="mt-10">
          <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
            <Map className="text-purple-500" size={24} /> Realm Facilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={() => navigate('/quest')}
              className="bg-[#161B22] border border-white/5 hover:border-purple-500/50 rounded-3xl p-6 cursor-pointer group transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
              <Map className="text-purple-500 w-10 h-10 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Quest Board</h3>
              <p className="text-slate-400 text-sm leading-relaxed">View daily bounties, special events, and claim your hard-earned XP.</p>
            </div>
            
            <div onClick={() => navigate('/leaderboard')}
              className="bg-[#161B22] border border-white/5 hover:border-yellow-500/50 rounded-3xl p-6 cursor-pointer group transition-all hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-colors"></div>
              <Trophy className="text-yellow-500 w-10 h-10 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Hall of Fame</h3>
              <p className="text-slate-400 text-sm leading-relaxed">See how you rank against the greatest adventurers and guilds in the realm.</p>
            </div>
            
            <div onClick={() => navigate('/settings')}
              className="bg-[#161B22] border border-white/5 hover:border-slate-400/50 rounded-3xl p-6 cursor-pointer group transition-all hover:shadow-[0_0_30px_rgba(148,163,184,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-full blur-3xl group-hover:bg-slate-500/10 transition-colors"></div>
              <Settings className="text-slate-400 w-10 h-10 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Preferences</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Manage your account, update your sigil, and configure your UI settings.</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;