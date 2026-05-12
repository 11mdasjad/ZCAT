'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreHorizontal, Mail, Ban, CheckCircle, Eye } from 'lucide-react';
import { mockCandidates } from '@/lib/data/mock-users';

export default function CandidatesPage() {
  const [search, setSearch] = useState('');
  const filtered = mockCandidates.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Manage Candidates</h1>
        <p className="text-sm text-[#8b949e] mt-1">View and manage all registered candidates.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidates..." className="input-neon w-full !pl-10" />
        </div>
        <button className="btn-neon btn-neon-secondary !py-2 !px-4 text-sm flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#21262d]">
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Candidate</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase hidden md:table-cell">College</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Score</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase hidden sm:table-cell">Tests</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#8b949e] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-[#21262d]/50 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center text-xs font-bold text-white">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{c.name}</p>
                        <p className="text-xs text-[#484f58]">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-[#8b949e] hidden md:table-cell">{c.college}</td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold text-white">{c.avgScore}%</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-[#8b949e] hidden sm:table-cell">{c.testsCompleted}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      c.status === 'active' ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' : 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all" title="View"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#a855f7] hover:bg-[#a855f7]/10 transition-all" title="Email"><Mail className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all" title="Suspend"><Ban className="w-3.5 h-3.5" /></button>
                    </div>
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
