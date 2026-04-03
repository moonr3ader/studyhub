import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, LogOut, Play, Loader, Trophy, Target, X, Award } from 'lucide-react';
import axios from 'axios';
import Editor from '@monaco-editor/react';

const LANGUAGES = {
  javascript: { name: 'Node.js', judgeId: 93, monaco: 'javascript', defaultCode: 'console.log("Welcome to the Solo Trials!");' },
  python: { name: 'Python', judgeId: 71, monaco: 'python', defaultCode: 'print("Welcome to the Solo Trials!")' },
  cpp: { name: 'C++', judgeId: 54, monaco: 'cpp', defaultCode: '#include <iostream>\n\nint main() {\n    std::cout << "Welcome to the Solo Trials!";\n    return 0;\n}' },
  java: { name: 'Java', judgeId: 62, monaco: 'java', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Welcome to the Solo Trials!");\n    }\n}' }
};

const SoloWorkspace = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const questIdFromBoard = location.state?.activeQuestId; 
  
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeLang, setActiveLang] = useState('javascript'); 
  const [code, setCode] = useState(LANGUAGES['javascript'].defaultCode);

  // Gamification States
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const editorRef = useRef(null);

  // Security Check: Kick them out if they didn't come from the Quest Board
  useEffect(() => {
    if (!questIdFromBoard) {
      navigate('/quest');
    } else {
      openQuestModal(questIdFromBoard);
    }
  }, [questIdFromBoard, navigate]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setActiveLang(newLang);
    setCode(LANGUAGES[newLang].defaultCode);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Compiling and running...');

    const currentCode = editorRef.current.getValue();
    try {
      const response = await axios.post('http://localhost:5000/api/execute', {
        code: currentCode,
        languageId: LANGUAGES[activeLang].judgeId
      });

      const result = response.data;
      if (result.stderr) setOutput(`Error:\n${result.stderr}`);
      else if (result.compile_output) setOutput(`Compilation Error:\n${result.compile_output}`);
      else setOutput(`${result.stdout}\n\n[Execution Time: ${result.time}s]`);
    } catch (error) {
      setOutput('Failed to connect to the execution server.');
    } finally {
      setIsRunning(false);
    }
  };

  const openQuestModal = async (specificId) => {
    setShowQuestModal(true);
    setSubmissionResult(null); 
    try {
      const res = await axios.get(`http://localhost:5000/api/challenges/${specificId}`);
      setActiveChallenge(res.data);
    } catch (error) {
      console.error("Failed to load quest data.", error);
    }
  };

  const handleSubmitChallenge = async () => {
    if (!activeChallenge) return;
    setIsSubmitting(true);
    setSubmissionResult(null);

    const currentCode = editorRef.current.getValue();
    try {
      const response = await axios.post(`http://localhost:5000/api/challenges/${activeChallenge._id}/submit`, {
        userId: currentUser.uid, 
        guildId: null, // Changed 'solo' to null to prevent MongoDB crash!
        code: currentCode,
        languageId: LANGUAGES[activeLang].judgeId
      });
      setSubmissionResult(response.data);
    } catch (error) {
      // Improved error handling to show the real backend error if one exists
      console.error("Detailed Submission Error:", error.response?.data || error.message);
      setSubmissionResult({ 
        success: false, 
        output: error.response?.data?.error || "System Error: Failed to reach the Judges." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveTrial = () => {
    if (activeChallenge && (!submissionResult || !submissionResult.success)) {
      const confirmRetreat = window.confirm(
        "Leaving the trial early? \n\nThis bounty and its XP might not be available the next time you return. Are you sure you want to retreat?"
      );
      if (!confirmRetreat) return; 
    }
    navigate('/quest');
  };

  return (
    <div className="h-screen bg-[#0B0E14] text-slate-200 flex flex-col">
      <header className="bg-[#161B22] border-b border-emerald-500/20 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Terminal className="text-emerald-500" />
          <h1 className="text-xl font-black text-white tracking-widest uppercase">Solo Trial</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowQuestModal(true)} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
            <Target size={16} /> Active Quest
          </button>
          <button onClick={handleRunCode} disabled={isRunning} className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
            {isRunning ? <Loader className="animate-spin" size={16} /> : <Play size={16} />}
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          <button onClick={handleLeaveTrial} className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-2 text-sm font-bold ml-2">
            <LogOut size={16} /> Leave
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-6 gap-6 min-h-0">
        <div className="flex-[2] bg-[#161B22] rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl min-h-0">
          <div className="bg-[#0B0E14] p-3 border-b border-white/5 text-xs font-mono text-slate-500 flex justify-between items-center shrink-0">
            <span className="text-emerald-400">workspace.{LANGUAGES[activeLang].monaco === 'python' ? 'py' : LANGUAGES[activeLang].monaco === 'cpp' ? 'cpp' : LANGUAGES[activeLang].monaco === 'java' ? 'java' : 'js'}</span>
            <select value={activeLang} onChange={handleLanguageChange} className="bg-[#161B22] border border-white/10 text-slate-300 text-xs rounded px-2 py-1 outline-none focus:border-emerald-500">
              {Object.keys(LANGUAGES).map(langKey => <option key={langKey} value={langKey}>{LANGUAGES[langKey].name}</option>)}
            </select>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              theme="vs-dark"
              language={LANGUAGES[activeLang].monaco}
              value={code}
              onChange={(val) => setCode(val)}
              onMount={handleEditorDidMount} 
              options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', padding: { top: 16 } }}
            />
          </div>
        </div>

        <div className="flex-1 bg-[#0B0E14] rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl min-h-0">
          <div className="bg-[#161B22] p-2 px-4 border-b border-white/5 text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">Output Terminal</div>
          <div className="flex-1 p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap text-slate-300">{output || <span className="text-slate-600 italic">Awaiting execution...</span>}</div>
        </div>
      </main>

      {/* Quest Modal */}
      {showQuestModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#161B22] border border-amber-500/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0B0E14] p-4 border-b border-white/5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3"><Trophy className="text-amber-400" /><h2 className="text-lg font-black text-white tracking-widest uppercase">Solo Bounty</h2></div>
              <button onClick={() => setShowQuestModal(false)} className="text-slate-500 hover:text-rose-400 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              {activeChallenge ? (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-slate-100">{activeChallenge.title}</h3>
                    <span className="bg-amber-500/10 text-amber-400 font-mono font-bold px-3 py-1 rounded-full text-sm border border-amber-500/20">+{activeChallenge.totalXP} XP</span>
                  </div>
                  <div className="bg-[#0B0E14] border border-white/5 p-4 rounded-xl mb-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Instructions</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{activeChallenge.description}</p>
                  </div>
                  {submissionResult && (
                    <div className={`p-4 rounded-xl mb-6 border ${submissionResult.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                      <h4 className={`text-sm font-bold mb-2 ${submissionResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>{submissionResult.message}</h4>
                      <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap bg-[#0B0E14] p-3 rounded-lg border border-white/5">{submissionResult.output}</pre>
                      {submissionResult.newBadge && (
                        <div className="mt-4 flex items-center gap-3 bg-amber-500/20 border border-amber-500/40 p-3 rounded-lg animate-pulse">
                          <Award className="text-amber-400" size={24} />
                          <div><p className="text-xs text-amber-200 font-bold uppercase">Badge Unlocked!</p><p className="text-sm text-amber-400 font-black">{submissionResult.newBadge.badgeTitle}</p></div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setShowQuestModal(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-white transition-colors">Keep Coding</button>
                    <button onClick={handleSubmitChallenge} disabled={isSubmitting || (submissionResult && submissionResult.success)} className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-[#0B0E14] px-6 py-2 rounded-lg text-sm font-black tracking-wide flex items-center gap-2 transition-all">
                      {isSubmitting ? <Loader className="animate-spin" size={16} /> : <Target size={16} />}
                      {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
                    </button>
                  </div>
                </>
              ) : (<div className="flex justify-center p-8"><Loader className="animate-spin text-amber-500" /></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoloWorkspace;