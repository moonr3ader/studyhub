import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Settings as SettingsIcon, User, Lock, Shield, ArrowLeft, Save, AlertTriangle } from 'lucide-react';

const Settings = () => {
  // ==========================================
  // CONTEXT & STATE
  // ==========================================
  const { currentUser, changePassword } = useAuth();
  const navigate = useNavigate();
  
  // Safely checks if the user logged in with an email/password combination
  const isPasswordUser = currentUser?.providerData.some(provider => provider.providerId === 'password');
  
  const [activeTab, setActiveTab] = useState('profile');
  const [playerData, setPlayerData] = useState(null);
  
  // Form States
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Status States
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // ==========================================
  // DATA FETCHING (INITIAL LOAD)
  // ==========================================
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/user/${currentUser.uid}`);
        setPlayerData(res.data);
        setUsername(res.data.username);
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      }
    };
    
    if (currentUser) fetchUserData();
  }, [currentUser]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.patch(`http://localhost:5000/api/user/${currentUser.uid}`, { username });
      setMessage({ type: 'success', text: 'Guild Registry updated successfully!' });
    } catch (err) {
      // Look for the specific backend error, otherwise use a fallback
      const errorMessage = err.response?.data?.error || 'Failed to update username.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match.' });
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await changePassword(newPassword);
      setMessage({ type: 'success', text: 'Secret Sigil updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      // Firebase requires a "recent login" to change passwords for security reasons
      if (err.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Security requirement: Please log out and log back in before changing your password.' });
      } else {
        setMessage({ type: 'error', text: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER BLOCKS
  // ==========================================

  if (!playerData) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-slate-500 flex items-center justify-center font-mono animate-pulse uppercase tracking-widest">
        Accessing Records...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* --- NAVIGATION --- */}
        <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2 font-bold mb-8 uppercase tracking-widest text-xs">
          <ArrowLeft size={14} /> Return to Dashboard
        </button>

        {/* --- HEADER --- */}
        <header className="mb-10 flex items-center gap-4 border-b border-white/5 pb-6">
          <div className="bg-[#161B22] p-3 rounded-2xl border border-white/10 shadow-lg">
            <SettingsIcon className="text-slate-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Preferences</h1>
            <p className="text-slate-500 font-mono text-sm mt-1 uppercase tracking-widest">Manage your identity and security</p>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* --- SIDEBAR TABS --- */}
          <div className="w-full md:w-64 space-y-2">
            <button 
              onClick={() => { setActiveTab('profile'); setMessage({ type: '', text: '' }); }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'profile' ? 'bg-purple-600/10 text-purple-400 border border-purple-500/30' : 'bg-[#161B22] text-slate-400 hover:bg-white/5 border border-transparent'}`}
            >
              <User size={18} /> Public Profile
            </button>
            
            <button 
              onClick={() => { setActiveTab('security'); setMessage({ type: '', text: '' }); }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'security' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/30' : 'bg-[#161B22] text-slate-400 hover:bg-white/5 border border-transparent'}`}
            >
              <Lock size={18} /> Account Security
            </button>
            
            {playerData.isAdmin && (
              <div className="mt-8 pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 px-2">System Admin</p>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 font-bold">
                  <Shield size={18} /> Clearance: Level 9
                </div>
              </div>
            )}
          </div>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="flex-1 bg-[#161B22] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            
            {/* Status Message Display */}
            {message.text && (
              <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                {message.type === 'error' ? <AlertTriangle size={18} /> : <Shield size={18} />}
                {message.text}
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Identity Details</h2>
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Adventurer Name</label>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Scroll Address (Email - Read Only)</label>
                    <input 
                      type="email" 
                      value={currentUser.email} 
                      disabled
                      className="w-full bg-[#0B0E14] border border-white/5 rounded-xl p-4 text-slate-500 opacity-70 cursor-not-allowed"
                    />
                  </div>
                  
                  <button disabled={loading} type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-transform active:scale-95 flex items-center gap-2 mt-4 shadow-[0_0_20px_rgba(168,85,247,0.2)] disabled:opacity-50">
                    <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Forge a New Sigil</h2>
                
                {/* Check if user logged in via Google/Github */}
                {!isPasswordUser ? (
                   <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl text-blue-400">
                     <p className="font-bold flex items-center gap-2 mb-2"><Shield size={18}/> Social Login Detected</p>
                     <p className="text-sm text-blue-400/80 leading-relaxed">You authenticated using {currentUser.providerData[0]?.providerId.split('.')[0]}. Your password is managed directly by that provider. You cannot change it here.</p>
                   </div>
                ) : (
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 text-white focus:border-emerald-500 outline-none transition-colors"
                        required
                        minLength="6"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-4 text-white focus:border-emerald-500 outline-none transition-colors"
                        required
                        minLength="6"
                      />
                    </div>
                    
                    <button disabled={loading} type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-transform active:scale-95 flex items-center gap-2 mt-4 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50">
                      <Lock size={18} /> {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;