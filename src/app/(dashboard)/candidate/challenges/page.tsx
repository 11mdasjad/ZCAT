'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Code2, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import { getQuestions, getQuestionStats, type LocalQuestion } from '@/lib/data/questions-data';

const difficultyColors = {
  EASY: { bg: 'bg-[#10b981]/10', text: 'text-[#10b981]', border: 'border-[#10b981]/20' },
  MEDIUM: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/20' },
  HARD: { bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]', border: 'border-[#ef4444]/20' },
};

export default function ChallengesPage() {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'EASY' | 'MEDIUM' | 'HARD'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const stats = useMemo(() => getQuestionStats(), []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Simulate loading for initial render
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const { questions, pagination } = useMemo(() => {
    return getQuestions({
      page,
      limit: 20,
      difficulty: filter !== 'all' ? filter : undefined,
      search: search || undefined,
    });
  }, [page, filter, search]);

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <ZCATLoader message="Loading coding challenges..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Coding Challenges</h1>
        <p className="text-sm text-[#8b949e] mt-1">
          Practice and improve your coding skills with {stats.total} LeetCode questions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-[#8b949e] mt-1">Total Questions</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="text-2xl font-bold text-[#10b981]">{stats.EASY}</div>
          <div className="text-xs text-[#8b949e] mt-1">Easy</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="text-2xl font-bold text-[#f59e0b]">{stats.MEDIUM}</div>
          <div className="text-xs text-[#8b949e] mt-1">Medium</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="text-2xl font-bold text-[#ef4444]">{stats.HARD}</div>
          <div className="text-xs text-[#8b949e] mt-1">Hard</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search challenges..."
            className="input-neon w-full !pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
            <button
              key={d}
              onClick={() => handleFilterChange(d)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                filter === d
                  ? 'bg-[#0066ff]/10 text-[#00d4ff] border border-[#0066ff]/30'
                  : 'bg-[#161b22]/50 text-[#8b949e] border border-[#21262d] hover:border-[#30363d]'
              }`}
            >
              {d === 'all' ? 'All' : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Cards */}
      {questions.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <Code2 className="w-12 h-12 text-[#484f58] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">No Questions Found</h3>
          <p className="text-sm text-[#8b949e]">
            Try adjusting your filters or search query.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => {
            const dc = difficultyColors[q.difficulty];
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[#30363d] transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold text-white">{q.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${dc.bg} ${dc.text} ${dc.border} border`}
                    >
                      {q.difficulty.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-sm text-[#8b949e] line-clamp-2 mb-3">{q.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#484f58]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {q.timeLimit}ms limit
                    </span>
                    <div className="flex gap-1">
                      {q.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-[#161b22] border border-[#21262d] text-[#8b949e]"
                        >
                          {tag}
                        </span>
                      ))}
                      {q.tags.length > 3 && (
                        <span className="px-2 py-0.5 rounded bg-[#161b22] border border-[#21262d] text-[#8b949e]">
                          +{q.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/code/${q.id}`}
                  className="btn-neon btn-neon-primary !py-2 !px-5 text-sm flex items-center gap-2 self-start sm:self-center"
                >
                  <Code2 className="w-4 h-4" /> Solve
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-[#8b949e]">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
            questions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg bg-[#161b22] border border-[#21262d] text-[#8b949e] hover:text-white hover:border-[#30363d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-[#0066ff] text-white'
                        : 'bg-[#161b22] border border-[#21262d] text-[#8b949e] hover:text-white hover:border-[#30363d]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg bg-[#161b22] border border-[#21262d] text-[#8b949e] hover:text-white hover:border-[#30363d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
