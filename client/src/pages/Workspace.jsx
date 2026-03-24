import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Terminal, Users, LogOut } from 'lucide-react';

// Initialize socket connection outside the component so it doesn't reconnect on every render
const socket = io('http://localhost:5000'); 

const Workspace = () => {
  const { guildId } = useParams(); // Gets the guild ID from the URL
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [code, setCode] = useState('// Welcome to the Guild Forge.\n// Start casting your spells here...\n');
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    // 1. Security check
    if (!currentUser) {
      navigate('/');
      return;
    }

    // 2. Join the specific Guild Room
    socket.emit('join_guild_room', guildId);

    // 3. Listen for incoming code from teammates
    socket.on('receive_code', (newCode) => {
      setCode(newCode);
    });

    // 4. Listen for incoming live chat messages
    socket.on('receive_message', (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    // 5. Listen for the room's history when you first join/refresh
    socket.on('message_history', (historyArray) => {
      setMessages(historyArray);
    });

    // 6. Cleanup function when the user leaves the page
    return () => {
      socket.off('receive_code');
      socket.off('receive_message');
      socket.off('message_history');
      socket.emit('leave_guild_room', guildId);
    };
  }, [guildId, currentUser, navigate]);

  // 7. Handle typing and broadcasting
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode); // Update my own screen
    
    // Broadcast the new text to everyone else in the room
    socket.emit('code_update', { guildId, code: newCode });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() !== '') {
      const messageData = {
        sender: currentUser.email.split('@')[0], // Uses the first part of their email as a name
        text: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // 1. Instantly show the message on my own screen
      setMessages((prev) => [...prev, messageData]);
      
      // 2. Broadcast it to the rest of the guild
      socket.emit('send_message', { guildId, messageData });
      
      // 3. Clear the input box
      setCurrentMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 flex flex-col">
      {/* Workspace Header */}
      <header className="bg-[#161B22] border-b border-purple-500/20 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Terminal className="text-purple-500" />
          <h1 className="text-xl font-black text-white tracking-widest uppercase">The Forge</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-sm font-mono flex items-center gap-2 border border-purple-500/30">
            <Users size={16} /> Live Sync Active
          </span>
          <button onClick={() => navigate(`/guild/${guildId}`)} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold">
            <LogOut size={16} /> Leave Forge
          </button>
        </div>
      </header>

      {/* Main Editor Area */}
      <main className="flex-1 flex p-6 gap-6">
        <div className="flex-1 bg-[#161B22] rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl">
          <div className="bg-[#0B0E14] p-3 border-b border-white/5 text-xs font-mono text-slate-500 flex gap-4">
            <span className="text-purple-400">index.js</span>
          </div>
          <textarea
            value={code}
            onChange={handleCodeChange}
            className="flex-1 bg-transparent text-emerald-400 font-mono p-6 outline-none resize-none leading-relaxed"
            spellCheck="false"
          />
        </div>
        
        {/* The Guild Comm-Link (Chat) */}
        <aside className="w-80 bg-[#161B22] rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-[#0B0E14] p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Comm-Link</h3>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          
          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="text-slate-600 text-xs text-center mt-4 italic">No messages yet. Greet your guild!</div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="bg-[#0B0E14] rounded-lg p-3 border border-white/5">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-purple-400 text-xs font-bold">{msg.sender}</span>
                    <span className="text-slate-600 text-[10px]">{msg.time}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#0B0E14] border-t border-white/5">
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