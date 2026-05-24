'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  History, Trophy, Shield, AlertTriangle, CheckCircle2, XCircle,
  Clock, BarChart3, Calendar, ChevronRight, Inbox, RefreshCw,
  TrendingUp, Zap, Target, Award,
} from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import toast from 'react-hot-toast';

interface HistoryEntry {
  sessionId: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentType: 'CODING' | 'APTITUDE' | 'INTERVIEW' | 'MIXED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  duration: number;
  totalMarks: number;
  passingMarks: number;
  status: 'COMPLETED' | 'TERMINATED';
  finalScore: number;
  accuracy: number;
  integrityScore: number;
  violations: number;
  startedAt: string;
  endedAt: string | null;
  isPassed: boolean;
}

const difficultyColors: Record<string, string> = {
  EASY: '#10b981',
  MEDIUM: '#f59e0b',
  HARD: '#ef4444',
};

const typeLabels: Record<string, string> = {
  CODING: 'Coding',
  APTITUDE: 'MCQ',
  INTERVIEW: 'Interview',
  MIXED: 'Mixed',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(startedAt: string, endedAt: string | null) {
  if (!endedAt) return '—';
  const diff = Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}m ${s}s`;
}

export default function HistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/candidate/history');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to load test history');
      }
      setHistory(json.data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load test history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (isLoading) {
    return <ZCATLoader message="Loading test history..." fullScreen />;
  }

  // Aggregate stats
  const totalTests = history.length;
  const passedTests = history.filter((h) => h.isPassed).length;
  const avgScore = totalTests > 0
    ? Math.round(history.reduce((sum, h) => sum + h.finalScore, 0) / totalTests)
    : 0;
  const avgIntegrity = totalTests > 0
    ? Math.round(history.reduce((sum, h) => sum + h.integrityScore, 0) / totalTests)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-1">Test History</h1>
          <p className="text-sm text-[#8b949e]">
            Your permanently recorded assessment scorecard. Immutable and verified.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
          <button
            onClick={fetchHistory}
            className="glass-button px-4 py-2 rounded-lg text-sm flex items-center gap-2 text-[#8b949e] hover:text-white hover:bg-white/5 transition-colors border border-[#21262d]"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Link
            href="/candidate/tests"
            className="btn-neon btn-neon-primary px-4 py-2 text-sm flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> Take New Test
          </Link>
        </motion.div>
      </div>

      {/* Summary Stats */}
      {totalTests > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Tests Taken', value: totalTests.toString(), icon: Target, color: '#00d4ff' },
            { label: 'Tests Passed', value: passedTests.toString(), icon: CheckCircle2, color: '#10b981' },
            { label: 'Avg. Score', value: `${avgScore} pts`, icon: TrendingUp, color: '#a855f7' },
            { label: 'Avg. Integrity', value: `${avgIntegrity}%`, icon: Shield, color: '#f59e0b' },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-[#8b949e] mt-1">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center gap-3 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!error && totalTests === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-12 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center mx-auto mb-6">
            <History className="w-10 h-10 text-[#a855f7]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Test History Yet</h3>
          <p className="text-sm text-[#8b949e] max-w-md mx-auto mb-6">
            Your completed assessments will appear here permanently with detailed scores, performance
            metrics, and proctoring reports.
          </p>
          <Link
            href="/candidate/tests"
            className="btn-neon btn-neon-primary inline-flex items-center gap-2 text-sm py-2 px-5"
          >
            Browse Active Tests <ChevronRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center justify-center gap-2 text-xs text-[#484f58] mt-6">
            <Inbox className="w-4 h-4" />
            <span>No assessments completed yet</span>
          </div>
        </motion.div>
      )}

      {/* History Table */}
      {totalTests > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-strong rounded-xl border border-[#21262d] overflow-hidden"
        >
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3 border-b border-[#21262d] text-[10px] font-bold uppercase tracking-widest text-[#484f58]">
            <span>Assessment</span>
            <span>Type</span>
            <span>Score</span>
            <span>Accuracy</span>
            <span>Integrity</span>
            <span>Infractions</span>
            <span>Date</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-[#21262d]">
            <AnimatePresence>
              {history.map((entry, i) => {
                const isExpanded = expandedId === entry.sessionId;
                const diffColor = difficultyColors[entry.difficulty] || '#8b949e';
                const integrityColor =
                  entry.integrityScore >= 90 ? '#10b981' :
                  entry.integrityScore >= 70 ? '#f59e0b' : '#ef4444';
                const isDisqualified = entry.status === 'TERMINATED';

                return (
                  <motion.div
                    key={entry.sessionId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {/* Row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : entry.sessionId)}
                      className="w-full text-left px-6 py-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="grid md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_1fr_1fr_80px] gap-4 items-center">
                        {/* Assessment Name */}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{entry.assessmentTitle}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-[10px] font-bold uppercase"
                              style={{ color: diffColor }}
                            >
                              {entry.difficulty}
                            </span>
                            <span className="text-[10px] text-[#484f58]">{entry.duration} min</span>
                          </div>
                        </div>

                        {/* Type */}
                        <span className="hidden md:block text-xs text-[#8b949e] font-mono">
                          {typeLabels[entry.assessmentType] ?? entry.assessmentType}
                        </span>

                        {/* Score */}
                        <span
                          className={`hidden md:block text-sm font-bold ${entry.isPassed ? 'text-[#10b981]' : 'text-[#ef4444]'}`}
                        >
                          {entry.finalScore}
                          <span className="text-[10px] font-normal text-[#484f58] ml-1">/ {entry.totalMarks}</span>
                        </span>

                        {/* Accuracy */}
                        <span className="hidden md:block text-sm font-semibold text-white">
                          {entry.accuracy}%
                        </span>

                        {/* Integrity */}
                        <span
                          className="hidden md:flex items-center gap-1 text-sm font-semibold"
                          style={{ color: integrityColor }}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          {entry.integrityScore}%
                        </span>

                        {/* Infractions */}
                        <span
                          className={`hidden md:block text-sm font-semibold ${entry.violations > 0 ? 'text-[#f59e0b]' : 'text-[#484f58]'}`}
                        >
                          {entry.violations > 0 ? `⚠ ${entry.violations}` : '—'}
                        </span>

                        {/* Date */}
                        <span className="hidden md:block text-xs text-[#8b949e]">
                          {formatDate(entry.startedAt)}
                        </span>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {isDisqualified ? (
                            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] whitespace-nowrap">
                              Disqualified
                            </span>
                          ) : entry.isPassed ? (
                            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] whitespace-nowrap">
                              Passed
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] whitespace-nowrap">
                              Failed
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Detail Row */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[#21262d]/50 pt-4 bg-white/[0.01]">
                            <div className="space-y-1">
                              <p className="text-[10px] text-[#484f58] uppercase tracking-wider">Time Taken</p>
                              <p className="text-sm font-semibold text-white flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#8b949e]" />
                                {formatDuration(entry.startedAt, entry.endedAt)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-[#484f58] uppercase tracking-wider">Passing Marks</p>
                              <p className="text-sm font-semibold text-white">
                                {entry.passingMarks} pts required
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-[#484f58] uppercase tracking-wider">Session Result</p>
                              <p className={`text-sm font-bold flex items-center gap-1 ${entry.isPassed && !isDisqualified ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                                {isDisqualified ? (
                                  <><XCircle className="w-3.5 h-3.5" /> Disqualified by proctor</>
                                ) : entry.isPassed ? (
                                  <><CheckCircle2 className="w-3.5 h-3.5" /> Successfully Passed</>
                                ) : (
                                  <><XCircle className="w-3.5 h-3.5" /> Did not meet passing marks</>
                                )}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-[#484f58] uppercase tracking-wider">Submitted At</p>
                              <p className="text-sm font-semibold text-white flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#8b949e]" />
                                {entry.endedAt ? formatDate(entry.endedAt) : 'Not recorded'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
