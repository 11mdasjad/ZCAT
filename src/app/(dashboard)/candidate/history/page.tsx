'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, Award, TrendingUp } from 'lucide-react';
import { mockTestHistory } from '@/lib/data/mock-analytics';

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Test History</h1>
        <p className="text-sm text-[#8b949e] mt-1">Review your past assessments and track your progress.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tests', value: mockTestHistory.length, icon: CheckCircle, color: '#00d4ff' },
          { label: 'Avg Score', value: '84.3%', icon: TrendingUp, color: '#10b981' },
          { label: 'Best Score', value: '93%', icon: Award, color: '#f59e0b' },
          { label: 'Total Time', value: '48h', icon: Clock, color: '#a855f7' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-4">
            <Icon className="w-5 h-5 mb-2" style={{ color }} />
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-xs text-[#484f58]">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#21262d]">
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider">Assessment</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider">Score</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider">Percentage</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTestHistory.map((test, i) => (
                <motion.tr
                  key={test.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="border-b border-[#21262d]/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-4 text-sm text-white font-medium">{test.title}</td>
                  <td className="px-5 py-4 text-sm text-[#8b949e]">{test.date}</td>
                  <td className="px-5 py-4 text-sm text-white">{test.score}/{test.total}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[80px] h-1.5 bg-[#161b22] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#0066ff] to-[#7c3aed]" style={{ width: `${test.percentage}%` }} />
                      </div>
                      <span className="text-sm text-white">{test.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 capitalize">
                      {test.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
