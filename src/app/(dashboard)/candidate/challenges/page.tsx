'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Code2, Clock, CheckCircle, Filter, Search } from 'lucide-react';
import { mockCodingQuestions } from '@/lib/data/mock-exams';

const difficultyColors = {
  easy: { bg: 'bg-[#10b981]/10', text: 'text-[#10b981]', border: 'border-[#10b981]/20' },
  medium: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/20' },
  hard: { bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]', border: 'border-[#ef4444]/20' },
};

export default function ChallengesPage() {
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [search, setSearch] = useState('');

  const filtered = mockCodingQuestions.filter((q) => {
    if (filter !== 'all' && q.difficulty !== filter) return false;
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Coding Challenges</h1>
        <p className="text-sm text-[#8b949e] mt-1">Practice and improve your coding skills.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search challenges..." className="input-neon w-full !pl-10" />
        </div>
        <div className="flex gap-2">
          {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
            <button key={d} onClick={() => setFilter(d)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              filter === d ? 'bg-[#0066ff]/10 text-[#00d4ff] border border-[#0066ff]/30' : 'bg-[#161b22]/50 text-[#8b949e] border border-[#21262d] hover:border-[#30363d]'
            }`}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Cards */}
      <div className="space-y-3">
        {filtered.map((q, i) => {
          const dc = difficultyColors[q.difficulty];
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-semibold text-white">{q.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${dc.bg} ${dc.text} ${dc.border} border`}>
                    {q.difficulty}
                  </span>
                </div>
                <p className="text-sm text-[#8b949e] line-clamp-1 mb-3">{q.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#484f58]">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {q.timeLimit}s limit</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {q.successRate}% success</span>
                  <div className="flex gap-1">
                    {q.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-[#161b22] border border-[#21262d] text-[#8b949e]">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <Link href={`/code/${q.id}`} className="btn-neon btn-neon-primary !py-2 !px-5 text-sm flex items-center gap-2 self-start">
                <Code2 className="w-4 h-4" /> Solve
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
