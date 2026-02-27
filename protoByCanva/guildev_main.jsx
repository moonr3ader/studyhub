import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Code, 
  Star, 
  User, 
  Trophy, 
  Play, 
  MessageSquare, 
  CheckSquare, 
  ChevronRight, 
  Lock, 
  Zap, 
  Users,
  Terminal,
  Search,
  Sword,
  Scroll,
  MoreVertical,
  Activity
} from 'lucide-react';

// --- Theme Constants ---
const COLORS = {
  bg: '#0B0E14',
  card: 'rgba(255, 255, 255, 0.03)',
  primary: '#7C4DFF',
  success: '#00E676',
  gold: '#FFD700',
  text: '#E0E0E0',
  muted: '#888'
};

// --- Mock Data ---
const SKILLS = [
  { name: 'JavaScript', level: 85, unlocked: true, color: '#F7DF1E' },
  { name: 'React', level: 70, unlocked: true, color: '#61DAFB' },
  { name: 'Node.js', level: 40, unlocked: true, color: '#339933' },
  { name: 'Backend Security', level: 0, unlocked: false, color: '#FF5252' },
  { name: 'Architecture', level: 0, unlocked: false, color: '#7C4DFF' },
];

const LEADERBOARD = [
  { rank: 1, name: 'Shadow Coders', members: 12, xp: 45200, language: 'TypeScript', color: 'text-yellow-400' },
  { rank: 2, name: 'Pixel Paladins', members: 8, xp: 38900, language: 'Python', color: 'text-gray-400' },
  { rank: 3, name: 'Logic Wizards', members: 15, xp: 31200, language: 'Rust', color: 'text-orange-500' },
];

// --- Components ---

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-xl ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', onClick, className = "" }) => {
  const styles = {
    primary: `bg-[#7C4DFF] hover:bg-[#6A3DE8] text-white shadow-[0_0_15px_rgba(124,77,255,0.4)]`,
    secondary: `bg-white/10 hover:bg-white/20 text-white border border-white/10`,
    ghost: `bg-transparent hover:bg-white/5 text-gray-400 hover:text-white`
  };
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2.5 rounded-lg font-medium transition-all active:scale-95 flex items-center gap-2 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// --- Navigation ---
const Navbar = ({ activeTab, setTab }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0E14]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab('landing')}>
      <div className="w-8 h-8 bg-[#7C4DFF] rounded flex items-center justify-center shadow-[0_0_10px_#7C4DFF]">
        <Code size={20} className="text-white" />
      </div>
      <span className="text-xl font-bold tracking-tighter text-white">GUILD<span className="text-[#7C4DFF]">DEV</span></span>
    </div>
    
    <div className="hidden md:flex items-center gap-8">
      {['Dashboard', 'Workspace', 'Leaderboards'].map((item) => (
        <button
          key={item}
          onClick={() => setTab(item.toLowerCase())}
          className={`text-sm font-medium transition-colors ${activeTab === item.toLowerCase() ? 'text-[#7C4DFF]' : 'text-gray-400 hover:text-white'}`}
        >
          {item}
        </button>
      ))}
    </div>

    <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
        <p className="text-xs text-gray-500">Level 12</p>
        <p className="text-sm font-bold text-white">Web Sorcerer</p>
      </div>
      <div className="w-10 h-10 rounded-full border-2 border-[#7C4DFF] bg-gradient-to-br from-purple-500 to-blue-500 overflow-hidden shadow-lg shadow-purple-500/20">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
      </div>
    </div>
  </nav>
);

// --- Pages ---

const LandingPage = ({ setTab }) => (
  <div className="pt-24 pb-12 px-6">
    {/* Hero Section */}
    <div className="max-w-6xl mx-auto text-center py-12">
      <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-white to-purple-400 bg-clip-text text-transparent leading-tight">
        Master the Craft.<br />Forge Your Legacy.
      </h1>
      <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
        The first RPG-driven collaborative coding platform for guilds of developers. Complete quests, earn XP, and climb the rankings.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
        <Button onClick={() => setTab('dashboard')} className="w-full sm:w-auto text-lg px-8 py-4">
          Begin Your Quest <ChevronRight size={20} />
        </Button>
        <Button variant="secondary" className="w-full sm:w-auto text-lg px-8 py-4">
          View the Hall of Fame
        </Button>
      </div>

      {/* Hero Mockup */}
      <div className="relative max-w-5xl mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <GlassCard className="relative overflow-hidden border-white/20">
           <div className="bg-[#1e1e1e] p-2 flex items-center gap-2 border-b border-white/10">
              <div className="flex gap-1.5 ml-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              <div className="mx-auto text-xs text-gray-500 font-mono">auth_controller.js</div>
           </div>
           <div className="p-8 text-left font-mono text-sm space-y-2 opacity-60">
             <div className="text-purple-400">async function <span className="text-blue-400">forgeToken</span>(adventurer) {'{'}</div>
             <div className="pl-4 text-gray-400">const <span className="text-blue-300">power</span> = adventurer.level * 10;</div>
             <div className="pl-4 text-gray-400"><span className="text-purple-400">await</span> guild.dispatch(<span className="text-green-300">'QUEST_COMPLETE'</span>);</div>
             <div className="pl-4 text-gray-400">return <span className="text-blue-400">generateLegacy</span>(power);</div>
             <div className="text-purple-400">{'}'}</div>
           </div>

           {/* Quest Complete Overlay */}
           <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <GlassCard className="p-8 border-[#7C4DFF] bg-[#0B0E14]/90 animate-bounce">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                    <Star className="text-yellow-400 fill-yellow-400" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1 tracking-widest uppercase">Quest Complete!</h3>
                  <p className="text-gray-400 text-sm mb-4">Refactoring the Dragon's Den</p>
                  <div className="flex gap-3">
                    <div className="bg-purple-500/20 px-3 py-1 rounded text-[#7C4DFF] text-xs font-bold">+500 XP</div>
                    <div className="bg-green-500/20 px-3 py-1 rounded text-green-400 text-xs font-bold">+20 Gold</div>
                  </div>
                </div>
              </GlassCard>
           </div>
        </GlassCard>
      </div>
    </div>

    {/* The Hook Section */}
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
      {[
        { icon: <Shield className="text-purple-400" />, title: 'Join a Guild', desc: 'Collaborate with fellow adventurers in real-time coding rooms.' },
        { icon: <Code className="text-blue-400" />, title: 'Write Code', desc: 'Integrated IDE with real-time feedback and peer reviews.' },
        { icon: <Star className="text-yellow-400" />, title: 'Earn XP', desc: 'Level up your profile and unlock rare cosmetic badges.' }
      ].map((feature, i) => (
        <div key={i} className="group p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {feature.icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
          <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = () => (
  <div className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
    {/* XP Header */}
    <div className="mb-12">
      <div className="flex justify-between items-end mb-3">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Adventurer's Hub</h2>
          <p className="text-gray-500">Welcome back, Archmage Felix</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-white">8,450 / 10,000 XP</span>
        </div>
      </div>
      <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
        <div 
          className="h-full bg-gradient-to-r from-purple-600 via-[#7C4DFF] to-blue-400 shadow-[0_0_20px_rgba(124,77,255,0.6)]"
          style={{ width: '84.5%' }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Card */}
      <GlassCard className="p-6 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full border-4 border-[#7C4DFF] p-1 shadow-2xl shadow-purple-500/20">
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-indigo-900 to-black">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
          </div>
          <div className="absolute -bottom-2 right-0 bg-yellow-500 text-black font-black px-2 py-0.5 rounded text-xs">
            LVL 12
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">Web Sorcerer</h3>
        <p className="text-gray-500 text-sm mb-6">Member of <span className="text-purple-400">Shadow Coders</span></p>
        
        <div className="w-full grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Quests Done</p>
            <p className="text-xl font-bold text-white">42</p>
          </div>
          <div className="bg-white/5 p-3 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reputation</p>
            <p className="text-xl font-bold text-green-400">A+</p>
          </div>
        </div>
        <Button variant="secondary" className="w-full">Edit Avatar</Button>
      </GlassCard>

      {/* Skill Tree */}
      <GlassCard className="p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap size={20} className="text-yellow-400" /> Skill Hexagons
          </h3>
          <span className="text-xs text-purple-400 font-bold uppercase cursor-pointer hover:underline">Reset Path</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-10 py-4">
          {SKILLS.map((skill, i) => (
            <div key={i} className={`flex flex-col items-center relative ${skill.unlocked ? 'opacity-100' : 'opacity-40'}`}>
              <div 
                className={`w-20 h-20 flex items-center justify-center transition-all duration-500`}
                style={{
                   clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                   background: skill.unlocked ? `linear-gradient(135deg, ${skill.color}44, ${skill.color}22)` : '#222',
                   border: `1px solid ${skill.unlocked ? skill.color : '#444'}`,
                   boxShadow: skill.unlocked ? `0 0 15px ${skill.color}44` : 'none'
                }}
              >
                {skill.unlocked ? (
                  <Code size={32} style={{ color: skill.color }} />
                ) : (
                  <Lock size={24} className="text-gray-500" />
                )}
              </div>
              <span className="mt-4 text-xs font-bold text-gray-400 uppercase">{skill.name}</span>
              {skill.unlocked && (
                <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                   {skill.level}%
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <p className="text-sm text-gray-400">
            <span className="text-purple-400 font-bold">Mastery Alert:</span> You are 15% away from unlocking the "Fullstack Guardian" node. Complete 2 more database quests to progress.
          </p>
        </div>
      </GlassCard>
    </div>
  </div>
);

const Workspace = () => {
  const [activeSidebarTab, setActiveSidebarTab] = useState('chat');
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <div className="h-screen pt-16 flex flex-col overflow-hidden bg-[#05070A]">
      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor Section */}
        <div className="flex-1 flex flex-col relative border-r border-white/5">
          {/* File Tabs */}
          <div className="bg-[#0B0E14] flex items-center px-4 border-b border-white/5">
            <div className="px-4 py-3 text-sm text-white border-b-2 border-purple-500 bg-white/5 flex items-center gap-2">
              <span className="text-yellow-500">JS</span> api_service.js
            </div>
            <div className="px-4 py-3 text-sm text-gray-500 hover:text-gray-300 cursor-pointer flex items-center gap-2">
              <span className="text-blue-500">TS</span> types.ts
            </div>
            <div className="ml-auto flex items-center gap-2">
               <div className="flex -space-x-2">
                 <div className="w-6 h-6 rounded-full bg-blue-500 border border-[#0B0E14] text-[8px] flex items-center justify-center font-bold">A</div>
                 <div className="w-6 h-6 rounded-full bg-red-500 border border-[#0B0E14] text-[8px] flex items-center justify-center font-bold">S</div>
               </div>
               <Button onClick={() => setTerminalOpen(!terminalOpen)} className="py-1 px-3 text-xs bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30">
                 <Play size={12} fill="currentColor" /> Run Code
               </Button>
            </div>
          </div>

          {/* Code Area */}
          <div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed text-gray-300 relative">
            <div className="flex gap-4">
              <div className="text-gray-600 text-right select-none w-8">
                {Array.from({length: 20}).map((_, i) => <div key={i}>{i+1}</div>)}
              </div>
              <div className="flex-1">
                <div className="group relative">
                  <span className="text-purple-400">const</span> guildRequest = <span className="text-purple-400">await</span> fetch(<span className="text-green-300">'/api/quests/active'</span>);
                  {/* Floating Cursor Mockup */}
                  <div className="absolute top-0 left-[240px] w-0.5 h-5 bg-blue-400">
                    <div className="absolute -top-6 left-0 bg-blue-400 text-white text-[10px] px-1.5 py-0.5 rounded-sm whitespace-nowrap font-sans">
                      Alex
                    </div>
                  </div>
                </div>
                <div><span className="text-purple-400">if</span> (!guildRequest.ok) {'{'}</div>
                <div className="pl-4 text-gray-500"> // Critical: Check potion count before retry</div>
                <div className="pl-4 text-purple-400">throw new <span className="text-yellow-300">QuestError</span>(<span className="text-green-300">'Low on Mana'</span>);</div>
                <div>{'}'}</div>
                <div className="mt-4">
                  <span className="text-purple-400">export default</span> <span className="text-blue-400">submitQuest</span>;
                </div>
              </div>
            </div>
          </div>

          {/* Terminal */}
          {terminalOpen && (
            <div className="h-1/3 bg-[#0B0E14] border-t border-white/10 flex flex-col animate-in slide-in-from-bottom duration-300">
               <div className="p-2 border-b border-white/5 flex items-center justify-between px-4">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                    <Terminal size={14} /> OUTPUT TERMINAL
                  </span>
                  <button onClick={() => setTerminalOpen(false)} className="text-gray-500 hover:text-white">×</button>
               </div>
               <div className="flex-1 p-4 font-mono text-xs overflow-auto">
                 <div className="text-green-400">✓ Compilation successful.</div>
                 <div className="text-blue-400">i Execution started...</div>
                 <div className="text-white mt-1">Found 4 active quests for user 'Felix'.</div>
                 <div className="text-white">API status: Healthy [200 OK]</div>
                 <div className="text-purple-400 mt-2">$ _</div>
               </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-[#0B0E14] flex flex-col">
          <div className="flex border-b border-white/5">
            <button 
              onClick={() => setActiveSidebarTab('chat')}
              className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1 ${activeSidebarTab === 'chat' ? 'text-[#7C4DFF] border-b-2 border-[#7C4DFF]' : 'text-gray-500'}`}
            >
              <MessageSquare size={18} /> CHAT
            </button>
            <button 
              onClick={() => setActiveSidebarTab('quest')}
              className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1 ${activeSidebarTab === 'quest' ? 'text-[#7C4DFF] border-b-2 border-[#7C4DFF]' : 'text-gray-500'}`}
            >
              <Scroll size={18} /> GUILD QUEST
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {activeSidebarTab === 'chat' ? (
              <div className="p-4 space-y-4">
                {[
                  { user: 'Sarah', msg: "Hey guys, check out line 14. I think the API path is wrong.", time: '12:04' },
                  { user: 'Alex', msg: "Got it, fixed!", time: '12:05', self: true },
                  { user: 'Sarah', msg: "Wait, the build just failed on the Forge.", time: '12:05' },
                ].map((chat, i) => (
                  <div key={i} className={`flex flex-col ${chat.self ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {!chat.self && <span className="text-[10px] font-bold text-blue-400">{chat.user}</span>}
                      <span className="text-[9px] text-gray-600">{chat.time}</span>
                    </div>
                    <div className={`p-3 rounded-xl text-xs ${chat.self ? 'bg-[#7C4DFF] text-white rounded-tr-none' : 'bg-white/5 text-gray-300 rounded-tl-none'}`}>
                      {chat.msg}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 space-y-6">
                 <div>
                   <h4 className="text-sm font-bold text-white mb-4">Slay the Legacy Code</h4>
                   <div className="space-y-3">
                     {[
                       { task: 'Implement Login API', done: true },
                       { task: 'Connect to MongoDB', done: true },
                       { task: 'Add JWT Auth', done: false },
                       { task: 'Fix CSS Overflow', done: false },
                     ].map((t, i) => (
                       <div key={i} className="flex items-center gap-3">
                         <div className={`w-5 h-5 rounded border flex items-center justify-center ${t.done ? 'bg-green-500/20 border-green-500 text-green-400' : 'border-white/10'}`}>
                           {t.done && <CheckSquare size={12} />}
                         </div>
                         <span className={`text-xs ${t.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{t.task}</span>
                       </div>
                     ))}
                   </div>
                 </div>
                 
                 <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-500 mb-2">
                       <Trophy size={16} /> 
                       <span className="text-xs font-bold">REWARDS</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      Completion of this quest will grant 200 XP to each guild member and unlock the "Security Specialist" skill node.
                    </p>
                 </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/5">
             <div className="bg-white/5 rounded-lg flex items-center px-3 py-2">
                <input type="text" placeholder="Cast a message..." className="bg-transparent border-none text-xs text-white focus:ring-0 flex-1 outline-none" />
                <Button className="px-2 py-1 h-auto"><ChevronRight size={14} /></Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Leaderboards = () => (
  <div className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-white mb-2">The Hall of Fame</h2>
      <p className="text-gray-500">Recognition for the realm's greatest development guilds</p>
    </div>

    {/* Podium */}
    <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-16">
      {/* 2nd Place */}
      <div className="order-2 md:order-1 flex flex-col items-center flex-1">
        <div className="mb-4 text-gray-400 flex flex-col items-center">
           <Trophy size={40} className="mb-2" />
           <span className="text-xl font-bold">Pixel Paladins</span>
        </div>
        <div className="w-full bg-gradient-to-t from-gray-500/20 to-gray-500/5 h-40 rounded-t-2xl border-x border-t border-gray-500/20 flex flex-col items-center justify-center p-6">
           <div className="text-4xl font-black text-gray-500/40 mb-2">2</div>
           <div className="text-xs font-bold text-gray-400">38,900 XP</div>
        </div>
      </div>
      
      {/* 1st Place */}
      <div className="order-1 md:order-2 flex flex-col items-center flex-1 z-10">
        <div className="mb-4 text-yellow-400 flex flex-col items-center">
           <div className="relative">
             <Trophy size={64} className="mb-2 drop-shadow-[0_0_15px_#FFD70066]" />
             <Star className="absolute -top-2 -right-2 text-white fill-white" size={24} />
           </div>
           <span className="text-2xl font-black tracking-wider uppercase">Shadow Coders</span>
        </div>
        <div className="w-full bg-gradient-to-t from-yellow-500/20 to-yellow-500/5 h-56 rounded-t-2xl border-x border-t border-yellow-500/30 flex flex-col items-center justify-center p-6 shadow-[0_-20px_40px_rgba(255,215,0,0.1)]">
           <div className="text-6xl font-black text-yellow-500/40 mb-2">1</div>
           <div className="text-sm font-bold text-yellow-500">45,200 XP</div>
        </div>
      </div>

      {/* 3rd Place */}
      <div className="order-3 flex flex-col items-center flex-1">
        <div className="mb-4 text-orange-500 flex flex-col items-center">
           <Trophy size={32} className="mb-2" />
           <span className="text-lg font-bold">Logic Wizards</span>
        </div>
        <div className="w-full bg-gradient-to-t from-orange-500/20 to-orange-500/5 h-32 rounded-t-2xl border-x border-t border-orange-500/20 flex flex-col items-center justify-center p-6">
           <div className="text-3xl font-black text-orange-500/40 mb-2">3</div>
           <div className="text-xs font-bold text-orange-500">31,200 XP</div>
        </div>
      </div>
    </div>

    {/* Leaderboard Table */}
    <GlassCard className="overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest font-bold">
            <th className="px-6 py-4">Rank</th>
            <th className="px-6 py-4">Guild Name</th>
            <th className="px-6 py-4">Members</th>
            <th className="px-6 py-4">Total XP</th>
            <th className="px-6 py-4">Top Language</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {LEADERBOARD.map((guild) => (
            <tr key={guild.rank} className="group hover:bg-white/5 transition-colors cursor-pointer">
              <td className="px-6 py-6 font-bold text-gray-500">#{guild.rank}</td>
              <td className="px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 ${guild.color}`}>
                    <Sword size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-white">{guild.name}</div>
                    <div className="text-xs text-gray-500">Leader: Archmage_01</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-6 text-gray-400">
                <div className="flex items-center gap-2">
                   <Users size={14} /> {guild.members}
                </div>
              </td>
              <td className="px-6 py-6 text-[#7C4DFF] font-bold">
                {guild.xp.toLocaleString()} XP
              </td>
              <td className="px-6 py-6">
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300">
                  {guild.language}
                </span>
              </td>
              <td className="px-6 py-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] text-green-500 font-bold">QUESTING</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E0E0E0] font-sans selection:bg-[#7C4DFF] selection:text-white">
      <Navbar activeTab={activeTab} setTab={setActiveTab} />
      
      <main className="animate-in fade-in duration-700">
        {activeTab === 'landing' && <LandingPage setTab={setActiveTab} />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'workspace' && <Workspace />}
        {activeTab === 'leaderboards' && <Leaderboards />}
      </main>

      {/* Global Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      {activeTab !== 'workspace' && (
        <footer className="py-12 px-6 border-t border-white/5 mt-12 bg-[#05070A]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#7C4DFF] rounded flex items-center justify-center">
                <Code size={14} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tighter text-white">GUILD<span className="text-[#7C4DFF]">DEV</span></span>
            </div>
            <div className="flex gap-8 text-xs text-gray-500 font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-white">Whitepaper</a>
              <a href="#" className="hover:text-white">Lore</a>
              <a href="#" className="hover:text-white">Community</a>
              <a href="#" className="hover:text-white">Support</a>
            </div>
            <p className="text-xs text-gray-600 italic">"The code is the law, but the guild is the life."</p>
          </div>
        </footer>
      )}
    </div>
  );
}
