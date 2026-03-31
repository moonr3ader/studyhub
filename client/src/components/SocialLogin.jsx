import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Chrome, Github } from 'lucide-react';

// Notice we are passing `setError` as a prop now!
const SocialLogin = ({ setError }) => {
  const { loginWithGoogle, loginWithGithub } = useAuth();
  const navigate = useNavigate();
  
  const handleSocialClick = async (action) => {
    try {
      setError(''); // Clear any old errors
      
      // Now we receive both the verification status AND the new user status
      const { isVerified, isNewUser } = await action();
      
      if (isVerified) {
        if (isNewUser) {
          // It's their first time! Send them to the quest to create their DB record.
          navigate('/quest'); 
        } else {
          // They are a returning veteran. Send them to the Hub.
          navigate('/dashboard'); 
        }
      }
    } catch (err) {
      console.error("SOCIAL AUTH REJECTION:", err);
      
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError("An account already exists with this email. Please log in using your password instead.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("The login window was closed before finishing.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized in your Firebase Console settings.");
      } else {
        setError(`Auth Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-3 w-full mt-6">
      <div className="relative flex items-center justify-center mb-6">
        <div className="border-t border-white/5 w-full"></div>
        <span className="bg-[#0B0E14] px-4 text-slate-500 text-xs font-bold uppercase tracking-widest absolute">Or continue with</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          type="button" /* Prevents accidental form submission */
          onClick={() => handleSocialClick(loginWithGoogle)}
          className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white py-3 rounded-xl font-bold transition-all active:scale-95"
        >
          <Chrome size={20} className="text-blue-400" />
          <span className="text-sm">Google</span>
        </button>

        <button 
          type="button" 
          onClick={() => handleSocialClick(loginWithGithub)}
          className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white py-3 rounded-xl font-bold transition-all active:scale-95"
        >
          <Github size={20} />
          <span className="text-sm">GitHub</span>
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;