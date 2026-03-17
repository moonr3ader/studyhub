import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/dashboard'); // Successful auth redirects to hub [cite: 167-168]
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    /* This outer div centers everything on the screen */
    <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center p-6 text-slate-200">
      
      {/* Branding */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-black text-white tracking-tighter">
          Guild<span className="text-purple-500">Dev</span>
        </h1>
        <div className="h-1 w-12 bg-purple-500 mx-auto mt-2 rounded-full"></div>
      </div>

      {/* The CARD - This is what was missing the proper width/padding */}
      <div className="w-full max-w-[400px] bg-[#161B22] p-10 rounded-3xl border border-white/5 shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-8 text-white">
          {isLogin ? 'Welcome Back' : 'Join the Guild'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Scroll Address</label>
            <input 
              type="email" 
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-3 outline-none focus:border-purple-500 transition-all"
              placeholder="email@domain.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Secret Sigil</label>
            <input 
              type="password" 
              className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-3 outline-none focus:border-purple-500 transition-all"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-black uppercase tracking-widest mt-4 transition-transform active:scale-95">
            {isLogin ? 'Enter' : 'Forge'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-slate-500 hover:text-purple-400 font-semibold transition-colors">
            {isLogin ? "New here? Sign up" : "Member? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;