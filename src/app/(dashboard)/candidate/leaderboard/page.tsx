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

  const fetchAssessments = async (isFirstLoad = false) => {
    try {
      if (isFirstLoad) setIsLoading(true);
      const res = await fetch('/api/v1/leaderboards');
      const data = await res.json();

      if (data.success) {
        const connected = data.data.filter((a: AssessmentLeaderboard) => a.leaderboardConnected);
        setAssessments(connected);

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

  useEffect(() => {
    fetchAssessments(true);
  }, []);

  useEffect(() => {
    if (!selectedAssessmentId) return;

    fetchRankings(selectedAssessmentId, false);

    const interval = setInterval(() => {
      fetchRankings(selectedAssessmentId, true);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedAssessmentId]);

  const filteredRankings = useMemo(() => {
    return rankings.filter((r) =>
      r.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rankings, searchQuery]);

  const podium = useMemo(() => {
    const topThree = rankings.slice(0, 3);
    const result: (LeaderboardEntry | null)[] = [null, null, null];

    topThree.forEach((entry) => {
      if (entry.rank === 1) result[1] = entry;
      else if (entry.rank === 2) result[0] = entry;
      else if (entry.rank === 3) result[2] = entry;
    });

    return result;
  }, [rankings]);

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
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6">
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a] flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[#d97706] animate-bounce" /> Live Leaderboard
          </h1>
          <p className="text-sm font-medium text-[#64748b] mt-1">
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
                className="bg-white border border-[#cbd5e1] rounded-lg px-4 py-2 text-sm text-[#0f172a] font-bold focus:border-[#2563eb] outline-none transition-colors appearance-none pr-10 shadow-xs cursor-pointer"
              >
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#64748b] flex items-center justify-center font-bold">
                ▾
              </div>
            </div>
          ) : (
            <span className="text-xs font-semibold text-[#64748b] border border-[#e2e8f0] rounded-lg px-3 py-1.5 bg-slate-50">
              No active exams connected
            </span>
          )}

          <button
            onClick={() => {
              fetchAssessments(false);
              if (selectedAssessmentId) fetchRankings(selectedAssessmentId, false);
            }}
            disabled={isRefreshing}
            className="p-2 rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#0f172a] transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            title="Force Sync Now"
          >
            <RefreshCw className={`w-4 h-4 text-[#2563eb] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {assessments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-16 text-center max-w-2xl mx-auto border border-[#e2e8f0] bg-white shadow-xs"
        >
          <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-[#d97706]" />
          </div>
          <h3 className="text-2xl font-bold text-[#0f172a] mb-3">No Active Assessment Leaderboards</h3>
          <p className="text-sm font-medium text-[#64748b] mb-6 leading-relaxed">
            There are currently no scheduled or active examinations utilizing real-time leaderboards. 
            Once recruiters activate a live challenge, candidate rankings will dynamically render here!
          </p>
          <div className="flex justify-center gap-2 text-xs font-semibold text-[#94a3b8]">
            <Star className="w-4 h-4 text-[#d97706]" />
            <span>Practice solving coding challenges in the dashboard to warm up!</span>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-xl border border-[#e2e8f0] bg-white shadow-xs">
              <div className="text-xs text-[#64748b] uppercase font-bold tracking-wider">Contest Status</div>
              <div className="text-xl font-extrabold text-[#059669] mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
                Live Session
              </div>
            </div>
            <div className="glass-card p-5 rounded-xl border border-[#e2e8f0] bg-white shadow-xs">
              <div className="text-xs text-[#64748b] uppercase font-bold tracking-wider">Active Competitors</div>
              <div className="text-xl font-extrabold text-[#0f172a] mt-1 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#2563eb]" />
                {rankings.length} Logged In
              </div>
            </div>
            <div className="glass-card p-5 rounded-xl border border-[#e2e8f0] bg-white shadow-xs">
              <div className="text-xs text-[#64748b] uppercase font-bold tracking-wider">Contest Type</div>
              <div className="text-xl font-extrabold mt-1 uppercase tracking-wide text-[#7c3aed]">
                {getActiveAssessment?.type || 'Coding'}
              </div>
            </div>
            <div className="glass-card p-5 rounded-xl border border-[#e2e8f0] bg-white shadow-xs">
              <div className="text-xs text-[#64748b] uppercase font-bold tracking-wider">Scoring Rule</div>
              <div className="text-xl font-extrabold text-[#0f172a] mt-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#d97706]" />
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
                    className="w-full md:w-64 glass-card p-6 rounded-2xl border border-[#e2e8f0] bg-white text-center flex flex-col items-center justify-center relative overflow-hidden order-2 md:order-1 h-72 shadow-sm"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-400 to-slate-200" />
                    <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-xl font-bold text-[#0f172a] mb-3 shadow-xs relative">
                      {podium[0].user.avatarUrl ? (
                        <img src={podium[0].user.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        podium[0].user.name.charAt(0)
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 border border-slate-400 text-xs font-black text-slate-800 flex items-center justify-center">2</div>
                    </div>
                    <h4 className="text-base font-bold text-[#0f172a] max-w-full truncate">{podium[0].user.name}</h4>
                    <p className="text-xs font-semibold text-[#64748b] mt-1">{podium[0].problemsSolved} Solved</p>
                    <div className="mt-4 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-300 text-[#0f172a] text-lg font-black tracking-wide">
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
                    className="w-full md:w-72 glass-card p-8 rounded-2xl border border-amber-300 bg-white text-center flex flex-col items-center justify-center relative overflow-hidden order-1 md:order-2 h-80 shadow-md scale-105"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-300" />
                    <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center text-2xl font-bold text-[#0f172a] mb-4 shadow-sm relative">
                      {podium[1].user.avatarUrl ? (
                        <img src={podium[1].user.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        podium[1].user.name.charAt(0)
                      )}
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 border border-amber-500 text-sm font-black text-slate-900 flex items-center justify-center">1</div>
                    </div>
                    <h4 className="text-lg font-black text-[#0f172a] max-w-full truncate flex items-center gap-1.5">
                      {podium[1].user.name} <Award className="w-5 h-5 text-amber-500 animate-pulse" />
                    </h4>
                    <p className="text-xs font-semibold text-[#64748b] mt-1">{podium[1].problemsSolved} Solved</p>
                    <div className="mt-4 px-5 py-2 bg-amber-50 rounded-full border border-amber-300 text-[#d97706] text-xl font-black tracking-wide">
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
                    className="w-full md:w-64 glass-card p-6 rounded-2xl border border-[#e2e8f0] bg-white text-center flex flex-col items-center justify-center relative overflow-hidden order-3 md:order-3 h-64 shadow-xs"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-700 to-amber-500" />
                    <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-600 flex items-center justify-center text-lg font-bold text-[#0f172a] mb-3 shadow-xs relative">
                      {podium[2].user.avatarUrl ? (
                        <img src={podium[2].user.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        podium[2].user.name.charAt(0)
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-600 border border-amber-700 text-[10px] font-black text-white flex items-center justify-center">3</div>
                    </div>
                    <h4 className="text-sm font-bold text-[#0f172a] max-w-full truncate">{podium[2].user.name}</h4>
                    <p className="text-xs font-semibold text-[#64748b] mt-1">{podium[2].problemsSolved} Solved</p>
                    <div className="mt-4 px-4 py-1.5 bg-amber-50 rounded-full border border-amber-200 text-[#d97706] text-base font-black tracking-wide">
                      {podium[2].score} pts
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Search & List Table */}
          <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
              <h3 className="text-lg font-bold text-[#0f172a]">Full Leaderboard Rankings</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder="Search competitor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 bg-white border border-[#cbd5e1] rounded-lg pl-9 pr-4 py-1.5 text-sm text-[#0f172a] font-medium placeholder:text-[#94a3b8] focus:border-[#2563eb] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-xs uppercase text-[#64748b] font-extrabold bg-slate-50">
                    <th className="px-6 py-4 font-bold w-20">Rank</th>
                    <th className="px-6 py-4 font-bold">Competitor</th>
                    <th className="px-6 py-4 font-bold">Score</th>
                    <th className="px-6 py-4 font-bold">Problems Solved</th>
                    <th className="px-6 py-4 font-bold">Time Spent</th>
                    <th className="px-6 py-4 font-bold text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  <AnimatePresence initial={false}>
                    {filteredRankings.map((row) => (
                      <motion.tr
                        key={row.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 py-4 font-bold text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs ${
                            row.rank === 1 ? 'bg-amber-400 text-slate-900' :
                            row.rank === 2 ? 'bg-slate-300 text-slate-800' :
                            row.rank === 3 ? 'bg-amber-600 text-white' :
                            'text-[#64748b]'
                          }`}>
                            {row.rank}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-[#0f172a] flex items-center justify-center font-bold text-xs uppercase border border-[#e2e8f0] overflow-hidden">
                              {row.user.avatarUrl ? (
                                <img src={row.user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                row.user.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-[#0f172a] text-sm">{row.user.name}</div>
                              <div className="text-xs text-[#64748b] font-medium">{row.user.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-[#0f172a] font-extrabold">
                          {row.score} pts
                        </td>

                        <td className="px-6 py-4 text-sm text-[#64748b] font-medium">
                          {row.problemsSolved} questions
                        </td>

                        <td className="px-6 py-4 text-sm text-[#64748b] font-medium flex items-center gap-1.5 mt-2.5">
                          <Clock className="w-3.5 h-3.5 text-[#2563eb]" />
                          {formatDuration(row.timeTaken)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-24 h-1.5 rounded-full bg-slate-100 border border-[#e2e8f0] overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] transition-all duration-1000"
                                style={{ width: `${Math.min(100, (row.problemsSolved / 5) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-[#64748b] font-bold w-8">{row.problemsSolved}/5</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>

                  {filteredRankings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#64748b] font-medium">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <AlertTriangle className="w-8 h-8 text-[#d97706]" />
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
