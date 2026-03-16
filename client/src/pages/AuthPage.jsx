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
      navigate('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center font-sans text-slate-200">
      <div className="bg-[#161B22] p-8 rounded-2xl border border-purple-500/30 shadow-[0_0_20px_rgba(124,77,255,0.2)] w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back, Adventurer' : 'Start Your Quest'}
          </h1>
          <p className="text-slate-400 mt-2">Enter your credentials to enter the Guild</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Scroll Address (Email)</label>
            <input 
              type="email" 
              className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-3 focus:border-purple-500 outline-none transition-all"
              placeholder="name@guild.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Secret Sigil (Password)</label>
            <input 
              type="password" 
              className="w-full bg-[#0B0E14] border border-slate-700 rounded-lg p-3 focus:border-purple-500 outline-none transition-all"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-purple-500/20 transition-all active:scale-95">
            {isLogin ? 'Enter The Guild' : 'Forge Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:underline"
          >
            {isLogin ? "Need an account? Sign up here" : "Already a member? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;