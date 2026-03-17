import React from 'react';
import { User, Shield, Zap, Award, Clock } from 'lucide-react';

const Profile = () => {
  // Mock data for UI development
  const userData = {
    username: "Adventurer_One",
    email: "adventurer@guild.dev",
    level: 12,
    xp: 7500,
    nextLevelXp: 10000,
    guild: "Byte Knights",
    badges: ["First Quest", "Bug Squasher", "Team Player"],
    recentQuests: [
      { name: "Trial of the Summoner", date: "2026-03-15", xp: 100 },
      { name: "Logic Loop Hackathon", date: "2026-03-10", xp: 500 }
    ]
  };

  const xpPercentage = (userData.xp / userData.nextLevelXp) * 100;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header Card */}
        <div className="bg-[#161B22] border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-5xl font-black shadow-lg shadow-purple-500/20">
            {userData.username[0]}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-white">{userData.username}</h1>
            <p className="text-slate-400 font-mono mb-4">{userData.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Shield size={14}/> {userData.guild}
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Zap size={14}/> Active Adventurer
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Level & XP */}
          <div className="bg-[#161B22] border border-white/10 rounded-3xl p-6 md:col-span-2">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white"><Award className="text-purple-500"/> Progression</h3>
              <span className="text-slate-500 font-mono text-sm">Lvl {userData.level}</span>
            </div>
            <div className="w-full bg-[#0B0E14] h-4 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-purple-500 h-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000" 
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs font-mono font-bold text-slate-500 uppercase tracking-tighter">
              <span>{userData.xp} XP</span>
              <span>{userData.nextLevelXp} XP (To Lvl {userData.level + 1})</span>
            </div>
          </div>

          {/* Badge Summary */}
          <div className="bg-[#161B22] border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Badges Earned</h3>
            <div className="flex flex-wrap gap-2">
              {userData.badges.map(badge => (
                <div key={badge} className="w-10 h-10 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/50 transition-all cursor-help" title={badge}>
                  <Award size={20} className="text-purple-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History / Timeline */}
        <div className="bg-[#161B22] border border-white/10 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Clock className="text-blue-500"/> Recent Quest Log</h3>
          <div className="space-y-4">
            {userData.recentQuests.map(quest => (
              <div key={quest.name} className="flex items-center justify-between p-4 bg-[#0B0E14] rounded-2xl border border-white/5">
                <div>
                  <p className="font-bold text-white">{quest.name}</p>
                  <p className="text-xs text-slate-500">{quest.date}</p>
                </div>
                <div className="text-emerald-400 font-mono font-bold">+{quest.xp} XP</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;