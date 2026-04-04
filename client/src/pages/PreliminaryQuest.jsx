import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swords, Sparkles, Calendar, Star, ArrowLeft, CheckCircle, Terminal } from 'lucide-react';

const PreliminaryQuest = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  
// --- QUEST PROGRESSION STATES ---
  const [step, setStep] = useState(1); 
  const [trialData, setTrialData] = useState(null); // Holds the random question
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [trialError, setTrialError] = useState('');
    
  // Initiation State
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  // Daily Quest State
  const [claimStatus, setClaimStatus] = useState('');

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/user/${currentUser.uid}`);
        setPlayerData(res.data);
      } catch (err) {
        if (err.response?.status !== 404) setError("Failed to read user records.");
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchPlayerData();
  }, [currentUser]);

// Fetch a random trial if they are a rookie
  useEffect(() => {
    const fetchTrial = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/questions/random');
        setTrialData(res.data);
      } catch (err) {
        setTrialError("The trial archives are currently sealed.");
      }
    };
    
    // Fetch the trial if we are done loading AND (user doesn't exist OR isn't qualified)
    if (!loading && (!playerData || !playerData.isQualified)) {
      fetchTrial();
    }
  }, [playerData, loading]);

  // ==========================================
  // SCENARIO 1: THE TRIAL OF KNOWLEDGE (MCQ)
  // ==========================================
  const handleTrialSubmit = (e) => {
    e.preventDefault();
    if (!selectedAnswer) {
      return setTrialError("You must make a choice, Adventurer.");
    }
    
    // Find the option the user selected
    const chosenOption = trialData.options.find(opt => opt.id === selectedAnswer);
    
    if (chosenOption && chosenOption.isCorrect) {
      setTrialError('');
      setStep(2); // Advance to Gamertag creation
    } else {
      setTrialError(trialData.failureMessage || "Incorrect. Rethink your strategy.");
    }
  };

  // ==========================================
  // SCENARIO 2: THE INITIATION (GAMERTAG)
  // ==========================================
  const handleInitiation = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/user/qualify', {
        uid: currentUser.uid,
        email: currentUser.email,
        username: username
      });
      setPlayerData(res.data.user); 
      
      // Teleport the user to their new home!
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.error || "Failed to forge identity.");
    }
  };

  // ==========================================
  // SCENARIO 3: DAILY CLAIM (VETERANS)
  // ==========================================
  const handleDailyClaim = async () => {
    setClaimStatus('');
    try {
      const res = await axios.post('http://localhost:5000/api/user/award-xp', {
        uid: currentUser.uid,
        xpToAdd: 50
      });
      setPlayerData({
        ...playerData,
        xp: res.data.newXp,
        level: res.data.newLevel,
        lastClaimed: res.data.lastClaimed
      });
      setClaimStatus('Scroll claimed! +50 XP');
    } catch (err) {
      setClaimStatus(err.response?.data?.error || "Failed to claim scroll.");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0B0E14] text-purple-500 flex items-center justify-center font-mono animate-pulse uppercase tracking-widest">Unrolling Scrolls...</div>;

  // ==========================================
  // VIEW 1: ROOKIE ONBOARDING
  // ==========================================
  if (!playerData || !playerData.isQualified) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-6 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full bg-[#161B22] p-8 md:p-12 rounded-3xl border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
          
          {/* STEP 1: THE TRIAL */}
          {step === 1 && trialData && (
            <div className="animate-fade-in relative z-10">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Terminal className="text-purple-500 w-12 h-12" />
              </div>
              <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2 text-center">Trial of the Weaver</h1>
              
              <div className="bg-[#0B0E14] border border-white/5 rounded-2xl p-6 mb-8 shadow-inner mt-6">
                <p className="text-white font-mono leading-relaxed">
                  <span className="text-purple-400 font-bold">Scenario:</span> {trialData.scenario}
                </p>
              </div>

              {trialError && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm font-bold text-center">{trialError}</div>}

              <form onSubmit={handleTrialSubmit} className="space-y-3">
                {trialData.options.map((option) => (
                  <label key={option.id} className={`block p-4 rounded-xl border cursor-pointer transition-all ${selectedAnswer === option.id ? 'bg-purple-600/20 border-purple-500' : 'bg-[#0B0E14] border-white/10 hover:border-white/30'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="quiz" 
                        value={option.id} 
                        onChange={(e) => setSelectedAnswer(e.target.value)} 
                        className="hidden" 
                      />
                      <div className={`min-w-[20px] h-5 rounded-full border-2 flex items-center justify-center ${selectedAnswer === option.id ? 'border-purple-500' : 'border-slate-600'}`}>
                        {selectedAnswer === option.id && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>}
                      </div>
                      <span className="text-slate-300 font-semibold text-sm">{option.text}</span>
                    </div>
                  </label>
                ))}

                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-transform active:scale-95 mt-6 shadow-lg shadow-purple-500/20">
                  Submit Answer
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: FORGE GAMERTAG */}
          {step === 2 && (
            <div className="animate-fade-in relative z-10 text-center">
              <Swords className="text-emerald-500 w-16 h-16 mx-auto mb-6" />
              <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Trial Passed</h1>
              <p className="text-slate-400 text-sm mb-8">You possess the wisdom of a true collaborator. Now, forge your identity to claim your first 100 XP.</p>
              
              {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm font-bold">{error}</div>}

              <form onSubmit={handleInitiation} className="space-y-4 max-w-sm mx-auto">
                <input 
                  type="text" 
                  placeholder="Enter Gamertag..." 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 text-white text-center font-bold text-lg focus:border-emerald-500 outline-none transition-all"
                  required minLength="3" maxLength="20"
                />
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                  <Sparkles size={18} /> Enter the Realm
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: THE BOUNTY BOARD (VETERANS)
  // ==========================================
  const now = new Date();
  const lastClaimDate = playerData.lastClaimed ? new Date(playerData.lastClaimed) : new Date(0);
  const cooldown = 24 * 60 * 60 * 1000;
  const canClaimDaily = (now - lastClaimDate) >= cooldown;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-purple-400 transition-colors flex items-center gap-2 font-bold mb-8 uppercase tracking-widest text-xs">
          <ArrowLeft size={14} /> Return to Hub
        </button>

        <header className="mb-12 flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#161B22] p-4 rounded-2xl border border-white/10 shadow-lg">
              <Sparkles className="text-purple-400 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Bounty Board</h1>
              <p className="text-slate-500 font-mono text-sm mt-1 uppercase tracking-widest">Complete tasks to increase your power.</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Current Power</p>
            <p className="text-emerald-400 font-black text-xl">{playerData.xp} XP</p>
          </div>
        </header>

        {claimStatus && (
          <div className={`mb-8 p-4 rounded-xl font-bold text-center border ${claimStatus.includes('Failed') || claimStatus.includes('recharging') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            {claimStatus}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DAILY QUEST */}
          <div className={`bg-[#161B22] border rounded-3xl p-8 relative overflow-hidden transition-all ${canClaimDaily ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'border-white/5 opacity-70'}`}>
            <div className="flex items-start justify-between mb-6">
              <Calendar className={canClaimDaily ? "text-purple-500 w-10 h-10" : "text-slate-500 w-10 h-10"} />
              <span className="bg-[#0B0E14] text-emerald-400 font-mono text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">+50 XP</span>
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Daily Login</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">Report to the Guild Hub every 24 hours to claim your daily allocation of experience points.</p>
            
            {canClaimDaily ? (
              <button onClick={handleDailyClaim} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-transform active:scale-95 flex justify-center items-center gap-2">
                <Sparkles size={18} /> Claim Reward
              </button>
            ) : (
              <button disabled className="w-full bg-[#0B0E14] text-slate-500 border border-white/5 py-4 rounded-xl font-black uppercase tracking-widest cursor-not-allowed flex justify-center items-center gap-2">
                <CheckCircle size={18} /> Claimed Today
              </button>
            )}
          </div>

          {/* SPECIAL EVENT */}
          <div className="bg-[#161B22] border border-yellow-500/20 rounded-3xl p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl"></div>
            <div className="flex items-start justify-between mb-6 relative z-10">
              <Star className="text-yellow-500 w-10 h-10" />
              <span className="bg-[#0B0E14] text-emerald-400 font-mono text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">+500 XP</span>
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2 relative z-10">Grand Tournament</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">Participate in the upcoming weekend hackathon event with your guild to earn massive rewards.</p>
            
            <button disabled className="w-full bg-[#0B0E14] text-yellow-500/50 border border-yellow-500/20 py-4 rounded-xl font-black uppercase tracking-widest cursor-not-allowed relative z-10">
              Unlocks in 3 Days
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreliminaryQuest;