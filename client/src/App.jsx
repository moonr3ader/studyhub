import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import the Bouncer
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import AdminConsole from './pages/AdminConsole';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import PreliminaryQuest from './pages/PreliminaryQuest';
import GuildHub from './pages/GuildHub';
import Leaderboard from './pages/Leaderboard'; // <-- Added Leaderboard
import Workspace from './pages/Workspace';
import MyGuild from './pages/MyGuild';

import './index.css'; 

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#0B0E14] relative pb-16">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* PRIVATE ROUTES (Protected by the Bouncer) */}
            <Route 
              path="/verify-email" 
              element={<ProtectedRoute><VerifyEmail /></ProtectedRoute>} 
            />
            <Route 
              path="/dashboard" 
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
            />
            <Route 
              path="/quest" 
              element={<ProtectedRoute><PreliminaryQuest /></ProtectedRoute>} 
            />
            <Route 
              path="/guilds" 
              element={<ProtectedRoute><GuildHub /></ProtectedRoute>} 
            />
            <Route 
              path="/leaderboard" 
              element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} 
            />
            <Route 
              path="/guild/:id" 
              element={<ProtectedRoute><MyGuild /></ProtectedRoute>} 
            />
            <Route 
              path="/workspace/:guildId" 
              element={<ProtectedRoute><Workspace /></ProtectedRoute>} 
            />
            <Route 
              path="/admin" 
              element={<ProtectedRoute><AdminConsole /></ProtectedRoute>} 
            />
          </Routes>

          {/* TEMPORARY DEV NAVIGATION MENU */}
          <div className="fixed bottom-0 left-0 right-0 bg-[#161B22] border-t border-purple-500/30 p-3 flex justify-center flex-wrap gap-4 md:gap-6 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <span className="text-slate-500 font-mono text-sm self-center mr-2">DEV MENU:</span>
            <Link to="/" className="text-purple-400 hover:text-white text-sm font-bold transition-colors">Landing</Link>
            <Link to="/auth" className="text-purple-400 hover:text-white text-sm font-bold transition-colors">Auth</Link>
            <Link to="/dashboard" className="text-purple-400 hover:text-white text-sm font-bold transition-colors">Dashboard</Link>
            <Link to="/quest" className="text-purple-400 hover:text-white text-sm font-bold transition-colors">Quest</Link>
            <Link to="/guilds" className="text-purple-400 hover:text-white text-sm font-bold transition-colors">Guild Hub</Link>
            <Link to="/leaderboard" className="text-purple-400 hover:text-white text-sm font-bold transition-colors">Hall of Fame</Link>
            
            {/* These use mock IDs for testing UI without database navigation */}
            <Link to="/guild/mock-id" className="text-slate-600 hover:text-white text-sm font-bold transition-colors">Guild (Mock)</Link>
            <Link to="/workspace/mock-id" className="text-slate-600 hover:text-white text-sm font-bold transition-colors">Forge (Mock)</Link>
          </div>

        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;