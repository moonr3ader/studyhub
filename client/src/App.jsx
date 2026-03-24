import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PreliminaryQuest from './pages/PreliminaryQuest';
import GuildHub from './pages/GuildHub';
import Workspace from './pages/Workspace';
import MyGuild from './pages/MyGuild';

import './index.css'; 

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* pb-16 ensures the main content doesn't get hidden behind the fixed dev menu */}
        <div className="min-h-screen bg-[#0B0E14] relative pb-16">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quest" element={<PreliminaryQuest />} />
            <Route path="/guilds" element={<GuildHub />} />
            <Route path="/guild/:id" element={<MyGuild />} />
            <Route path="/workspace/:guildId" element={<Workspace />} />
          </Routes>

          {/* TEMPORARY DEV NAVIGATION MENU */}
          <div className="fixed bottom-0 left-0 right-0 bg-[#161B22] border-t border-purple-500/30 p-3 flex justify-center flex-wrap gap-4 md:gap-6 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <span className="text-slate-500 font-mono text-sm self-center mr-2">DEV MENU:</span>
            <Link to="/" className="text-purple-400 hover:text-white text-sm font-bold transition-colors">Landing</Link>
            <Link to="/auth" className="text-purple-400 hover:text-white text-sm font-bold transition-colors">Auth</Link>
            <Link to="/dashboard" className="text-purple-400 hover:text-white text-sm font-bold transition-colors">Dashboard</Link>
            <Link to="/quest" className="text-purple-400 hover:text-white text-sm font-bold transition-colors">Quest</Link>
            <Link to="/guilds" className="text-purple-400 hover:text-white text-sm font-bold transition-colors">Guild Hub</Link>
            
            {/* Note: These use mock IDs just so the dev link doesn't crash the router */}
            <Link to="/guild/mock-id" className="text-slate-600 hover:text-white text-sm font-bold transition-colors">My Guild (Mock)</Link>
            <Link to="/workspace/mock-id" className="text-slate-600 hover:text-white text-sm font-bold transition-colors">Workspace (Mock)</Link>
          </div>

        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;