import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Swords, User as UserIcon, Users, Lock, ChevronRight, Loader, ArrowLeft } from 'lucide-react';

const QuestBoard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the user's profile to check if they are in a guild
        const userRes = await axios.get(`http://localhost:5000/api/user/${currentUser.uid}`);
        setPlayerData(userRes.data);

        // Fetch all active quests
        const questRes = await axios.get('http://localhost:5000/api/challenges');
        setChallenges(questRes.data);
      } catch (error) {
        console.error("Failed to load Quest Board data", error);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchData();
  }, [currentUser]);

  if (loading) {
    return <div className="min-h-screen bg-[#0B0E14] flex justify-center items-center"><Loader className="animate-spin text-purple-500" size={48} /></div>;
  }

  // --- ROUTING LOGIC ---
  // If they aren't qualified, immediately redirect them to your existing Preliminary Quest!
  if (playerData && !playerData.isQualified) {
    navigate('/preliminary-quest');
    return null; 
  }

  const handleAcceptQuest = (challenge) => {
    if (challenge.challengeType === 'guild') {
      navigate(`/workspace/${playerData.guildID}`, { state: { activeQuestId: challenge._id } });
    } else {
      // Point directly to the new dedicated Solo Workspace route
      navigate('/solo-workspace', { state: { activeQuestId: challenge._id } }); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-purple-400 transition-colors flex items-center gap-2 font-bold mb-8 uppercase tracking-widest text-xs">
                  <ArrowLeft size={14} /> Return to Hub
        </button>

        <header className="mb-12 border-b border-white/10 pb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/30">
              <Swords size={32} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-widest uppercase">The Quest Board</h1>
              <p className="text-slate-400 mt-2 text-sm md:text-base">Accept active bounties, solve algorithmic trials, and earn XP for your Guild.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- SOLO QUESTS COLUMN --- */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
              <UserIcon className="text-emerald-500" /> Freelancer Contracts (Solo)
            </h2>
            <div className="space-y-4">
              {challenges.filter(c => c.challengeType === 'solo').map(quest => (
                <div key={quest._id} className="bg-[#161B22] border border-white/10 p-6 rounded-2xl hover:border-emerald-500/50 transition-colors shadow-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-black text-white">{quest.title}</h3>
                    <span className="bg-emerald-500/10 text-emerald-400 font-mono font-bold px-3 py-1 rounded-full text-xs border border-emerald-500/20">
                      +{quest.totalXP} XP
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-6">{quest.description}</p>
                  <button 
                    onClick={() => handleAcceptQuest(quest)}
                    className="w-full bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 py-3 rounded-xl font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-2 text-sm"
                  >
                    Accept Contract <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* --- GUILD QUESTS COLUMN --- */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
              <Users className="text-amber-500" /> Guild Campaigns
            </h2>
            <div className="space-y-4">
              {challenges.filter(c => c.challengeType === 'guild').map(quest => {
                const isLocked = !playerData.isInGuild;

                return (
                  <div key={quest._id} className={`bg-[#161B22] border p-6 rounded-2xl transition-colors shadow-lg relative overflow-hidden ${isLocked ? 'border-slate-800 opacity-75' : 'border-white/10 hover:border-amber-500/50'}`}>
                    
                    {/* Visual Lock Overlay for unqualified users */}
                    {isLocked && (
                      <div className="absolute top-0 right-0 bg-slate-900/90 text-slate-400 p-2 rounded-bl-2xl border-b border-l border-slate-800 flex items-center gap-2 text-xs font-bold uppercase tracking-widest z-10">
                        <Lock size={12} /> Guild Required
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-black text-white pr-24">{quest.title}</h3>
                      <span className="bg-amber-500/10 text-amber-400 font-mono font-bold px-3 py-1 rounded-full text-xs border border-amber-500/20 shrink-0">
                        +{quest.totalXP} XP
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-6 line-clamp-2">{quest.description}</p>
                    
                    <button 
                      onClick={() => handleAcceptQuest(quest)}
                      disabled={isLocked}
                      className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-2 text-sm border
                        ${isLocked 
                          ? 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed' 
                          : 'bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-[#0B0E14] border-amber-500/30'
                        }`}
                    >
                      {isLocked ? 'Locked' : 'Assemble Guild'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuestBoard;