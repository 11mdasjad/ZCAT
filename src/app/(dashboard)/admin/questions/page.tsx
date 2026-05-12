'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, Code2, FileText, Tag, Edit, Trash2, Copy } from 'lucide-react';
import { mockCodingQuestions } from '@/lib/data/mock-exams';

const questionBank = [
  ...mockCodingQuestions,
  { id: 'q4', title: 'Valid Parentheses', difficulty: 'easy' as const, tags: ['stack', 'string'], successRate: 78.3, type: 'coding' },
  { id: 'q5', title: 'LRU Cache', difficulty: 'medium' as const, tags: ['design', 'hash-table'], successRate: 42.1, type: 'coding' },
  { id: 'q6', title: 'Median of Two Sorted Arrays', difficulty: 'hard' as const, tags: ['binary-search', 'array'], successRate: 21.5, type: 'coding' },
  { id: 'q7', title: 'Logical Reasoning - Set 1', difficulty: 'medium' as const, tags: ['aptitude', 'reasoning'], successRate: 65.0, type: 'aptitude' },
  { id: 'q8', title: 'Quantitative Analysis', difficulty: 'easy' as const, tags: ['aptitude', 'math'], successRate: 82.4, type: 'aptitude' },
];

export default function QuestionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'coding' | 'aptitude'>('all');

  const filtered = questionBank.filter((q) => {
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && ('type' in q ? q.type : 'coding') !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Question Bank</h1>
          <p className="text-sm text-[#8b949e] mt-1">Manage your library of assessment questions.</p>
        </div>
        <button className="btn-neon btn-neon-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions..." className="input-neon w-full !pl-10" />
        </div>
        <div className="flex gap-2">
          {(['all', 'coding', 'aptitude'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              typeFilter === t ? 'bg-[#0066ff]/10 text-[#00d4ff] border border-[#0066ff]/30' : 'bg-[#161b22]/50 text-[#8b949e] border border-[#21262d]'
            }`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((q, i) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass-card rounded-xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              ('type' in q && q.type === 'aptitude') ? 'bg-[#a855f7]/10 border border-[#a855f7]/20' : 'bg-[#00d4ff]/10 border border-[#00d4ff]/20'
            }`}>
              {('type' in q && q.type === 'aptitude') ? <FileText className="w-5 h-5 text-[#a855f7]" /> : <Code2 className="w-5 h-5 text-[#00d4ff]" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white">{q.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  q.difficulty === 'easy' ? 'bg-[#10b981]/10 text-[#10b981]' :
                  q.difficulty === 'medium' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-[#ef4444]/10 text-[#ef4444]'
                }`}>{q.difficulty}</span>
                {q.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded bg-[#161b22] text-[#484f58]">{tag}</span>
                ))}
              </div>
            </div>
            <span className="text-xs text-[#484f58] hidden sm:block">{q.successRate}% success</span>
            <div className="flex gap-1">
              <button className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all"><Edit className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#a855f7] hover:bg-[#a855f7]/10 transition-all"><Copy className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
