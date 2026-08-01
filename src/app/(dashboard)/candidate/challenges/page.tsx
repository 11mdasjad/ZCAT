'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Code2, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';

interface Question {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  timeLimit: number;
  tags: string[];
}

const difficultyColors = {
  EASY: { bg: 'bg-emerald-50', text: 'text-[#059669]', border: 'border-emerald-200' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-[#d97706]', border: 'border-amber-200' },
  HARD: { bg: 'bg-red-50', text: 'text-[#dc2626]', border: 'border-red-200' },
};

export default function ChallengesPage() {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'EASY' | 'MEDIUM' | 'HARD'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [stats, setStats] = useState({ EASY: 0, MEDIUM: 0, HARD: 0, total: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetch('/api/v1/questions/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.stats) {
          const s = { EASY: 0, MEDIUM: 0, HARD: 0, total: 0 };
          data.data.stats.forEach((item: any) => {
            if (item.difficulty === 'EASY') s.EASY = item.count;
            if (item.difficulty === 'MEDIUM') s.MEDIUM = item.count;
            if (item.difficulty === 'HARD') s.HARD = item.count;
          });
          s.total = s.EASY + s.MEDIUM + s.HARD;
          setStats(s);
        }
      })
      .catch((err) => console.error('Failed to fetch statistics:', err));
  }, []);

  useEffect(() => {
    async function loadQuestions() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', page.toString());
        queryParams.set('limit', '20');
        if (filter !== 'all') {
          queryParams.set('difficulty', filter);
        }
        if (search) {
          queryParams.set('search', search);
        }
        const res = await fetch(`/api/v1/questions?${queryParams.toString()}`);
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.data) {
            setQuestions(resData.data.questions || []);
            setPagination(resData.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
          }
        }
      } catch (err) {
        console.error('Failed to fetch questions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadQuestions();
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
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Coding Challenges</h1>
        <p className="text-sm text-[#64748b] font-medium mt-1">
          Practice and improve your coding skills with {stats.total} LeetCode questions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 border border-[#e2e8f0] bg-white shadow-xs">
          <div className="text-2xl font-extrabold text-[#0f172a]">{stats.total}</div>
          <div className="text-xs font-semibold text-[#64748b] mt-1">Total Questions</div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-[#e2e8f0] bg-white shadow-xs">
          <div className="text-2xl font-extrabold text-[#059669]">{stats.EASY}</div>
          <div className="text-xs font-semibold text-[#64748b] mt-1">Easy</div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-[#e2e8f0] bg-white shadow-xs">
          <div className="text-2xl font-extrabold text-[#d97706]">{stats.MEDIUM}</div>
          <div className="text-xs font-semibold text-[#64748b] mt-1">Medium</div>
        </div>
        <div className="glass-card rounded-xl p-4 border border-[#e2e8f0] bg-white shadow-xs">
          <div className="text-2xl font-extrabold text-[#dc2626]">{stats.HARD}</div>
          <div className="text-xs font-semibold text-[#64748b] mt-1">Hard</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search challenges..."
            className="input-neon w-full !pl-10 text-sm font-medium"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
            <button
              key={d}
              onClick={() => handleFilterChange(d)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === d
                  ? 'bg-blue-50 text-[#2563eb] border border-blue-200 shadow-xs'
                  : 'bg-white text-[#64748b] border border-[#e2e8f0] hover:text-[#0f172a] hover:border-[#cbd5e1]'
              }`}
            >
              {d === 'all' ? 'All' : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Cards */}
      {questions.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center border border-[#e2e8f0] bg-white shadow-xs">
          <Code2 className="w-12 h-12 text-[#94a3b8] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#0f172a] mb-2">No Questions Found</h3>
          <p className="text-sm text-[#64748b] font-medium">
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
                className="glass-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 border border-[#e2e8f0] bg-white shadow-xs hover:shadow-md transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-bold text-[#0f172a]">{q.title}</h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${dc.bg} ${dc.text} ${dc.border} border`}
                    >
                      {q.difficulty.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-sm text-[#64748b] font-medium line-clamp-2 mb-3">{q.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#64748b]">
                    <span className="flex items-center gap-1 text-[#2563eb]">
                      <Clock className="w-3 h-3 text-[#2563eb]" /> {q.timeLimit}ms limit
                    </span>
                    <div className="flex gap-1">
                      {q.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-slate-100 border border-[#e2e8f0] text-[#0f172a] font-semibold text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                      {q.tags.length > 3 && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-[#e2e8f0] text-[#64748b] font-semibold text-[10px]">
                          +{q.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/code/${q.id}`}
                  className="btn-neon btn-neon-primary !py-2 !px-5 text-sm font-bold flex items-center gap-2 self-start sm:self-center shadow-md"
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
          <div className="text-sm text-[#64748b] font-medium">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
            questions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg bg-white border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
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
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                      pagination.page === pageNum
                        ? 'bg-[#2563eb] text-white shadow-xs'
                        : 'bg-white border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1]'
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
              className="p-2 rounded-lg bg-white border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
