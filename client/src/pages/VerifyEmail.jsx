import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';

const VerifyEmail = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleResend = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        alert("A new verification scroll has been sent to your inbox!");
      }
    } catch (err) {
      alert("Please wait a moment before requesting another scroll.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-6 text-slate-200">
      <div className="w-full max-w-md bg-[#161B22] p-10 rounded-3xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] text-center relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="bg-[#0B0E14] w-20 h-20 mx-auto rounded-full flex items-center justify-center border border-purple-500/50 mb-6 shadow-lg">
            <Mail className="text-purple-400 w-10 h-10" />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-3">Verify Your Oath</h1>
          
          <p className="text-slate-400 mb-8 leading-relaxed">
            A verification scroll has been sent to <br/>
            <span className="text-purple-400 font-bold">{currentUser?.email}</span>. <br/><br/>
            Please click the link inside to unlock the gates of the Guild Hall. Once verified, refresh this page.
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-black uppercase tracking-widest transition-transform active:scale-95 text-white"
            >
              I have verified my email
            </button>
            
            <button 
              onClick={handleResend} 
              className="w-full bg-transparent border border-white/10 hover:bg-white/5 py-4 rounded-xl font-bold transition-all text-slate-300"
            >
              Resend Scroll
            </button>
          </div>

          <button 
            onClick={handleLogout} 
            className="mt-8 flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 text-sm font-bold uppercase tracking-widest mx-auto transition-colors"
          >
            <ArrowLeft size={16} /> Return to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;