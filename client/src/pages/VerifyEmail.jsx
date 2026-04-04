import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { sendEmailVerification } from 'firebase/auth';
import { Mail, ArrowRight, ShieldAlert } from 'lucide-react';

const VerifyEmail = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  // If they somehow get here and are already verified, send them to the dashboard
  useEffect(() => {
    if (currentUser?.emailVerified) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSendVerification = async () => {
    setIsSending(true);
    setError('');
    setMessage('');
    
    try {
      await sendEmailVerification(currentUser);
      setMessage('Verification Scroll sent! Teleporting you to the gates...');
      
      // The Magic Trick: Wait 3 seconds, log them out, and send them to the Auth page
      setTimeout(async () => {
        await logout();
        navigate('/auth');
      }, 3000);

    } catch (err) {
      if (err.code === 'auth/too-many-requests') {
        setError('You have sent too many requests. Please wait a moment.');
      } else {
        setError('Failed to send the scroll. Please try again.');
      }
      setIsSending(false);
    }
  };

  const handleCancel = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center p-6 text-slate-200">
      <div className="w-full max-w-md bg-[#161B22] p-10 rounded-3xl border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)] text-center relative overflow-hidden">
        
        <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Verify Your Sigil</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Your identity must be confirmed before you can enter the realm. We need to send a verification scroll to <span className="text-white font-bold">{currentUser?.email}</span>.
        </p>

        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm font-bold">{error}</div>}
        {message && <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-bold">{message}</div>}

        <div className="space-y-4">
          <button 
            onClick={handleSendVerification} 
            disabled={isSending}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-transform active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <Mail size={18} /> {isSending ? 'Casting...' : 'Send Verification Scroll'}
          </button>
          
          <button 
            onClick={handleCancel} 
            disabled={isSending}
            className="w-full bg-transparent border border-white/10 hover:border-white/30 text-slate-400 hover:text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-colors flex justify-center items-center gap-2"
          >
            Return to Gates <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;