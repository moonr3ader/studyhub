import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  // Fix 2: Extracted 'logout' alongside 'currentUser'
  const { currentUser, logout } = useAuth(); 
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- NEW LOGOUT HANDLER ---
  const handleLogout = async () => {
    try {
      await logout(); // Tell Firebase to kill the session
      navigate('/');  // Instantly teleport the user back to the AuthPage
    } catch (error) {
      console.error("Failed to log out of the Guild:", error);
    }
  };
  // --------------------------

  // -----------------------------------------------------------------
  // 1. DATA FETCHING
  // -----------------------------------------------------------------
  useEffect(() => {
    const fetchPlayerData = async () => {
      // Fix 3: Stop loading immediately if there is no user
      if (!currentUser) {
        setLoading(false);
        return; 
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/user/${currentUser.uid}`);
        setPlayerData(response.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [currentUser]);

  // -----------------------------------------------------------------
  // 2. CONDITIONAL RENDERING (Guards)
  // -----------------------------------------------------------------
  
  // Guard A: Show a loading screen while we wait for the database
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="text-purple-500 font-mono animate-pulse">Loading Guild Data...</div>
      </div>
    );
  }

  // Guard B: If no data is found in MongoDB, prompt them to take the quest
  if (!playerData) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-slate-400 mb-4">Your adventurer card is missing from our records.</p>
        <a href="/quest" className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-bold transition-all">
          Complete the Preliminary Quest
        </a>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // 3. MAIN DASHBOARD UI
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#161B22] border-r border-purple-500/20 p-6 flex flex-col">
        <h2 className="text-xl font-black text-white italic tracking-tighter mb-8">
          Guild<span className="text-purple-500">Dev</span>
        </h2>
        
        <nav className="flex-1 space-y-4">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-300 border border-purple-500/30 font-bold">
            🏰 Adventurer's Hub
          </div>
          <div className="p-3 hover:bg-slate-800 rounded-lg cursor-not-allowed text-slate-600 font-bold">
            🛡️ My Guild (Locked)
          </div>
        </nav>
        
        <button 
          onClick={handleLogout} 
          className="text-sm font-bold tracking-widest uppercase text-slate-500 hover:text-red-400 text-left transition-colors"
        >
          Log Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-white">
            Welcome back, <span className="text-purple-500">{playerData.username}</span>
          </h1>
          <p className="text-slate-400 font-mono mt-2">
            Level {playerData.level} Adventurer • {playerData.xp} Total XP
          </p>
        </header>

        {/* Dynamic Content: Only show Quest Box if they aren't qualified */}
        {!playerData.isQualified ? (
          <section className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-8 rounded-2xl border border-purple-500/30">
            <h3 className="text-xl font-bold mb-2 text-white">The Preliminary Trial</h3>
            <p className="text-slate-400 mb-6">You must prove your skill before joining a Guild.</p>
            <a href="/quest" className="inline-block bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              Begin Level 0 Quest
            </a>
          </section>
        ) : (
          <section className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 p-8 rounded-2xl border border-emerald-500/30">
            <h3 className="text-xl font-bold mb-2 text-white">Status: Qualified</h3>
            <p className="text-slate-400 mb-6">You are ready to join a team. Visit the Guild Hub to find your squad.</p>
            <a href="/guilds" className="inline-block bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              Enter the Guild Hub
            </a>
          </section>
        )}
      </main>
      
    </div>
  );
};

export default Dashboard;