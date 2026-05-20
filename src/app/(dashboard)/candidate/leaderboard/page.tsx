'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Search, Clock, Award, Sparkles, TrendingUp,
  UserCheck, RefreshCw, AlertTriangle, ArrowRight, HelpCircle, Star
} from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import toast from 'react-hot-toast';

interface LeaderboardEntry {
  id: string;
  rank: number;
  score: number;
  timeTaken: number;
  problemsSolved: number;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

interface AssessmentLeaderboard {
  id: string;
  title: string;
  type: string;
  status: string;
  duration: number;
  leaderboardConnected: boolean;
  participantsCount: number;
}

export default function CandidateLeaderboardPage() {
  const [assessments, setAssessments] = useState<AssessmentLeaderboard[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch connected assessments
  const fetchAssessments = async (isFirstLoad = false) => {
    try {
      if (isFirstLoad) setIsLoading(true);
      const res = await fetch('/api/v1/leaderboards');
      const data = await res.json();

      if (data.success) {
        // Filter only assessments that have leaderboards connected
        const connected = data.data.filter((a: AssessmentLeaderboard) => a.leaderboardConnected);
        setAssessments(connected);

        // Auto-select the first connected assessment if none selected
        if (connected.length > 0 && !selectedAssessmentId) {
          setSelectedAssessmentId(connected[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load assessments:', err);
      toast.error('Failed to sync active contests');
    } finally {
      if (isFirstLoad) setIsLoading(false);
    }
  };

  // 2. Fetch specific rankings
  const fetchRankings = async (assessmentId: string, silent = false) => {
    if (!assessmentId) return;
    try {
      if (!silent) setIsRefreshing(true);
      const res = await fetch(`/api/v1/leaderboards/${assessmentId}`);
      const data = await res.json();

      if (data.success && data.data) {
        setRankings(data.data.entries || []);
      }
    } catch (err) {
      console.error('Failed to fetch rankings:', err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAssessments(true);
  }, []);

  // Poll rankings every 5 seconds for live racing reordering
  useEffect(() => {
    if (!selectedAssessmentId) return;

    fetchRankings(selectedAssessmentId, false);

    const interval = setInterval(() => {
      fetchRankings(selectedAssessmentId, true);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedAssessmentId]);

  // Filter rankings based on search
  const filteredRankings = useMemo(() => {
    return rankings.filter((r) =>
      r.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rankings, searchQuery]);

  // Podium (Top 3)
  const podium = useMemo(() => {
    const topThree = rankings.slice(0, 3);
    const result: (LeaderboardEntry | null)[] = [null, null, null]; // [2nd, 1st, 3rd]

    topThree.forEach((entry) => {
      if (entry.rank === 1) result[1] = entry;
      else if (entry.rank === 2) result[0] = entry;
      else if (entry.rank === 3) result[2] = entry;
    });

    return result;
  }, [rankings]);

  // Helper formatting functions
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return mins > 0 ? `${mins}m ${remainingSecs}s` : `${remainingSecs}s`;
  };

  const getActiveAssessment = useMemo(() => {
    return assessments.find((a) => a.id === selectedAssessmentId);
  }, [assessments, selectedAssessmentId]);

  if (isLoading) {
    return <ZCATLoader message="Analyzing real-time rankings..." fullScreen />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[#f59e0b] animate-bounce" /> Live Leaderboard
          </h1>
          <p className="text-sm text-[#8b949e] mt-1">
            Compete in real time. Solve challenges successfully to climb your way to the top!
          </p>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {assessments.length > 0 ? (
            <div className="relative">
              <select
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2 text-sm text-[#c9d1d9] font-medium focus:border-[#00d4ff]/50 outline-none transition-colors appearance-none pr-10 hover:border-[#8b949e]"
              >
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#8b949e] flex items-center justify-center font-bold">
                ▾
              </div>
            </div>
          ) : (
            <span className="text-xs text-[#8b949e] border border-[#21262d] rounded-lg px-3 py-1.5 bg-[#0d1117]">
              No active exams connected
            </span>
          )}

          <button
            onClick={() => {
              fetchAssessments(false);
              if (selectedAssessmentId) fetchRankings(selectedAssessmentId, false);
            }}
            disabled={isRefreshing}
            className="p-2 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors disabled:opacity-50"
            title="Force Sync Now"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {assessments.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-16 text-center max-w-2xl mx-auto"
        >
          <div className="w-20 h-20 rounded-full bg-[#f59e0b]/5 border border-[#f59e0b]/20 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-[#f59e0b]/40" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Active Assessment Leaderboards</h3>
          <p className="text-sm text-[#8b949e] mb-6">
            There are currently no scheduled or active examinations utilizing real-time leaderboards. 
            Once recruiters activate a live challenge, candidate rankings will dynamically render here!
          </p>
          <div className="flex justify-center gap-2 text-xs text-[#484f58]">
            <Star className="w-4 h-4 text-[#8b949e]" />
            <span>Practice solving coding challenges in the dashboard to warm up!</span>
          </div>
        </motion.div>
      ) : (
        /* Rankings Layout */
        <div className="space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-xl border border-[#21262d]">
              <div className="text-xs text-[#8b949e] uppercase font-bold tracking-wider">Contest Status</div>
              <div className="text-xl font-bold text-[#10b981] mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                Live Session
              </div>
            </div>
            <div className="glass-card p-5 rounded-xl border border-[#21262d]">
              <div className="text-xs text-[#8b949e] uppercase font-bold tracking-wider">Active Competitors</div>
              <div className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#0066ff]" />
                {rankings.length} Logged In
              </div>
            </div>
            <div className="glass-card p-5 rounded-xl border border-[#21262d]">
              <div className="text-xs text-[#8b949e] uppercase font-bold tracking-wider">Contest Type</div>
              <div className="text-xl font-bold text-white mt-1 uppercase tracking-wide text-[#7c3aed]">
                {getActiveAssessment?.type || 'Coding'}
              </div>
            </div>
            <div className="glass-card p-5 rounded-xl border border-[#21262d]">
              <div className="text-xs text-[#8b949e] uppercase font-bold tracking-wider">Scoring Rule</div>
              <div className="text-xl font-bold text-white mt-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                +4 pts / question
              </div>
            </div>
          </div>

          {/* live podium section */}
          {rankings.length > 0 && (
            <div className="flex flex-col md:flex-row items-end justify-center gap-6 max-w-4xl mx-auto pt-8 pb-4">
              {/* 2nd Place */}
              <AnimatePresence mode="wait">
                {podium[0] && (
                  <motion.div
                    key={`podium-2-${podium[0].id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full md:w-64 glass-strong p-6 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center relative overflow-hidden order-2 md:order-1 h-72 shadow-[0_4px_30px_rgba(255,255,255,0.02)]"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-400 to-slate-200" />
                    <div className="w-16 h-16 rounded-full bg-[#161b22] border-2 border-slate-300 flex items-center justify-center text-xl font-bold text-white mb-3 shadow-[0_0_20px_rgba(200,200,200,0.15)] relative">
                      {podium[0].user.avatarUrl ? (
                        <img src={podium[0].user.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        podium[0].user.name.charAt(0)
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 border border-slate-400 text-xs font-black text-slate-800 flex items-center justify-center">2</div>
                    </div>
                    <h4 className="text-base font-bold text-white max-w-full truncate">{podium[0].user.name}</h4>
                    <p className="text-xs text-[#8b949e] mt-1">{podium[0].problemsSolved} Solved</p>
                    <div className="mt-4 px-4 py-1.5 bg-slate-400/10 rounded-full border border-slate-400/20 text-[#c9d1d9] text-lg font-black tracking-wide">
                      {podium[0].score} pts
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 1st Place */}
              <AnimatePresence mode="wait">
                {podium[1] && (
                  <motion.div
                    key={`podium-1-${podium[1].id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full md:w-72 glass-strong p-8 rounded-2xl border border-yellow-500/20 text-center flex flex-col items-center justify-center relative overflow-hidden order-1 md:order-2 h-80 shadow-[0_4px_40px_rgba(245,158,11,0.06)] scale-105"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500 to-amber-300" />
                    <div className="w-20 h-20 rounded-full bg-[#161b22] border-2 border-yellow-400 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-[0_0_30px_rgba(245,158,11,0.25)] relative">
                      {podium[1].user.avatarUrl ? (
                        <img src={podium[1].user.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        podium[1].user.name.charAt(0)
                      )}
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yellow-400 border border-yellow-500 text-sm font-black text-slate-900 flex items-center justify-center">1</div>
                    </div>
                    <h4 className="text-lg font-black text-white max-w-full truncate flex items-center gap-1.5">
                      {podium[1].user.name} <Award className="w-5 h-5 text-yellow-400 animate-pulse" />
                    </h4>
                    <p className="text-xs text-[#8b949e] mt-1">{podium[1].problemsSolved} Solved</p>
                    <div className="mt-4 px-5 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/30 text-yellow-400 text-xl font-black tracking-wide">
                      {podium[1].score} pts
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3rd Place */}
              <AnimatePresence mode="wait">
                {podium[2] && (
                  <motion.div
                    key={`podium-3-${podium[2].id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full md:w-64 glass-strong p-6 rounded-2xl border border-amber-600/10 text-center flex flex-col items-center justify-center relative overflow-hidden order-3 md:order-3 h-64 shadow-[0_4px_30px_rgba(217,119,6,0.01)]"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-700 to-amber-500" />
                    <div className="w-14 h-14 rounded-full bg-[#161b22] border-2 border-amber-600 flex items-center justify-center text-lg font-bold text-white mb-3 shadow-[0_0_20px_rgba(217,119,6,0.15)] relative">
                      {podium[2].user.avatarUrl ? (
                        <img src={podium[2].user.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        podium[2].user.name.charAt(0)
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-600 border border-amber-700 text-[10px] font-black text-white flex items-center justify-center">3</div>
                    </div>
                    <h4 className="text-sm font-bold text-white max-w-full truncate">{podium[2].user.name}</h4>
                    <p className="text-xs text-[#8b949e] mt-1">{podium[2].problemsSolved} Solved</p>
                    <div className="mt-4 px-4 py-1.5 bg-amber-600/10 rounded-full border border-amber-600/20 text-[#d97706] text-base font-black tracking-wide">
                      {podium[2].score} pts
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Search & List Table */}
          <div className="glass-strong rounded-xl border border-[#21262d] overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-[#21262d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161b22]/40">
              <h3 className="text-lg font-semibold text-white">Full Leaderboard Rankings</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]" />
                <input
                  type="text"
                  placeholder="Search competitor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-4 py-1.5 text-sm text-[#e4e8f1] placeholder:text-[#8b949e] focus:border-[#00d4ff]/50 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Rankings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#21262d] text-xs uppercase text-[#8b949e] bg-[#0d1117]/80">
                    <th className="px-6 py-4 font-semibold w-20">Rank</th>
                    <th className="px-6 py-4 font-semibold">Competitor</th>
                    <th className="px-6 py-4 font-semibold">Score</th>
                    <th className="px-6 py-4 font-semibold">Problems Solved</th>
                    <th className="px-6 py-4 font-semibold">Time Spent</th>
                    <th className="px-6 py-4 font-semibold text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d]">
                  <AnimatePresence initial={false}>
                    {filteredRankings.map((row) => (
                      <motion.tr
                        key={row.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="hover:bg-white/[0.01] transition-colors group"
                      >
                        {/* Rank Badge */}
                        <td className="px-6 py-4 font-bold text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs ${
                            row.rank === 1 ? 'bg-yellow-400 text-slate-900' :
                            row.rank === 2 ? 'bg-slate-300 text-slate-800' :
                            row.rank === 3 ? 'bg-amber-600 text-white' :
                            'text-[#8b949e]'
                          }`}>
                            {row.rank}
                          </span>
                        </td>

                        {/* Competitor Profile */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#21262d] text-white flex items-center justify-center font-bold text-xs uppercase border border-[#30363d] overflow-hidden">
                              {row.user.avatarUrl ? (
                                <img src={row.user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                row.user.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-white text-sm">{row.user.name}</div>
                              <div className="text-xs text-[#8b949e]">{row.user.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-6 py-4 text-sm text-[#c9d1d9] font-black">
                          {row.score} pts
                        </td>

                        {/* Problems Solved */}
                        <td className="px-6 py-4 text-sm text-[#8b949e]">
                          {row.problemsSolved} questions
                        </td>

                        {/* Time Spent */}
                        <td className="px-6 py-4 text-sm text-[#8b949e] flex items-center gap-1.5 mt-2.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(row.timeTaken)}
                        </td>

                        {/* Progress Bar / Ratio */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-24 h-1.5 rounded-full bg-[#161b22] border border-[#21262d] overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#0066ff] to-[#7c3aed] transition-all duration-1000"
                                style={{ width: `${Math.min(100, (row.problemsSolved / 5) * 100)}%` }} // Assumes max 5 questions as baseline
                              />
                            </div>
                            <span className="text-xs text-[#8b949e] font-semibold w-8">{row.problemsSolved}/5</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>

                  {filteredRankings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#8b949e]">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <AlertTriangle className="w-8 h-8 text-[#f59e0b]/50" />
                          <p className="text-sm">No active participants found matching search queries.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
