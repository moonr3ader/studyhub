import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SocialLogin from '../components/SocialLogin';

const AuthPage = () => {
  // ==========================================
  // STATE & CONTEXT
  // ==========================================
  const { login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // ==========================================
  // HANDLERS
  // ==========================================
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Attempt Firebase Login
        await login(email, password);
        navigate('/dashboard'); 
      } else {
        // Attempt Firebase Signup
        await signup(email, password);
        navigate('/preliminary-quest'); // Send to the onboarding trial!
      }
    } catch (err) {
      console.error("FIREBASE REJECTION:", err.code, err.message);
      if (err.code === 'auth/invalid-credential') {
        setError("Incorrect scroll address or secret sigil (Wrong email/password).");
      } else if (err.code === 'auth/too-many-requests') {
        setError("The gates are temporarily locked. Try again later.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This scroll address is already bound to an adventurer.");
      } else {
        setError(`Gate Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    try {
      await resetPassword(email);
      setResetMessage('A recovery scroll has been sent to your inbox!');
    } catch (err) {
      setError('Failed to send recovery email. Is the address correct?');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // MAIN RENDER
  // ==========================================
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
      <div className="w-full max-w-[400px] bg-[#161B22] p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        
        {/* Dynamic Header */}
        <h2 className="text-2xl font-bold text-center mb-8 text-white">
          {isResetting ? 'Recover Identity' : (isLogin ? 'Welcome Back' : 'Join the Guild')}
        </h2>

        {/* --- DYNAMIC FORM RENDERING --- */}
        {isResetting ? (
          
          /* ======================== RECOVERY MODE ======================== */
          <div className="animate-fade-in">
            <p className="text-slate-400 text-sm text-center mb-6">Enter your email address to receive a password reset scroll.</p>
            
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm font-bold text-center">{error}</div>}
            {resetMessage && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-bold text-center">{resetMessage}</div>}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Scroll Address</label>
                <input 
                  type="email" 
                  placeholder="email@domain.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-3 outline-none focus:border-purple-500 transition-all text-white"
                  required 
                />
              </div>
              <button disabled={loading} type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-transform active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50">
                {loading ? 'Casting...' : 'Send Recovery Scroll'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button onClick={() => { setIsResetting(false); setError(''); setResetMessage(''); }} className="text-sm text-slate-500 hover:text-purple-400 font-semibold transition-colors">
                Wait, I remember it! Back to Login
              </button>
            </div>
          </div>

        ) : (

          /* ======================== LOGIN / SIGNUP MODE ======================== */
          <div className="animate-fade-in">
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-semibold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Scroll Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-3 outline-none focus:border-purple-500 transition-all text-white" 
                  placeholder="email@domain.com" 
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Secret Sigil</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl p-3 outline-none focus:border-purple-500 transition-all text-white" 
                  placeholder="••••••••" 
                  required
                />
                
                {/* Forgot Password Link (Only shows on Login) */}
                {isLogin && (
                  <div className="text-right mt-1">
                    <button type="button" onClick={() => { setIsResetting(true); setError(''); }} className="text-xs text-purple-400 hover:text-purple-300 font-bold transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-black uppercase tracking-widest mt-4 transition-transform active:scale-95 shadow-lg shadow-purple-500/20 text-white disabled:opacity-50">
                {loading ? 'Casting...' : (isLogin ? 'Enter' : 'Forge')}
              </button>
            </form>

            <SocialLogin setError={setError} />

            <div className="mt-8 text-center">
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-slate-500 hover:text-purple-400 font-semibold transition-colors">
                {isLogin ? "New here? Sign up" : "Member? Log in"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthPage;