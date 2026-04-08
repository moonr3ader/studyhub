import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Shield, Swords, Users, Zap, Code2, ShieldAlert, Code, Trophy } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const steps = [
    {
      id: 1,
      title: "Pass the Gatekeeper",
      description: "Prove your worth. Complete a rapid-fire coding trial to unlock the realm, set your Gamertag, and earn your first badge.",
      icon: <ShieldAlert className="w-8 h-8 text-purple-400" />,
      color: "border-purple-500"
    },
    {
      id: 2,
      title: "Forge a Guild",
      description: "Don't code alone. Create or join a Guild to unlock 'The Forge'—a real-time workspace with live chat and synchronized code editing.",
      icon: <Users className="w-8 h-8 text-blue-400" />,
      color: "border-blue-500"
    },
    {
      id: 3,
      title: "Accept Quests",
      description: "Tackle Solo Bounties or massive Multiplayer Raids. Write your solution and our cloud engine will instantly evaluate your code against hidden tests.",
      icon: <Code className="w-8 h-8 text-emerald-400" />,
      color: "border-emerald-500"
    },
    {
      id: 4,
      title: "Level Up & Rank",
      description: "Earn XP for victorious code. Collect rare Trophies, level up your adventurer, and climb the Global Leaderboards.",
      icon: <Trophy className="w-8 h-8 text-amber-400" />,
      color: "border-amber-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 flex flex-col relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* TOP NAVIGATION */}
      <nav className="w-full max-w-7xl mx-auto flex justify-between items-center p-6 z-10 relative border-b border-white/5">
        <div className="flex items-center gap-3">
          <Terminal className="text-purple-500" size={28} />
          <h2 className="text-2xl font-black text-white italic tracking-tighter">
            Guild<span className="text-purple-500">Dev</span>
          </h2>
        </div>
        <button 
          onClick={() => navigate('/auth')}
          className="bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/50 hover:border-purple-400 px-6 py-2.5 rounded-xl font-bold tracking-widest uppercase transition-all flex items-center gap-2"
        >
          Enter Realm
        </button>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 z-10 mt-10 md:mt-0">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-sm font-mono text-emerald-400">
            <Zap size={16} /> Phase 4 Server Now Online
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight mb-8">
            Forge Your Legacy in <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              Lines of Code
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
            Level up your programming skills, swear allegiance to a guild, and build full-stack applications in real-time with adventurers from across the globe.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <button 
              onClick={() => navigate('/auth')}
              className="bg-purple-600 hover:bg-purple-500 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-white transition-transform hover:scale-105 shadow-[0_0_30px_rgba(168,85,247,0.3)] flex items-center justify-center gap-3 text-lg"
            >
              <Shield size={24} /> Begin Your Quest
            </button>
          </div>
        </div>

        {/* FEATURE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-24 text-left">
          <div className="bg-[#161B22] border border-white/5 rounded-3xl p-8 hover:border-purple-500/30 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
              <Code2 className="text-purple-400" size={28} />
            </div>
            <h3 className="text-xl font-black text-white mb-3">Real-Time Forge</h3>
            <p className="text-slate-400 leading-relaxed">Collaborate seamlessly with your guild using our synchronized live-typing code editor and comm-link.</p>
          </div>

          <div className="bg-[#161B22] border border-white/5 rounded-3xl p-8 hover:border-blue-500/30 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
              <Users className="text-blue-400" size={28} />
            </div>
            <h3 className="text-xl font-black text-white mb-3">Form Your Guild</h3>
            <p className="text-slate-400 leading-relaxed">Recruit qualified adventurers, pool your experience points, and conquer large-scale projects as a unified team.</p>
          </div>

          <div className="bg-[#161B22] border border-white/5 rounded-3xl p-8 hover:border-emerald-500/30 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
              <Swords className="text-emerald-400" size={28} />
            </div>
            <h3 className="text-xl font-black text-white mb-3">RPG Progression</h3>
            <p className="text-slate-400 leading-relaxed">Earn XP by passing coding trials. Level up your character profile and climb the global Hall of Fame.</p>
          </div>
        </div>
      </main>

      {/* WORKFLOW SECTION (The Adventurer's Journey) */}
      <section className="py-24 border-t border-white/5 relative z-10 mt-12 bg-gradient-to-b from-transparent to-[#080a0e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              The Adventurer's <span className="text-purple-500">Journey</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-lg">
              From a solitary coder to a legendary Guild Master. Here is how you will conquer the realm of GuildDev.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Background Line for Desktop */}
            <div className="hidden md:block absolute top-[40px] left-[10%] w-[80%] h-1 bg-slate-800 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center text-center">
                  
                  {/* Icon Circle */}
                  <div className={`w-20 h-20 rounded-full bg-[#161B22] border-4 ${step.color} flex items-center justify-center shadow-lg transform transition hover:-translate-y-2 duration-300`}>
                    {step.icon}
                  </div>
                  
                  {/* Step Number Badge */}
                  <div className="mt-6 bg-[#161B22] text-slate-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-white/10 uppercase tracking-wider">
                    Step {step.id}
                  </div>

                  {/* Text Content */}
                  <h3 className="text-xl font-black text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SIMPLE FOOTER */}
      <footer className="text-center py-8 text-slate-500 text-sm border-t border-white/5 bg-[#080a0e] relative z-10">
        <p>© {new Date().getFullYear()} GuildDev Platform. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Landing;