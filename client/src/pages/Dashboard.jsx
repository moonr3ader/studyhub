import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#161B22] border-r border-purple-500/20 p-6 flex flex-col">
        <h2 className="text-xl font-bold text-purple-400 mb-8">GuildDev</h2>
        <nav className="flex-1 space-y-4">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-300 border border-purple-500/30">
            🏰 Adventurer's Hub
          </div>
          <div className="p-3 hover:bg-slate-800 rounded-lg cursor-not-allowed text-slate-500">
            🛡️ My Guild (Locked)
          </div>
        </nav>
        <button onClick={logout} className="text-sm text-slate-500 hover:text-red-400 text-left">
          Log Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {currentUser?.email.split('@')[0]}</h1>
            <p className="text-slate-400">Current Rank: Novice</p>
          </div>
          <div className="flex items-center gap-4 bg-[#161B22] p-4 rounded-xl border border-slate-700">
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase">Experience</p>
              <p className="text-purple-400 font-mono">0 / 500 XP</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-bold">
              Lvl 1
            </div>
          </div>
        </header>

        <section className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-8 rounded-2xl border border-purple-500/30">
          <h3 className="text-xl font-bold mb-2 text-white">The Preliminary Trial</h3>
          <p className="text-slate-400 mb-6">You must prove your skill before joining a Guild.</p>
          <a href="/quest" className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-bold transition-all">
            Begin Level 0 Quest
          </a>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;