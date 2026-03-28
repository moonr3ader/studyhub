import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SocialLogin from '../components/SocialLogin'; // <-- IMPORT THE COMPONENT HERE

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // Attempt Firebase Login
        await login(email, password);
        navigate('/dashboard'); // If successful, send to dashboard
      } else {
        // Attempt Firebase Signup
        await signup(email, password);
        navigate('/quest'); // If it's a new account, force them to take the quest!
      }
    } catch (err) {
      console.error("FIREBASE REJECTION:", err.code, err.message);
      if (err.code === 'auth/invalid-credential') {
        setError("Incorrect scroll address or secret sigil (Wrong email/password).");
      } else if (err.code === 'auth/too-many-requests') {
        setError("The gates are temporarily locked. Try again later.");
      } else {
        setError(`Gate Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center p-6 text-slate-200">
      
      {/* Branding */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-black text-white tracking-tighter">
          Guild<span className="text-purple-500">Dev</span>
        </h1>
        <div className="h-1 w-12 bg-purple-500 mx-auto mt-2 rounded-full"></div>
      </div>

      {/* The CARD */}
      <div className="w-full max-w-[400px] bg-[#161B22] p-10 rounded-3xl border border-white/5 shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-8 text-white">
          {isLogin ? 'Welcome Back' : 'Join the Guild'}
        </h2>

        {/* ERROR MESSAGE DISPLAY */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Scroll Address</label>
            <input 
              type="email" value={email} className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-3 outline-none focus:border-purple-500 transition-all text-white" placeholder="email@domain.com" onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Secret Sigil</label>
            <input 
              type="password" value={password} className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-3 outline-none focus:border-purple-500 transition-all text-white" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-black uppercase tracking-widest mt-4 transition-transform active:scale-95 shadow-lg shadow-purple-500/20 text-white">
            {isLogin ? 'Enter' : 'Forge'}
          </button>
        </form>

        <SocialLogin setError={setError} />

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