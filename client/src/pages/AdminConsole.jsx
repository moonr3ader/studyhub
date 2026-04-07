import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Trash2, Users, ArrowLeft, Database, Edit, Plus, X, Save } from 'lucide-react';

const AdminConsole = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- MODAL STATES ---
  const [userModal, setUserModal] = useState({ show: false, isEdit: false, data: {} });
  const [guildModal, setGuildModal] = useState({ show: false, isEdit: false, data: {} });

  const fetchAdminData = async () => {
    try {
      const usersRes = await axios.get(`https://guilddev.onrender.com/api/admin/users?adminUid=${currentUser.uid}`);
      setUsers(usersRes.data);
      const guildsRes = await axios.get('https://guilddev.onrender.com/api/guilds');
      setGuilds(guildsRes.data);
    } catch (err) {
      alert("Unauthorized Access. The system rejects you.");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchAdminData();
  }, [currentUser]);

  // ==========================================
  // USER CRUD OPERATIONS
  // ==========================================
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...userModal.data, adminUid: currentUser.uid };
      if (userModal.isEdit) {
        const res = await axios.patch(`https://guilddev.onrender.com/api/admin/users/${userModal.data._id}`, payload);
        setUsers(users.map(u => u._id === res.data._id ? res.data : u));
      } else {
        const res = await axios.post(`https://guilddev.onrender.com/api/admin/users`, payload);
        setUsers([res.data, ...users]);
      }
      setUserModal({ show: false, isEdit: false, data: {} });
    } catch (err) { alert("System Error: Failed to save user data."); }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`CRITICAL: Banish "${username}" entirely?`)) return;
    try {
      await axios.delete(`https://guilddev.onrender.com/api/admin/users/${userId}`, { data: { adminUid: currentUser.uid } });
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) { alert("Failed to banish adventurer."); }
  };

  // ==========================================
  // GUILD CRUD OPERATIONS
  // ==========================================
  const handleSaveGuild = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...guildModal.data, adminUid: currentUser.uid };
      if (guildModal.isEdit) {
        const res = await axios.patch(`https://guilddev.onrender.com/api/admin/guilds/${guildModal.data._id}`, payload);
        setGuilds(guilds.map(g => g._id === res.data._id ? res.data : g));
      } else {
        const res = await axios.post(`https://guilddev.onrender.com/api/admin/guilds`, payload);
        setGuilds([res.data, ...guilds]);
      }
      setGuildModal({ show: false, isEdit: false, data: {} });
    } catch (err) { alert("System Error: Failed to save guild data."); }
  };

  const handleDeleteGuild = async (guildId, guildName) => {
    if (!window.confirm(`CRITICAL: Eradicate guild "${guildName}"?`)) return;
    try {
      await axios.delete(`https://guilddev.onrender.com/api/admin/guilds/${guildId}`, { data: { adminUid: currentUser.uid } });
      setGuilds(guilds.filter(g => g._id !== guildId));
    } catch (err) { alert("Failed to destroy guild."); }
  };

  if (loading) return <div className="min-h-screen bg-[#0B0E14] text-red-500 flex items-center justify-center font-mono animate-pulse uppercase tracking-widest font-black">Connecting to Mainframe...</div>;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-6 md:p-10 relative">
      <div className="max-w-7xl mx-auto">
        
        <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-red-400 transition-colors flex items-center gap-2 font-bold mb-8 uppercase tracking-widest text-xs">
          <ArrowLeft size={14} /> Exit System Admin
        </button>

        <header className="mb-12 flex items-center gap-4 border-b border-red-500/20 pb-6">
          <ShieldAlert className="text-red-500 w-12 h-12" />
          <div>
            <h1 className="text-4xl font-black text-red-500 tracking-tighter uppercase">Overwatch Console</h1>
            <p className="text-red-500/60 font-mono text-sm mt-1 uppercase tracking-widest">God Mode Activated • {users.length} Users • {guilds.length} Guilds</p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          
          {/* USERS DATABASE */}
          <section className="bg-[#161B22] border border-red-500/20 rounded-3xl p-6 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Users className="text-red-500" /> Adventurer Registry
              </h2>
              <button onClick={() => setUserModal({ show: true, isEdit: false, data: { username: '', xp: 0, isAdmin: false } })} className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors">
                <Plus size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              <div className="space-y-3">
                {users.map(user => (
                  <div key={user._id} className="bg-[#0B0E14] border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-red-500/30 transition-colors">
                    <div>
                      <h3 className="font-bold text-white flex items-center gap-2">
                        {user.username} 
                        {user.isAdmin && <span className="text-[9px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded uppercase tracking-widest">Admin</span>}
                      </h3>
                      <p className="text-slate-500 font-mono text-[10px] mt-1">Lvl {user.level} • {user.xp} XP</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setUserModal({ show: true, isEdit: true, data: user })} className="text-slate-500 hover:text-blue-400 p-2"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteUser(user._id, user.username)} className="text-slate-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* GUILDS DATABASE */}
          <section className="bg-[#161B22] border border-red-500/20 rounded-3xl p-6 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Database className="text-red-500" /> Guild Registry
              </h2>
              <button onClick={() => setGuildModal({ show: true, isEdit: false, data: { guildName: '', guildDescription: '' } })} className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors">
                <Plus size={20} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              <div className="space-y-3">
                {guilds.map(guild => (
                  <div key={guild._id} className="bg-[#0B0E14] border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-red-500/30 transition-colors">
                    <div>
                      <h3 className="font-bold text-white">{guild.guildName}</h3>
                      <p className="text-slate-500 font-mono text-[10px] mt-1">{guild.members?.length || 0} Members</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setGuildModal({ show: true, isEdit: true, data: guild })} className="text-slate-500 hover:text-blue-400 p-2"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteGuild(guild._id, guild.guildName)} className="text-slate-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* --- USER MODAL --- */}
      {userModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161B22] border border-red-500/30 rounded-3xl p-8 w-full max-w-md relative">
            <button onClick={() => setUserModal({ show: false, isEdit: false, data: {} })} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24} /></button>
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest">{userModal.isEdit ? 'Edit Record' : 'Inject User'}</h2>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Username</label>
                <input required type="text" value={userModal.data.username || ''} onChange={e => setUserModal({...userModal, data: {...userModal.data, username: e.target.value}})} className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Total XP</label>
                <input required type="number" value={userModal.data.xp || 0} onChange={e => setUserModal({...userModal, data: {...userModal.data, xp: Number(e.target.value)}})} className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white mt-1" />
              </div>
              <label className="flex items-center gap-3 text-white font-bold cursor-pointer">
                <input type="checkbox" checked={userModal.data.isAdmin || false} onChange={e => setUserModal({...userModal, data: {...userModal.data, isAdmin: e.target.checked}})} className="w-5 h-5 accent-red-500" />
                Grant Admin Privileges
              </label>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 py-4 rounded-xl font-black text-white uppercase tracking-widest mt-4 flex justify-center items-center gap-2"><Save size={18}/> Execute</button>
            </form>
          </div>
        </div>
      )}

      {/* --- GUILD MODAL --- */}
      {guildModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161B22] border border-red-500/30 rounded-3xl p-8 w-full max-w-md relative">
            <button onClick={() => setGuildModal({ show: false, isEdit: false, data: {} })} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24} /></button>
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest">{guildModal.isEdit ? 'Rewrite Guild' : 'Force-Forge Guild'}</h2>
            <form onSubmit={handleSaveGuild} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Guild Name</label>
                <input required type="text" value={guildModal.data.guildName || ''} onChange={e => setGuildModal({...guildModal, data: {...guildModal.data, guildName: e.target.value}})} className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                <textarea required rows="3" value={guildModal.data.guildDescription || ''} onChange={e => setGuildModal({...guildModal, data: {...guildModal.data, guildDescription: e.target.value}})} className="w-full bg-[#0B0E14] border border-white/10 rounded-xl p-3 text-white mt-1 resize-none" />
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 py-4 rounded-xl font-black text-white uppercase tracking-widest mt-4 flex justify-center items-center gap-2"><Save size={18}/> Execute</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsole;