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
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-600 font-medium mt-1">Generate and export assessment reports.</p>
        </div>
        <button className="btn-neon btn-neon-primary text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer">
          <Download className="w-4 h-4" /> Export All
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 font-bold shadow-xs">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Last 30 days</span>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-xs cursor-pointer">
          <Filter className="w-4 h-4 text-slate-500" /> Filters
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-xs font-extrabold text-slate-700 uppercase tracking-wider">Report Title</th>
              <th className="px-6 py-4 text-xs font-extrabold text-slate-700 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-extrabold text-slate-700 uppercase tracking-wider">Candidates</th>
              <th className="px-6 py-4 text-xs font-extrabold text-slate-700 uppercase tracking-wider">Avg Score</th>
              <th className="px-6 py-4 text-xs font-extrabold text-slate-700 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {mockTestHistory.map((test, i) => (
              <motion.tr key={test.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{test.title}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-600">{test.date}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                  {candidateCounts.find((item) => item.id === test.id)?.candidates ?? 50}
                </td>
                <td className="px-6 py-4 text-sm font-extrabold text-emerald-600">{test.percentage}%</td>
                <td className="px-6 py-4">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all shadow-xs cursor-pointer">
                    <FileDown className="w-3.5 h-3.5 text-blue-600" /> Export
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
