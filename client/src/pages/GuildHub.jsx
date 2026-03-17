import React, { useState } from 'react';
import { Shield, Users, Plus, Search } from 'lucide-react';

const MOCK_GUILDS = [
  { id: 1, name: "Byte Knights", desc: "Grinding LeetCode and building scalable APIs.", members: 4, level: 12 },
  { id: 2, name: "Syntax Sorcerers", desc: "Frontend wizards specializing in React and Framer Motion.", members: 3, level: 8 },
  { id: 3, name: "The Bug Hunters", desc: "Focused on QA, security, and cleaning up messy code.", members: 5, level: 15 }
];

const GuildHub = () => {
  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">The Guild Hall</h1>
          <p className="text-slate-500">Find your tribe and start collaborating on real-time projects[cite: 92].</p>
        </div>
        <button className="btn btn-primary bg-purple-600 border-none shadow-lg shadow-purple-500/20 px-8">
          <Plus size={20} /> Forge New Guild
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input 
          type="text" 
          placeholder="Search for a Guild..." 
          className="input input-bordered w-full pl-12 bg-[#161B22] border-white/10 focus:border-purple-500"
        />
      </div>

      {/* Guild Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_GUILDS.map((guild) => (
          <div key={guild.id} className="bg-[#161B22] border border-white/5 rounded-3xl p-6 hover:border-purple-500/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                <Shield size={24} />
              </div>
              <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-slate-400">LVL {guild.level}</span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{guild.name}</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">{guild.desc}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Users size={16} /> <span>{guild.members} / 5</span>
              </div>
              <button className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                Apply to Join
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuildHub;