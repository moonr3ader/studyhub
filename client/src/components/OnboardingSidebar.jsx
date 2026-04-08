import React, { useState } from 'react';
import { Award, Compass, Shield, Scroll, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OnboardingSidebar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <div className="w-full lg:w-80 bg-[#161B22] border border-purple-500/30 rounded-2xl p-6 relative shadow-[0_0_20px_rgba(168,85,247,0.1)]">
      
      {/* Dismiss Button */}
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      {/* Header section */}
      <div className="flex items-start gap-4 mb-8 border-b border-white/5 pb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
          <Award className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-black text-white leading-tight mb-1">
            Trial Complete!
          </h3>
          <p className="text-xs text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={12} /> Rank Upgraded
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-6">
        Congratulations on conquering the Gatekeeper's trial. You are now fully qualified to explore the realm. Here is your adventurer's guide on what to do next:
      </p>

      {/* Action Items */}
      <div className="space-y-4 mb-8">
        
        {/* Step 1 */}
        <div 
          onClick={() => navigate('/quests')}
          className="flex gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
        >
          <div className="mt-1">
            <Scroll className="text-emerald-400 group-hover:scale-110 transition-transform" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Consult the Quest Board</h4>
            <p className="text-xs text-slate-400">Pick up your first Solo Bounty to test your skills and earn early XP.</p>
          </div>
        </div>

        {/* Step 2 */}
        <div 
          onClick={() => navigate('/guilds')}
          className="flex gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
        >
          <div className="mt-1">
            <Shield className="text-blue-400 group-hover:scale-110 transition-transform" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Visit the Guild Hub</h4>
            <p className="text-xs text-slate-400">Adventuring alone is dangerous. Forge a new guild or apply to join an existing one.</p>
          </div>
        </div>

        {/* Step 3 */}
        <div 
          onClick={() => navigate('/profile')}
          className="flex gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
        >
          <div className="mt-1">
            <Compass className="text-amber-400 group-hover:scale-110 transition-transform" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Check Your Stats</h4>
            <p className="text-xs text-slate-400">View your new "Trial Survivor" badge and track your progression to the next level.</p>
          </div>
        </div>

      </div>

      {/* Bottom Action */}
      <button 
        onClick={() => setIsVisible(false)}
        className="w-full py-3 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/50 hover:border-purple-400 text-sm font-bold tracking-widest uppercase transition-all"
      >
        I'm Ready
      </button>

    </div>
  );
};

export default OnboardingSidebar;