'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Medal } from 'lucide-react';
import { mockLeaderboard } from '@/lib/data/mock-users';

const rankColors = ['#f59e0b', '#8b949e', '#cd7f32'];

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-sm text-[#8b949e] mt-1">Global rankings based on coding challenge performance.</p>
      </div>

      {/* Top 3 */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {mockLeaderboard.slice(0, 3).map((user, i) => {
          const order = [1, 0, 2];
          const u = mockLeaderboard[order[i]];
          return (
            <motion.div
              key={u.rank}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`glass-card rounded-xl p-5 text-center ${i === 1 ? 'row-start-1 scale-105' : ''}`}
            >
              <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center bg-gradient-to-br from-[#0066ff] to-[#7c3aed]">
                <span className="text-lg font-bold text-white">{u.name.charAt(0)}</span>
              </div>
              <Medal className="w-5 h-5 mx-auto mb-1" style={{ color: rankColors[u.rank - 1] || '#484f58' }} />
              <h3 className="text-sm font-semibold text-white">{u.name}</h3>
              <p className="text-xs text-[#484f58] mb-2">{u.college}</p>
              <div className="text-lg font-bold gradient-text">{u.score}</div>
              <p className="text-xs text-[#484f58]">{u.problemsSolved} problems</p>
            </motion.div>
          );
        })}
      </div>

      {/* Full List */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#21262d]">
              <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Rank</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Name</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase hidden sm:table-cell">College</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Score</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Problems</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Trend</th>
            </tr>
          </thead>
          <tbody>
            {mockLeaderboard.map((user, i) => (
              <motion.tr
                key={user.rank}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="border-b border-[#21262d]/50 hover:bg-white/[0.02]"
              >
                <td className="px-5 py-3">
                  <span className={`text-sm font-bold ${i < 3 ? 'gradient-text' : 'text-[#8b949e]'}`}>#{user.rank}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center text-xs font-bold text-white">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm text-white">{user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-[#8b949e] hidden sm:table-cell">{user.college}</td>
                <td className="px-5 py-3 text-sm font-semibold text-white">{user.score}</td>
                <td className="px-5 py-3 text-sm text-[#8b949e]">{user.problemsSolved}</td>
                <td className="px-5 py-3">
                  {user.change === 'up' ? <TrendingUp className="w-4 h-4 text-[#10b981]" /> :
                   user.change === 'down' ? <TrendingDown className="w-4 h-4 text-[#ef4444]" /> :
                   <Minus className="w-4 h-4 text-[#484f58]" />}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
