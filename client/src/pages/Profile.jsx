import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Zap, Award, Clock } from 'lucide-react';

const Profile = () => {
  const { currentUser } = useAuth();
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${currentUser.uid}`);
        setPlayerData(response.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to locate your adventurer records.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  if (loading) {
    return <div className="min-h-screen bg-[#0B0E14] text-purple-500 font-mono animate-pulse flex items-center justify-center">Loading Profile...</div>;
  }

  if (error || !playerData) {
    return <div className="min-h-screen bg-[#0B0E14] text-red-500 flex items-center justify-center font-bold">{error || "Profile not found"}</div>;
  }

  // RPG Math: Calculate how much XP is needed for the NEXT level
  // Formula: Next Level requirement = (Current Level)^2 * 100
  const currentLevel = playerData.level || 1;
  const nextLevelXp = Math.pow(currentLevel, 2) * 100; 
  const xpPercentage = Math.min((playerData.xp / nextLevelXp) * 100, 100);

  // Dynamic Badges based on database flags
  const earnedBadges = ["Early Adopter"];
  if (playerData.isQualified) earnedBadges.push("Trial Survivor");
  if (playerData.isInGuild) earnedBadges.push("Team Player");

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header Card */}
        <div className="bg-[#161B22] border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-5xl font-black shadow-lg shadow-purple-500/20 z-10 uppercase">
            {playerData.username[0]}
          </div>
          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="text-4xl font-black text-white">{playerData.username}</h1>
            <p className="text-slate-400 font-mono mb-4">{playerData.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${playerData.isInGuild ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                <Shield size={14}/> {playerData.isInGuild ? 'Sworn to Guild' : 'Freelancer'}
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Zap size={14}/> {playerData.isQualified ? 'Qualified Adventurer' : 'Novice'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Level & XP */}
          <div className="bg-[#161B22] border border-white/10 rounded-3xl p-6 md:col-span-2 shadow-lg">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white"><Award className="text-purple-500"/> Progression</h3>
              <span className="text-purple-400 font-mono font-bold text-lg">Lvl {playerData.level}</span>
            </div>
            <div className="w-full bg-[#0B0E14] h-4 rounded-full overflow-hidden mb-2 border border-white/5">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-500 h-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000" 
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs font-mono font-bold text-slate-500 uppercase tracking-tighter">
              <span className="text-emerald-400">{playerData.xp} XP</span>
              <span>{nextLevelXp} XP (To Lvl {currentLevel + 1})</span>
            </div>
          </div>

          {/* Badge Summary */}
          <div className="bg-[#161B22] border border-white/10 rounded-3xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">Badges Earned</h3>
            <div className="flex flex-wrap gap-3">
              {earnedBadges.map(badge => (
                <div key={badge} className="w-12 h-12 rounded-xl bg-[#0B0E14] border border-white/5 flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/50 transition-all cursor-help group" title={badge}>
                  <Award size={24} className="text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History / Timeline */}
        <div className="bg-[#161B22] border border-white/10 rounded-3xl p-8 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Clock className="text-blue-500"/> Recent Quest Log</h3>
          <div className="space-y-4">
            
            {/* Dynamic Quest logic: Show Preliminary Trial if they passed it */}
            {playerData.isQualified ? (
              <div className="flex items-center justify-between p-4 bg-[#0B0E14] rounded-2xl border border-emerald-500/20 hover:border-emerald-500/50 transition-colors">
                <div>
                  <p className="font-bold text-white">The Preliminary Trial</p>
                  <p className="text-xs text-slate-500">GuildDev Entry Test</p>
                </div>
                <div className="text-emerald-400 font-mono font-bold">+100 XP</div>
              </div>
            ) : (
              <div className="text-center p-6 bg-[#0B0E14] rounded-2xl border border-dashed border-white/10 text-slate-500">
                Your quest log is empty. Visit the Dashboard to begin your journey!
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;