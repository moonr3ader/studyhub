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
import Leaderboard from './pages/Leaderboard';
import Workspace from './pages/Workspace';
import MyGuild from './pages/MyGuild';
import Settings from './pages/Settings';

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
            <Route 
              path="/settings" 
              element={<ProtectedRoute><Settings /></ProtectedRoute>} 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;