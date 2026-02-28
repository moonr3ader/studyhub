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
  Activity,
  Sparkles,
  Wand2,
  RefreshCw
} from 'lucide-react';

// --- Gemini API Setup ---
const apiKey = ""; // Provided at runtime

async function callGemini(prompt, systemPrompt = "") {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      })
    });
    
    if (!response.ok) throw new Error('Gemini API Error');
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "The Oracle is silent...";
  } catch (error) {
    console.error(error);
    return "Failed to commune with the Oracle. (API Error)";
  }
}

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
const INITIAL_SKILLS = [
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

const Button = ({ children, variant = 'primary', onClick, className = "", isLoading = false }) => {
  const styles = {
    primary: `bg-[#7C4DFF] hover:bg-[#6A3DE8] text-white shadow-[0_0_15px_rgba(124,77,255,0.4)]`,
    secondary: `bg-white/10 hover:bg-white/20 text-white border border-white/10`,
    ghost: `bg-transparent hover:bg-white/5 text-gray-400 hover:text-white`
  };
  return (
    <button 
      onClick={onClick}
      disabled={isLoading}
      className={`px-6 py-2.5 rounded-lg font-medium transition-all active:scale-95 flex items-center justify-center gap-2 ${styles[variant]} ${className} ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
    >
      {isLoading ? <RefreshCw className="animate-spin" size={18} /> : children}
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
    <div className="max-w-6xl mx-auto text-center py-12">
      <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-white to-purple-400 bg-clip-text text-transparent leading-tight">
        Master the Craft.<br />Forge Your Legacy.
      </h1>
      <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
        The first AI-augmented coding platform for guilds. Use the Oracle ✨ to decode complex algorithms and complete mythic quests.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
        <Button onClick={() => setTab('dashboard')} className="w-full sm:w-auto text-lg px-8 py-4">
          Begin Your Quest <ChevronRight size={20} />
        </Button>
        <Button variant="secondary" className="w-full sm:w-auto text-lg px-8 py-4">
          View the Hall of Fame
        </Button>
      </div>

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
  </div>
);

const Dashboard = () => {
  const [activeQuests, setActiveQuests] = useState([
    { task: 'Implement Login API', done: true },
    { task: 'Connect to MongoDB', done: true },
    { task: 'Add JWT Auth', done: false },
    { task: 'Fix CSS Overflow', done: false },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNewQuest = async () => {
    setIsGenerating(true);
    const prompt = "Generate 4 specific, coding-related sub-tasks for a fantasy-themed coding quest about building a 'Dragon Defense System' using React and Node.js. Format as a simple list.";
    const system = "You are the Guild Master. Your tone is heroic and fantasy-focused. Provide only the 4 task descriptions, each under 30 characters.";
    
    const result = await callGemini(prompt, system);
    const newTasks = result.split('\n')
      .filter(t => t.trim())
      .slice(0, 4)
      .map(t => ({ task: t.replace(/^\d+\.\s*/, '').trim(), done: false }));
    
    if (newTasks.length > 0) setActiveQuests(newTasks);
    setIsGenerating(false);
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
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
          <div className="h-full bg-gradient-to-r from-purple-600 via-[#7C4DFF] to-blue-400 shadow-[0_0_20px_rgba(124,77,255,0.6)]" style={{ width: '84.5%' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="p-6 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-[#7C4DFF] p-1">
              <img className="rounded-full" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
            <div className="absolute -bottom-2 right-0 bg-yellow-500 text-black font-black px-2 py-0.5 rounded text-xs">LVL 12</div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">Web Sorcerer</h3>
          <p className="text-gray-500 text-sm mb-6">Member of <span className="text-purple-400">Shadow Coders</span></p>
          <div className="w-full grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 p-3 rounded-lg"><p className="text-xs text-gray-500 uppercase mb-1">Quests</p><p className="text-xl font-bold text-white">42</p></div>
            <div className="bg-white/5 p-3 rounded-lg"><p className="text-xs text-gray-500 uppercase mb-1">Rep</p><p className="text-xl font-bold text-green-400">A+</p></div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Scroll size={20} className="text-purple-400" /> Active Guild Quests</h3>
            <Button onClick={generateNewQuest} isLoading={isGenerating} variant="ghost" className="text-xs text-purple-400 flex items-center gap-2 border border-purple-500/20">
              <Sparkles size={14} /> New Quest ✨
            </Button>
          </div>
          <div className="space-y-4">
            {activeQuests.map((t, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className={`w-6 h-6 rounded flex items-center justify-center ${t.done ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-600'}`}>
                  {t.done ? <CheckSquare size={16} /> : <div className="w-4 h-4 rounded border border-gray-600"></div>}
                </div>
                <span className={`text-sm flex-1 ${t.done ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{t.task}</span>
                {!t.done && <div className="text-[10px] font-bold text-purple-400 bg-purple-400/10 px-2 py-1 rounded">+50 XP</div>}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const Workspace = () => {
  const [activeSidebarTab, setActiveSidebarTab] = useState('chat');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [code, setCode] = useState(`const guildRequest = await fetch('/api/quests/active');\nif (!guildRequest.ok) {\n  throw new QuestError('Low on Mana');\n}\nexport default submitQuest;`);
  const [oracleInsight, setOracleInsight] = useState("");
  const [isConsulting, setIsConsulting] = useState(false);

  const consultOracle = async () => {
    setIsConsulting(true);
    const prompt = `Analyze this code snippet and suggest one optimization or explain it in high-fantasy developer terminology. Limit to 3 sentences.\n\nCode:\n${code}`;
    const system = "You are 'The Oracle', an ancient AI living within the GuildDev servers. You speak in mystical, fantasy-RPG metaphors but provide technically accurate coding advice.";
    
    const insight = await callGemini(prompt, system);
    setOracleInsight(insight);
    setIsConsulting(false);
    setActiveSidebarTab('oracle');
  };

  return (
    <div className="h-screen pt-16 flex flex-col overflow-hidden bg-[#05070A]">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col relative border-r border-white/5">
          <div className="bg-[#0B0E14] flex items-center px-4 border-b border-white/5">
            <div className="px-4 py-3 text-sm text-white border-b-2 border-purple-500 bg-white/5 flex items-center gap-2"><span className="text-yellow-500">JS</span> api_service.js</div>
            <div className="ml-auto flex items-center gap-3">
               <Button onClick={consultOracle} isLoading={isConsulting} className="py-1 px-3 text-xs bg-purple-500/20 text-purple-400 border border-purple-500/20 hover:bg-purple-500/30">
                 <Wand2 size={12} /> Consult Oracle ✨
               </Button>
               <Button onClick={() => setTerminalOpen(!terminalOpen)} className="py-1 px-3 text-xs bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30">
                 <Play size={12} fill="currentColor" /> Run Code
               </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed text-gray-300 relative">
             <textarea 
               value={code} 
               onChange={(e) => setCode(e.target.value)}
               className="w-full h-full bg-transparent outline-none resize-none text-blue-300"
               spellCheck="false"
             />
          </div>

          {terminalOpen && (
            <div className="h-1/3 bg-[#0B0E14] border-t border-white/10 flex flex-col">
               <div className="p-2 border-b border-white/5 flex items-center justify-between px-4">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-2"><Terminal size={14} /> OUTPUT TERMINAL</span>
                  <button onClick={() => setTerminalOpen(false)} className="text-gray-500 hover:text-white">×</button>
               </div>
               <div className="flex-1 p-4 font-mono text-xs overflow-auto">
                 <div className="text-green-400">✓ Compilation successful.</div>
                 <div className="text-white mt-1">Found 4 active quests for user 'Felix'.</div>
                 <div className="text-purple-400 mt-2">$ _</div>
               </div>
            </div>
          )}
        </div>

        <div className="w-80 bg-[#0B0E14] flex flex-col">
          <div className="flex border-b border-white/5">
            <button onClick={() => setActiveSidebarTab('chat')} className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1 ${activeSidebarTab === 'chat' ? 'text-[#7C4DFF] border-b-2 border-[#7C4DFF]' : 'text-gray-500'}`}><MessageSquare size={18} /> CHAT</button>
            <button onClick={() => setActiveSidebarTab('oracle')} className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1 ${activeSidebarTab === 'oracle' ? 'text-[#7C4DFF] border-b-2 border-[#7C4DFF]' : 'text-gray-500'}`}><Sparkles size={18} /> ORACLE ✨</button>
          </div>

          <div className="flex-1 overflow-auto">
            {activeSidebarTab === 'chat' ? (
              <div className="p-4 space-y-4">
                <div className="p-3 rounded-xl text-xs bg-white/5 text-gray-300 rounded-tl-none">
                  <span className="text-[10px] font-bold text-blue-400 block mb-1">Sarah</span>
                  The Oracle ✨ says our middleware is leaking mana!
                </div>
              </div>
            ) : (
              <div className="p-6">
                 <div className="flex items-center gap-2 text-purple-400 mb-4">
                    <Sparkles size={20} />
                    <h4 className="text-sm font-bold">Divine Insights</h4>
                 </div>
                 {oracleInsight ? (
                   <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl">
                     <p className="text-xs text-gray-300 leading-relaxed italic">"{oracleInsight}"</p>
                   </div>
                 ) : (
                   <div className="text-center py-12">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wand2 className="text-gray-600" />
                      </div>
                      <p className="text-xs text-gray-500">Tap the 'Consult Oracle' button to receive a divine scroll of code wisdom.</p>
                   </div>
                 )}
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
    <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-16">
      <div className="order-2 md:order-1 flex flex-col items-center flex-1">
        <div className="mb-4 text-gray-400 flex flex-col items-center"><Trophy size={40} className="mb-2" /><span className="text-xl font-bold">Pixel Paladins</span></div>
        <div className="w-full bg-gradient-to-t from-gray-500/20 to-gray-500/5 h-40 rounded-t-2xl border-x border-t border-gray-500/20 flex flex-col items-center justify-center p-6"><div className="text-4xl font-black text-gray-500/40 mb-2">2</div><div className="text-xs font-bold text-gray-400">38,900 XP</div></div>
      </div>
      <div className="order-1 md:order-2 flex flex-col items-center flex-1 z-10">
        <div className="mb-4 text-yellow-400 flex flex-col items-center">
           <Trophy size={64} className="mb-2 drop-shadow-[0_0_15px_#FFD70066]" />
           <span className="text-2xl font-black uppercase">Shadow Coders</span>
        </div>
        <div className="w-full bg-gradient-to-t from-yellow-500/20 to-yellow-500/5 h-56 rounded-t-2xl border-x border-t border-yellow-500/30 flex flex-col items-center justify-center p-6"><div className="text-6xl font-black text-yellow-500/40 mb-2">1</div><div className="text-sm font-bold text-yellow-500">45,200 XP</div></div>
      </div>
      <div className="order-3 flex flex-col items-center flex-1">
        <div className="mb-4 text-orange-500 flex flex-col items-center"><Trophy size={32} className="mb-2" /><span className="text-lg font-bold">Logic Wizards</span></div>
        <div className="w-full bg-gradient-to-t from-orange-500/20 to-orange-500/5 h-32 rounded-t-2xl border-x border-t border-orange-500/20 flex flex-col items-center justify-center p-6"><div className="text-3xl font-black text-orange-500/40 mb-2">3</div><div className="text-xs font-bold text-orange-500">31,200 XP</div></div>
      </div>
    </div>
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
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>
      {activeTab !== 'workspace' && (
        <footer className="py-12 px-6 border-t border-white/5 mt-12 bg-[#05070A]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-xs text-gray-500">
            <span className="text-lg font-bold text-white">GUILD<span className="text-[#7C4DFF]">DEV</span></span>
            <div className="flex gap-8 uppercase font-bold tracking-widest">
              <a href="#">Lore</a><a href="#">Community</a><a href="#">Support</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
