'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { mockExams } from '@/lib/data/mock-exams';

export default function TestsPage() {
  const tests = mockExams.filter((e) => e.type === 'aptitude' || e.type === 'mixed');
  const allTests = [...mockExams];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Aptitude Tests</h1>
        <p className="text-sm text-[#8b949e] mt-1">Assess your logical reasoning, quantitative ability, and verbal skills.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allTests.map((test, i) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-5 flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                test.type === 'coding' ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/20' :
                test.type === 'aptitude' ? 'bg-[#a855f7]/10 border border-[#a855f7]/20' :
                'bg-[#f59e0b]/10 border border-[#f59e0b]/20'
              }`}>
                <FileText className={`w-5 h-5 ${
                  test.type === 'coding' ? 'text-[#00d4ff]' :
                  test.type === 'aptitude' ? 'text-[#a855f7]' : 'text-[#f59e0b]'
                }`} />
              </div>
              {test.isLive && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] text-xs border border-[#10b981]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-[pulse-glow_2s_ease-in-out_infinite]" />
                  Live
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{test.title}</h3>
            <p className="text-xs text-[#484f58] mb-4 flex-1 line-clamp-2">{test.description}</p>
            <div className="flex items-center gap-3 text-xs text-[#484f58] mb-4">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.duration} min</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {test.totalQuestions} Qs</span>
            </div>
            <Link href={`/code/${test.id}`} className="btn-neon btn-neon-secondary !py-2 text-xs w-full text-center flex items-center justify-center gap-1">
              Start Test <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
