import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Terminal, Users, LogOut, Play, Loader, Save, Trophy, Target, X, Award, Lock } from 'lucide-react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

const socket = io('http://localhost:5000'); 

const LANGUAGES = {
  javascript: { 
    name: 'Node.js', judgeId: 93, monaco: 'javascript', 
    defaultCode: 'console.log("Welcome to the Guild Forge!");' 
  },
  python: { 
    name: 'Python', judgeId: 71, monaco: 'python', 
    defaultCode: 'print("Welcome to the Guild Forge!")' 
  },
  cpp: { 
    name: 'C++', judgeId: 54, monaco: 'cpp', 
    defaultCode: '#include <iostream>\n\nint main() {\n    std::cout << "Welcome to the Guild Forge!";\n    return 0;\n}' 
  },
  java: { 
    name: 'Java', judgeId: 62, monaco: 'java', 
    defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Welcome to the Guild Forge!");\n    }\n}' 
  }
};

const Workspace = () => {
  const { guildId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const questIdFromBoard = location.state?.activeQuestId; 
  
  // --- CHAT STATES ---
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  
  // --- CODING & EXECUTION STATES ---
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeLang, setActiveLang] = useState('javascript'); 

  // --- GAMIFICATION STATES  ---
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // --- REFS ---
  const editorRef = useRef(null);
  const ydocRef = useRef(null);
  const providerRef = useRef(null);

  // 1. CHAT & SYSTEM SOCKET INITIALIZATION
  useEffect(() => {
    if (!currentUser) { navigate('/'); return; }

    const username = currentUser.email.split('@')[0];
    socket.emit('join_guild_room', { guildId, username, uid: currentUser.uid });

    socket.on('receive_message', (messageData) => setMessages((prev) => [...prev, messageData]));
    socket.on('message_history', (historyArray) => setMessages(historyArray));

    return () => {
      socket.off('receive_message');
      socket.off('message_history');
      socket.emit('leave_guild_room', guildId);

      if (providerRef.current) providerRef.current.destroy();
      if (ydocRef.current) ydocRef.current.destroy();
    };
  }, [guildId, currentUser, navigate]);

  // 2. QUEST AUTO-LOADER
  useEffect(() => {
    if (questIdFromBoard) {
      openQuestModal(questIdFromBoard);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questIdFromBoard]);

  // --- EDITOR & COLLABORATION LOGIC ---
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    
    const provider = new WebsocketProvider('ws://localhost:1234', `forge-room-${guildId}`, ydoc);
    providerRef.current = provider;
    
    const username = currentUser.email.split('@')[0];
    const userColors = ['#ffb61e', '#ff5252', '#00e676', '#2979ff', '#e040fb'];
    const myColor = userColors[Math.floor(Math.random() * userColors.length)];

    provider.awareness.setLocalStateField('user', {
      name: username,
      color: myColor,
    });
    
    const ytext = ydoc.getText('monaco');
    // Bind Yjs to the Monaco Editor
    new MonacoBinding(ytext, editor.getModel(), new Set([editor]), provider.awareness);
    
    // Load initial code from DB, or load default template
    axios.get(`http://localhost:5000/api/guilds/${guildId}`)
      .then(res => {
        if (res.data && res.data.savedCode && ytext.toString() === '') {
          ytext.insert(0, res.data.savedCode);
        } else if (ytext.toString() === '') {
          ytext.insert(0, LANGUAGES[activeLang].defaultCode);
        }
      })
      .catch(err => console.error("Failed to fetch initial code:", err));
  };

  const handleLanguageChange = (e) => {
    setActiveLang(e.target.value);
  };

  // --- ACTIONS ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() !== '') {
      const messageData = {
        sender: currentUser.email.split('@')[0],
        text: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, messageData]);
      socket.emit('send_message', { guildId, messageData });
      setCurrentMessage('');
    }
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
      if (result.stderr) {
        setOutput(`Error:\n${result.stderr}`);
      } else if (result.compile_output) {
        setOutput(`Compilation Error:\n${result.compile_output}`);
      } else {
        setOutput(`${result.stdout}\n\n[Execution Time: ${result.time}s]`);
      }
    } catch (error) {
      setOutput('Failed to connect to the execution server.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveCode = async () => {
    setIsSaving(true);
    const currentCode = editorRef.current.getValue();
    try {
      await axios.put(`http://localhost:5000/api/guilds/${guildId}/save`, { code: currentCode });
      setOutput((prev) => `[System]: Code successfully saved to Forge database.\n\n${prev}`);
    } catch (error) {
      setOutput((prev) => `[System Error]: Failed to save code to database.\n\n${prev}`);
    } finally {
      setIsSaving(false);
    }
  };

  const hasConquered = submissionResult?.success || submissionResult?.output?.includes('already conquered');
  const handleLeaveForge = async () => {
    if (activeChallenge && !hasConquered) {
      const confirmRetreat = window.confirm(
        "Leaving the Forge without conquering the trial? \n\nThis bounty and its XP might not be available the next time you return. Are you sure you want to retreat?"
      );
      
      // If they click "Cancel", stop the function and keep them in the room
      if (!confirmRetreat) return; 
    }

    // If they click "OK" (or if they already won), proceed as normal
    await handleSaveCode();
    navigate(`/guild/${guildId}`);
  };

  // --- GAMIFICATION LOGIC ---
  const openQuestModal = async (specificId = null) => {
    setShowQuestModal(true);
    setSubmissionResult(null); 
    
    try {
      const targetId = specificId || questIdFromBoard;
      const url = targetId 
        ? `http://localhost:5000/api/challenges/${targetId}`
        : `http://localhost:5000/api/challenges/active`;

      const res = await axios.get(url);
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
        guildId: guildId,
        code: currentCode,
        languageId: LANGUAGES[activeLang].judgeId
      });

      setSubmissionResult(response.data);
    } catch (error) {
      // Extract the actual backend error message instead of the hardcoded one
      console.error("Detailed Submission Error:", error.response?.data || error.message);
      setSubmissionResult({ 
        success: false, 
        output: error.response?.data?.error || "System Error: Failed to reach the Judges." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-[#0B0E14] text-slate-200 flex flex-col">
      <header className="bg-[#161B22] border-b border-purple-500/20 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Terminal className="text-purple-500" />
          <h1 className="text-xl font-black text-white tracking-widest uppercase">The Forge</h1>
        </div>
        <div className="flex items-center gap-4">
          
          <button 
            onClick={handleSaveCode}
            disabled={isSaving}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <Save size={16} className={isSaving ? "animate-pulse text-purple-400" : ""} /> 
            {isSaving ? 'Saving...' : 'Save'}
          </button>

          {/* Active Quest Button */}
          <button 
            onClick={() => openQuestModal(questIdFromBoard)}
            disabled={!questIdFromBoard}
            title={!questIdFromBoard ? "Accept a contract from the Quest Board first!" : "View Active Quest"}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all border
              ${!questIdFromBoard 
                ? 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed' 
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
          >
            {!questIdFromBoard ? <Lock size={16} /> : <Target size={16} />}
            {!questIdFromBoard ? 'No Active Quest' : 'Active Quest'}
          </button>

          <button 
            onClick={handleRunCode}
            disabled={isRunning}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
          >
            {isRunning ? <Loader className="animate-spin" size={16} /> : <Play size={16} />}
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          
          <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-sm font-mono flex items-center gap-2 border border-purple-500/30">
            <Users size={16} /> Live Sync
          </span>
          
          {/* Dynamic Leave/Victory Button */}
          <button 
            onClick={handleLeaveForge} 
            className={`transition-colors flex items-center gap-2 text-sm font-bold ml-2 ${
              hasConquered 
                ? 'text-emerald-400 hover:text-emerald-300' 
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            {hasConquered ? <Trophy size={16} /> : <LogOut size={16} />}
            {hasConquered ? 'Claim Victory & Exit' : 'Leave'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex p-6 gap-6 min-h-0">
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          
          <div className="flex-[2] bg-[#161B22] rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl min-h-0">
            <div className="bg-[#0B0E14] p-3 border-b border-white/5 text-xs font-mono text-slate-500 flex justify-between items-center shrink-0">
              <span className="text-purple-400">workspace.{LANGUAGES[activeLang].monaco === 'python' ? 'py' : LANGUAGES[activeLang].monaco === 'cpp' ? 'cpp' : LANGUAGES[activeLang].monaco === 'java' ? 'java' : 'js'}</span>
              
              <select 
                value={activeLang}
                onChange={handleLanguageChange}
                className="bg-[#161B22] border border-white/10 text-slate-300 text-xs rounded px-2 py-1 outline-none focus:border-purple-500"
              >
                {Object.keys(LANGUAGES).map(langKey => (
                  <option key={langKey} value={langKey}>{LANGUAGES[langKey].name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                theme="vs-dark"
                language={LANGUAGES[activeLang].monaco}
                onMount={handleEditorDidMount} 
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>

          <div className="flex-1 bg-[#0B0E14] rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl min-h-0">
            <div className="bg-[#161B22] p-2 px-4 border-b border-white/5 text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">
              Output Terminal
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap text-slate-300">
              {output || <span className="text-slate-600 italic">Awaiting execution...</span>}
            </div>
          </div>

        </div>
        
        <aside className="w-80 bg-[#161B22] rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-2xl min-h-0">
          <div className="bg-[#0B0E14] p-4 border-b border-white/5 flex items-center justify-between shrink-0">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Comm-Link</h3>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="text-slate-600 text-xs text-center mt-4 italic">No messages yet. Greet your guild!</div>
            ) : (
              messages.map((msg, index) => {
                if (msg.isSystem || msg.sender === 'System') {
                  return (
                    <div key={index} className="flex justify-center shrink-0 my-1">
                      <span className="bg-white/5 px-3 py-1 rounded-full text-[11px] font-mono text-slate-400 italic border border-white/5">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={index} className="bg-[#0B0E14] rounded-lg p-3 border border-white/5 shrink-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-purple-400 text-xs font-bold">{msg.sender}</span>
                      <span className="text-slate-600 text-[10px]">{msg.time}</span>
                    </div>
                    <p className="text-slate-300 text-sm">{msg.text}</p>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-[#0B0E14] border-t border-white/5 shrink-0">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Send a message..."
              className="w-full bg-[#161B22] border border-slate-700 rounded-lg p-2 text-sm outline-none focus:border-purple-500 text-white transition-colors"
            />
          </form>
        </aside>
      </main>

      {/* ========================================= */}
      {/* GAMIFICATION QUEST MODAL          */}
      {/* ========================================= */}
      {showQuestModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#161B22] border border-amber-500/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#0B0E14] p-4 border-b border-white/5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Trophy className="text-amber-400" />
                <h2 className="text-lg font-black text-white tracking-widest uppercase">Active Guild Quest</h2>
              </div>
              <button onClick={() => setShowQuestModal(false)} className="text-slate-500 hover:text-rose-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {activeChallenge ? (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-slate-100">{activeChallenge.title}</h3>
                    <span className="bg-amber-500/10 text-amber-400 font-mono font-bold px-3 py-1 rounded-full text-sm border border-amber-500/20">
                      +{activeChallenge.totalXP} XP
                    </span>
                  </div>
                  
                  <div className="bg-[#0B0E14] border border-white/5 p-4 rounded-xl mb-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Instructions</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{activeChallenge.description}</p>
                  </div>

                  {/* Submission Results Area */}
                  {submissionResult && (
                    <div className={`p-4 rounded-xl mb-6 border ${submissionResult.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                      <h4 className={`text-sm font-bold mb-2 ${submissionResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {submissionResult.message}
                      </h4>
                      <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap bg-[#0B0E14] p-3 rounded-lg border border-white/5">
                        {submissionResult.output}
                      </pre>
                      
                      {/* Badge Unlocked Notification */}
                      {submissionResult.newBadge && (
                        <div className="mt-4 flex items-center gap-3 bg-amber-500/20 border border-amber-500/40 p-3 rounded-lg animate-pulse">
                          <Award className="text-amber-400" size={24} />
                          <div>
                            <p className="text-xs text-amber-200 font-bold uppercase">Badge Unlocked!</p>
                            <p className="text-sm text-amber-400 font-black">{submissionResult.newBadge.badgeTitle}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      onClick={() => setShowQuestModal(false)}
                      className="px-4 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Keep Coding
                    </button>
                    <button 
                      onClick={handleSubmitChallenge}
                      disabled={isSubmitting || (submissionResult && submissionResult.success)}
                      className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-[#0B0E14] px-6 py-2 rounded-lg text-sm font-black tracking-wide flex items-center gap-2 transition-all"
                    >
                      {isSubmitting ? <Loader className="animate-spin" size={16} /> : <Target size={16} />}
                      {isSubmitting ? 'Evaluating...' : 'Submit Solution to Judges'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-center p-8"><Loader className="animate-spin text-amber-500" /></div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Workspace;