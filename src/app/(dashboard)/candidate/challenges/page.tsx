'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Code2, Clock, CheckCircle, Filter, Search, Loader2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  description: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const difficultyColors = {
  EASY: { bg: 'bg-[#10b981]/10', text: 'text-[#10b981]', border: 'border-[#10b981]/20' },
  MEDIUM: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/20' },
  HARD: { bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]', border: 'border-[#ef4444]/20' },
};

export default function ChallengesPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'EASY' | 'MEDIUM' | 'HARD'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [stats, setStats] = useState({ EASY: 0, MEDIUM: 0, HARD: 0 });

  // Fetch questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          ...(filter !== 'all' && { difficulty: filter }),
          ...(search && { search }),
        });

        const response = await fetch(`/api/v1/questions?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        setQuestions(data.data.questions);
        setPagination(data.data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuestions();
  }, [pagination.page, filter, search]);

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/v1/questions/stats');
        if (response.ok) {
          const data = await response.json();
          const statsMap = data.data.stats.reduce((acc: any, stat: any) => {
            acc[stat.difficulty] = stat.count;
            return acc;
          }, { EASY: 0, MEDIUM: 0, HARD: 0 });
          setStats(statsMap);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    }

    fetchStats();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Coding Challenges</h1>
        <p className="text-sm text-[#8b949e] mt-1">
          Practice and improve your coding skills with {stats.EASY + stats.MEDIUM + stats.HARD} LeetCode questions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{stats.EASY + stats.MEDIUM + stats.HARD}</div>
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#8b949e]">Loading questions...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="glass-card rounded-xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-[#ef4444] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Failed to Load Questions</h3>
          <p className="text-sm text-[#8b949e] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-neon btn-neon-primary !py-2 !px-5 text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Challenge Cards */}
      {!isLoading && !error && (
        <>
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
        </>
      )}
    </div>
  );
}
