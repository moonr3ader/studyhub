import React from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';

// Mock data to visualize the rankings
const MOCK_LEADERBOARD = [
  { rank: 1, name: "Byte Knights", level: 42, xp: 125000, members: 5 },
  { rank: 2, name: "Syntax Sorcerers", level: 38, xp: 98000, members: 4 },
  { rank: 3, name: "The Root Access", level: 35, xp: 85500, members: 5 },
  { rank: 4, name: "Null Pointers", level: 29, xp: 62000, members: 3 },
  { rank: 5, name: "Frontend Wizards", level: 24, xp: 45000, members: 5 },
];

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-12 text-center">
          <Trophy className="text-yellow-500 w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Hall of Fame</h1>
          <p className="text-slate-400 mt-3 max-w-lg">The most elite guilds in the realm. Complete quests and win hackathons to climb the ranks.</p>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-[#161B22] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0E14]/50 border-b border-white/5 text-xs uppercase tracking-widest text-slate-500">
                <th className="p-6 font-bold w-24 text-center">Rank</th>
                <th className="p-6 font-bold">Guild Name</th>
                <th className="p-6 font-bold text-center">Members</th>
                <th className="p-6 font-bold text-center">Level</th>
                <th className="p-6 font-bold text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_LEADERBOARD.map((guild) => (
                <tr 
                  key={guild.rank} 
                  className={`hover:bg-white/[0.02] transition-colors ${guild.rank === 1 ? 'bg-yellow-500/5' : ''}`}
                >
                  <td className="p-6 text-center">
                    {guild.rank === 1 ? <Crown className="inline text-yellow-500 w-6 h-6" /> : 
                     guild.rank === 2 ? <Medal className="inline text-slate-400 w-6 h-6" /> : 
                     guild.rank === 3 ? <Medal className="inline text-amber-600 w-6 h-6" /> : 
                     <span className="font-bold text-slate-500">#{guild.rank}</span>}
                  </td>
                  <td className="p-6 font-bold text-white text-lg">
                    {guild.name}
                  </td>
                  <td className="p-6 text-center text-slate-400 font-mono text-sm">
                    {guild.members} / 5
                  </td>
                  <td className="p-6 text-center">
                    <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-lg font-bold border border-purple-500/20">
                      Lvl {guild.level}
                    </span>
                  </td>
                  <td className="p-6 text-right font-mono font-bold text-emerald-400">
                    {guild.xp.toLocaleString()} XP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;