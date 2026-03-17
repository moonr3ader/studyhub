import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PreliminaryQuest = () => {
  const [answer, setAnswer] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async () => {
    // Simple logic check for Day 2
    if (answer.trim() === "return a + b" || answer.trim() === "a + b") {
      try {
        await axios.post('http://localhost:5000/api/user/qualify', {
          uid: currentUser.uid,
          username: currentUser.email.split('@')[0],
          email: currentUser.email
        });
        alert("Quest Complete! XP Awarded.");
        navigate('/dashboard');
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("The code did not pass the trial. Try again.");
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