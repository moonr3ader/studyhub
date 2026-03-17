import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // <-- Added Link here
import { AuthProvider } from './context/AuthContext';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PreliminaryQuest from './pages/PreliminaryQuest';
import GuildHub from './pages/GuildHub';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

import './index.css'; 

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#0B0E14] relative pb-16"> {/* Added pb-16 for the menu */}
          
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quest" element={<PreliminaryQuest />} />
            <Route path="/guilds" element={<GuildHub />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>

          {/* TEMPORARY DEV NAVIGATION MENU */}
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-purple-500/30 p-3 flex justify-center gap-4 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <span className="text-slate-500 font-mono text-sm self-center mr-4">DEV MENU:</span>
            <Link to="/" className="text-purple-400 hover:text-white text-sm font-bold">Auth</Link>
            <Link to="/dashboard" className="text-purple-400 hover:text-white text-sm font-bold">Dashboard</Link>
            <Link to="/quest" className="text-purple-400 hover:text-white text-sm font-bold">Quest</Link>
            <Link to="/guilds" className="text-purple-400 hover:text-white text-sm font-bold">Guilds</Link>
            <Link to="/leaderboard" className="text-purple-400 hover:text-white text-sm font-bold">Leaderboard</Link>
            <Link to="/Profile" className="text-purple-400 hover:text-white text-sm font-bold">Profile</Link>
          </div>

        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;