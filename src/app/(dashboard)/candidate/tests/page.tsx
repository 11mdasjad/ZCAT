'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, Clock, BookOpen, ArrowRight, Code2, Zap } from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import { getQuestions, type LocalQuestion } from '@/lib/data/questions-data';

export default function TestsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Create test groups from real questions
  const testGroups = useMemo(() => {
    const easy = getQuestions({ limit: 10, difficulty: 'EASY' }).questions;
    const medium = getQuestions({ limit: 10, difficulty: 'MEDIUM' }).questions;
    const hard = getQuestions({ limit: 5, difficulty: 'HARD' }).questions;

    return [
      {
        id: 'easy-set',
        title: 'Fundamentals Challenge',
        description: 'Test your basics with easy-level coding problems covering arrays, strings, and basic algorithms.',
        type: 'coding' as const,
        difficulty: 'easy' as const,
        duration: 30,
        totalQuestions: easy.length,
        questions: easy,
      },
      {
        id: 'medium-set',
        title: 'Intermediate Assessment',
        description: 'Challenge yourself with medium-level problems involving data structures, dynamic programming, and more.',
        type: 'coding' as const,
        difficulty: 'medium' as const,
        duration: 60,
        totalQuestions: medium.length,
        questions: medium,
      },
      {
        id: 'hard-set',
        title: 'Advanced Coding Challenge',
        description: 'Tackle hard-level problems that test your mastery of algorithms and optimization techniques.',
        type: 'coding' as const,
        difficulty: 'hard' as const,
        duration: 90,
        totalQuestions: hard.length,
        questions: hard,
      },
    ];
  }, []);

  if (isLoading) {
    return <ZCATLoader message="Loading available tests..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Available Tests</h1>
        <p className="text-sm text-[#8b949e] mt-1">Pick a challenge set and test your coding skills.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {testGroups.map((test, i) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-5 flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                test.difficulty === 'easy' ? 'bg-[#10b981]/10 border border-[#10b981]/20' :
                test.difficulty === 'medium' ? 'bg-[#f59e0b]/10 border border-[#f59e0b]/20' :
                'bg-[#ef4444]/10 border border-[#ef4444]/20'
              }`}>
                <Code2 className={`w-5 h-5 ${
                  test.difficulty === 'easy' ? 'text-[#10b981]' :
                  test.difficulty === 'medium' ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                }`} />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                test.difficulty === 'easy' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' :
                test.difficulty === 'medium' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' :
                'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'
              }`}>
                {test.difficulty}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{test.title}</h3>
            <p className="text-xs text-[#484f58] mb-4 flex-1 line-clamp-2">{test.description}</p>
            <div className="flex items-center gap-3 text-xs text-[#484f58] mb-4">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.duration} min</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {test.totalQuestions} Qs</span>
            </div>

            {/* Link to the first question in this set */}
            <Link
              href={`/code/${test.questions[0]?.id || ''}`}
              className="btn-neon btn-neon-secondary !py-2 text-xs w-full text-center flex items-center justify-center gap-1"
            >
              Start Test <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Individual Questions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Practice</h2>
        <p className="text-sm text-[#8b949e] mb-4">Jump directly into a specific problem.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {getQuestions({ limit: 8 }).questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <Link
                href={`/code/${q.id}`}
                className="glass-card rounded-xl p-4 block group hover:border-[#30363d]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3.5 h-3.5 text-[#00d4ff]" />
                  <h4 className="text-sm font-medium text-white truncate group-hover:text-[#00d4ff] transition-colors">{q.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    q.difficulty === 'EASY' ? 'bg-[#10b981]/10 text-[#10b981]' :
                    q.difficulty === 'MEDIUM' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                    'bg-[#ef4444]/10 text-[#ef4444]'
                  }`}>
                    {q.difficulty.toLowerCase()}
                  </span>
                  {q.tags[0] && <span className="text-xs text-[#484f58]">{q.tags[0]}</span>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
