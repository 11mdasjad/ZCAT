'use client';

import { motion } from 'framer-motion';
import { FileDown, Calendar, Filter, Download } from 'lucide-react';
import { mockTestHistory } from '@/lib/data/mock-analytics';

const candidateCounts = mockTestHistory.map((test, index) => ({
  id: test.id,
  candidates: 50 + ((index + 1) * 37) % 200,
}));

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-[#8b949e] mt-1">Generate and export assessment reports.</p>
        </div>
        <button className="btn-neon btn-neon-primary text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export All
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161b22] border border-[#21262d] text-sm text-[#8b949e]">
          <Calendar className="w-4 h-4" />
          <span>Last 30 days</span>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161b22] border border-[#21262d] text-sm text-[#8b949e] hover:border-[#30363d] transition-colors">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#21262d]">
              <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Report</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Date</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Candidates</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Avg Score</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockTestHistory.map((test, i) => (
              <motion.tr key={test.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="border-b border-[#21262d]/50 hover:bg-white/[0.02]">
                <td className="px-5 py-4 text-sm text-white">{test.title}</td>
                <td className="px-5 py-4 text-sm text-[#8b949e]">{test.date}</td>
                <td className="px-5 py-4 text-sm text-[#8b949e]">
                  {candidateCounts.find((item) => item.id === test.id)?.candidates ?? 50}
                </td>
                <td className="px-5 py-4 text-sm text-white">{test.percentage}%</td>
                <td className="px-5 py-4">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#21262d] text-xs text-[#8b949e] hover:text-[#00d4ff] hover:border-[#00d4ff]/30 transition-all">
                    <FileDown className="w-3 h-3" /> Export
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
