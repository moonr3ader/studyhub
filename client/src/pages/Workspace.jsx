import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Terminal, Users, LogOut, Play, Loader, Save } from 'lucide-react'; 
import axios from 'axios';
import Editor from '@monaco-editor/react';

const socket = io('http://localhost:5000'); 

// NEW: Language Mapping (Judge0 ID <-> Monaco Language)
const LANGUAGES = {
  javascript: { name: 'Node.js', judgeId: 93, monaco: 'javascript', defaultCode: 'console.log("Welcome to the Guild Forge!");' },
  python: { name: 'Python', judgeId: 71, monaco: 'python', defaultCode: 'print("Welcome to the Guild Forge!")' },
  cpp: { name: 'C++', judgeId: 54, monaco: 'cpp', defaultCode: '#include <iostream>\n\nint main() {\n    std::cout << "Welcome to the Guild Forge!";\n    return 0;\n}' },
  java: { name: 'Java', judgeId: 62, monaco: 'java', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Welcome to the Guild Forge!");\n    }\n}' }
};

const Workspace = () => {
  const { guildId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [code, setCode] = useState(LANGUAGES.javascript.defaultCode);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  
  // --- EXECUTION & EDITOR STATES ---
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Track the selected language key (e.g., 'javascript', 'python')
  const [activeLang, setActiveLang] = useState('javascript'); 

useEffect(() => {
    if (!currentUser) { navigate('/'); return; }

    const username = currentUser.email.split('@')[0];

    const loadSavedCode = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/guilds/${guildId}`);
        if (response.data && response.data.savedCode) {
          setCode(response.data.savedCode);
        }
      } catch (error) {
        console.error("Failed to load the previous Forge code.", error);
      }
    };

    loadSavedCode();

    // UPDATED: Send the username along with the guildId
    socket.emit('join_guild_room', { guildId, username });

    socket.on('receive_code', (newCode) => setCode(newCode));
    socket.on('receive_message', (messageData) => setMessages((prev) => [...prev, messageData]));
    socket.on('message_history', (historyArray) => setMessages(historyArray));

    return () => {
      socket.off('receive_code');
      socket.off('receive_message');
      socket.off('message_history');
      // Emit the leave event so the server broadcasts the departure
      socket.emit('leave_guild_room', guildId);
    };
  }, [guildId, currentUser, navigate]);

  // NEW: Updated for Monaco Editor (receives value directly, not an event)
  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit('code_update', { guildId, code: value });
  };

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
    
    try {
      const response = await axios.post('http://localhost:5000/api/execute', {
        code,
        languageId: LANGUAGES[activeLang].judgeId // Pass correct Judge0 ID
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

  // NEW: Save to MongoDB
  const handleSaveCode = async () => {
    setIsSaving(true);
    try {
      await axios.put(`http://localhost:5000/api/guilds/${guildId}/save`, { code });
      setOutput((prev) => `[System]: Code successfully saved to Forge database.\n\n${prev}`);
    } catch (error) {
      setOutput((prev) => `[System Error]: Failed to save code to database.\n\n${prev}`);
    } finally {
      setIsSaving(false);
    }
  };

  // NEW: Save then Leave gracefully
  const handleLeaveForge = async () => {
    await handleSaveCode();
    navigate(`/guild/${guildId}`);
  };

  // NEW: Handle Language Swap
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setActiveLang(newLang);
    // Optional: Reset code to default when swapping languages
    // setCode(LANGUAGES[newLang].defaultCode); 
  };

  return (
    <div className="h-screen bg-[#0B0E14] text-slate-200 flex flex-col">
      <header className="bg-[#161B22] border-b border-purple-500/20 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Terminal className="text-purple-500" />
          <h1 className="text-xl font-black text-white tracking-widest uppercase">The Forge</h1>
        </div>
        <div className="flex items-center gap-4">
          
          {/* NEW: Manual Save Button */}
          <button 
            onClick={handleSaveCode}
            disabled={isSaving}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <Save size={16} className={isSaving ? "animate-pulse text-purple-400" : ""} /> 
            {isSaving ? 'Saving...' : 'Save'}
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
          
          {/* UPDATED: Save & Leave */}
          <button onClick={handleLeaveForge} className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-2 text-sm font-bold ml-2">
            <LogOut size={16} /> Leave
          </button>
        </div>
      </header>

      <main className="flex-1 flex p-6 gap-6 min-h-0">
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          
          <div className="flex-[2] bg-[#161B22] rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl min-h-0">
            <div className="bg-[#0B0E14] p-3 border-b border-white/5 text-xs font-mono text-slate-500 flex justify-between items-center shrink-0">
              <span className="text-purple-400">workspace.{LANGUAGES[activeLang].monaco === 'python' ? 'py' : LANGUAGES[activeLang].monaco === 'cpp' ? 'cpp' : LANGUAGES[activeLang].monaco === 'java' ? 'java' : 'js'}</span>
              
              {/* NEW: Language Selector */}
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
            
            {/* NEW: Monaco Editor Replaces Textarea */}
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                theme="vs-dark"
                language={LANGUAGES[activeLang].monaco}
                value={code}
                onChange={handleCodeChange}
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
          
          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="text-slate-600 text-xs text-center mt-4 italic">No messages yet. Greet your guild!</div>
            ) : (
              messages.map((msg, index) => {
                // NEW: Special styling for System join/leave alerts
                if (msg.isSystem || msg.sender === 'System') {
                  return (
                    <div key={index} className="flex justify-center shrink-0 my-1">
                      <span className="bg-white/5 px-3 py-1 rounded-full text-[11px] font-mono text-slate-400 italic border border-white/5">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                // EXISTING: Standard user message styling
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
    </div>
  );
};

export default Workspace;