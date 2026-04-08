import React, { useState } from 'react';
import { Award, Compass, Shield, Scroll, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OnboardingChecklist = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // 1. Create a unique memory key for this specific user
  const sessionKey = `hideChecklist_${currentUser?.uid}`;

  // 2. Check memory BEFORE deciding if it should be visible
  const [isVisible, setIsVisible] = useState(() => {
    // If memory says 'true', start as false (hidden). Otherwise, true (visible).
    return sessionStorage.getItem(sessionKey) !== 'true';
  });

  // 3. Custom dismiss function to hide UI and save to memory
  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(sessionKey, 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="w-full mb-10 bg-[#161B22] border border-purple-500/30 rounded-3xl p-6 md:p-8 relative shadow-[0_0_20px_rgba(168,85,247,0.1)]">
      
      {/* Dismiss Button - Updated to use handleDismiss */}
      <button 
        onClick={handleDismiss}
        className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-500 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {/* Header section */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
          <Award className="text-white" size={28} />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-black text-white leading-tight mb-1">
            Adventurer's Checklist
          </h3>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl">
            Congratulations on passing the preliminary trial! Complete these steps to fully establish your presence in the realm.
          </p>
        </div>
      </div>

      {/* Action Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
        
        {/* Step 1 */}
        <div 
          onClick={() => navigate('/quest')}
          className="flex items-start gap-4 p-5 rounded-2xl bg-[#0B0E14] border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all group"
        >
          <div className="mt-1 shrink-0">
            <Scroll className="text-emerald-400 group-hover:scale-110 transition-transform" size={24} />
          </div>
          <div>
            <h4 className="text-sm md:text-base font-bold text-white mb-1">Consult the Quest Board</h4>
            <p className="text-xs md:text-sm text-slate-400">Pick up your first Solo Bounty to test your skills and earn early XP.</p>
          </div>
        </div>

        {/* Step 2 */}
        <div 
          onClick={() => navigate('/guilds')}
          className="flex items-start gap-4 p-5 rounded-2xl bg-[#0B0E14] border border-white/5 hover:border-blue-500/30 cursor-pointer transition-all group"
        >
          <div className="mt-1 shrink-0">
            <Shield className="text-blue-400 group-hover:scale-110 transition-transform" size={24} />
          </div>
          <div>
            <h4 className="text-sm md:text-base font-bold text-white mb-1">Visit the Guild Hub</h4>
            <p className="text-xs md:text-sm text-slate-400">Adventuring alone is dangerous. Forge a new guild or apply to join an existing one.</p>
          </div>
        </div>

        {/* Step 3 */}
        <div 
          onClick={() => navigate(`/profile/${currentUser?.uid}`)}
          className="flex items-start gap-4 p-5 rounded-2xl bg-[#0B0E14] border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all group"
        >
          <div className="mt-1 shrink-0">
            <Compass className="text-amber-400 group-hover:scale-110 transition-transform" size={24} />
          </div>
          <div>
            <h4 className="text-sm md:text-base font-bold text-white mb-1">Check Your Stats</h4>
            <p className="text-xs md:text-sm text-slate-400">View your new "Trial Survivor" badge and track your progression to the next level.</p>
          </div>
        </div>

      </div>

      {/* Bottom Action - Updated to use handleDismiss */}
      <button 
        onClick={handleDismiss}
        className="w-full md:w-auto px-8 py-3 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/50 hover:border-purple-400 text-sm font-bold tracking-widest uppercase transition-all"
      >
        I've got it from here
      </button>

    </div>
  );
};

export default OnboardingChecklist;