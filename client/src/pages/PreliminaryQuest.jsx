import React, { useState } from 'react';
import { Terminal, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PreliminaryQuest = () => {
  const [code, setCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    // 1. Basic frontend logic check
    if (code.trim().includes('return a + b') || code.trim().includes('a+b')) {
      
      try {
        // 2. The Real API Call to your Backend!
        // We are sending mock user data for now since Firebase isn't fully hooked up
        const response = await axios.post('http://localhost:5000/api/user/qualify', {
          uid: "test-user-123", 
          username: "NoviceCoder",
          email: "novice@guild.dev"
        });

        console.log("Server Response:", response.data); // Look at this in your browser console!
        
        setIsSuccess(true);
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => navigate('/dashboard'), 2000);

      } catch (error) {
        console.error("Connection failed:", error);
        alert("The server rejected the spell! Is your backend running?");
      }

    } else {
      alert("The spell failed! Check your syntax.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-10 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-4 text-purple-400">Trial of Addition</h1>
        <div className="bg-[#161B22] p-6 rounded-t-xl border-x border-t border-slate-700">
          <p className="text-lg text-slate-300 mb-4">
            "To enter the Guild, you must write the logic for a function that returns the sum of <span className="text-blue-400">a</span> and <span className="text-blue-400">b</span>."
          </p>
          <code className="block bg-[#0B0E14] p-4 rounded-lg font-mono text-emerald-400 mb-4">
            function sum(a, b) {"{"} <br />
            &nbsp;&nbsp; // Write your code below <br />
            &nbsp;&nbsp; <input 
              className="bg-transparent border-b border-purple-500 outline-none text-white w-40"
              placeholder="Your logic here"
              onChange={(e) => setAnswer(e.target.value)}
            /> <br />
            {"}"}
          </code>
        </div>
        <button 
          onClick={handleVerify}
          className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-b-xl font-bold uppercase tracking-widest"
        >
          Cast Spell (Submit)
        </button>
      </div>
    </div>
  );
};

export default PreliminaryQuest;