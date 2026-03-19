import React, { useState } from 'react';
import { Terminal, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PreliminaryQuest = () => {
  const [code, setCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  
  // 2. Extract the currently logged-in Firebase user
  const { currentUser } = useAuth(); 

  const handleVerify = async () => {
    const cleanedCode = code.replace(/\s+/g, '').toLowerCase();
    
    if (cleanedCode.includes('returna+b')) {
      try {
        // 3. Prevent crashing if someone bypasses the login screen
        if (!currentUser) {
          alert("You must be logged in to cast this spell!");
          return;
        }

        // 4. Send the REAL Firebase data to MongoDB
        const response = await axios.post('http://localhost:5000/api/user/qualify', {
          uid: currentUser.uid,               // The unique Google Firebase ID
          email: currentUser.email,           // Their login email
          username: currentUser.email.split('@')[0] // Temporary username generator
        });

        console.log("Real Server Response:", response.data); 
        setIsSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);

      } catch (error) {
        console.error("Connection failed:", error);
        alert("The server rejected the spell!");
      }

    } else {
      alert(`The spell failed! React saw: "${code}"`);
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
            &nbsp;&nbsp;
            <input 
              type="text"
              className="bg-transparent border-b-2 border-purple-500/30 focus:border-purple-500 outline-none w-full text-emerald-400"
              placeholder=" // Your code here"
              value={code}
              onChange={(e) => setCode(e.target.value)} 
              
              disabled={isSuccess}
            />
            <br />
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