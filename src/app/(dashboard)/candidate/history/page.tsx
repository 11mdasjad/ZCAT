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
  EASY: '#059669',
  MEDIUM: '#d97706',
  HARD: '#dc2626',
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
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Test History</h1>
          <p className="text-sm text-slate-600 font-medium">
            Your permanently recorded assessment scorecard. Immutable and verified.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
          <button
            onClick={fetchHistory}
            className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 text-slate-900 bg-white hover:bg-slate-50 transition-colors border border-slate-300 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-blue-600" /> Refresh
          </button>
          <Link
            href="/candidate/tests"
            className="btn-neon btn-neon-primary px-4 py-2 text-sm flex items-center gap-2 font-bold shadow-md"
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
            { label: 'Tests Taken', value: totalTests.toString(), icon: Target, color: '#0284c7' },
            { label: 'Tests Passed', value: passedTests.toString(), icon: CheckCircle2, color: '#059669' },
            { label: 'Avg. Score', value: `${avgScore} pts`, icon: TrendingUp, color: '#7c3aed' },
            { label: 'Avg. Integrity', value: `${avgIntegrity}%`, icon: Shield, color: '#d97706' },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-xl p-5 border border-slate-200 bg-white shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{value}</div>
              <div className="text-xs font-bold text-slate-600 mt-1">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 flex items-center gap-3 text-red-700 font-medium text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!error && totalTests === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-12 text-center border border-slate-200 bg-white shadow-xs"
        >
          <div className="w-20 h-20 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto mb-6">
            <History className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Test History Yet</h3>
          <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6">
            Your completed assessments will appear here permanently with detailed scores, performance
            metrics, and proctoring reports.
          </p>
          <Link
            href="/candidate/tests"
            className="btn-neon btn-neon-primary inline-flex items-center gap-2 text-sm py-2 px-5 font-bold shadow-md"
          >
            Browse Active Tests <ChevronRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium mt-6">
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
          className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden"
        >
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_1fr_1fr_80px] gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold uppercase tracking-widest text-slate-700">
            <span>Assessment</span>
            <span>Type</span>
            <span>Score</span>
            <span>Accuracy</span>
            <span>Integrity</span>
            <span>Infractions</span>
            <span>Date</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-slate-200">
            <AnimatePresence>
              {history.map((entry, i) => {
                const isExpanded = expandedId === entry.sessionId;
                const diffColor = difficultyColors[entry.difficulty] || '#64748b';
                const integrityColor =
                  entry.integrityScore >= 90 ? '#059669' :
                  entry.integrityScore >= 70 ? '#d97706' : '#dc2626';
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
                      className="w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="grid md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_1fr_1fr_80px] gap-4 items-center">
                        {/* Assessment Name */}
                        <div className="min-w-0">
                          <p className="text-base font-extrabold text-slate-900 truncate">{entry.assessmentTitle}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-[10px] font-extrabold uppercase"
                              style={{ color: diffColor }}
                            >
                              {entry.difficulty}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">{entry.duration} min</span>
                          </div>
                        </div>

                        {/* Type */}
                        <span className="hidden md:block text-xs text-slate-700 font-bold font-mono">
                          {typeLabels[entry.assessmentType] ?? entry.assessmentType}
                        </span>

                        {/* Score */}
                        <span
                          className={`hidden md:block text-base font-extrabold ${entry.isPassed ? 'text-emerald-600' : 'text-red-600'}`}
                        >
                          {entry.finalScore}
                          <span className="text-[10px] font-bold text-slate-500 ml-1">/ {entry.totalMarks}</span>
                        </span>

                        {/* Accuracy */}
                        <span className="hidden md:block text-sm font-extrabold text-slate-900">
                          {entry.accuracy}%
                        </span>

                        {/* Integrity */}
                        <span
                          className="hidden md:flex items-center gap-1 text-sm font-extrabold"
                          style={{ color: integrityColor }}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          {entry.integrityScore}%
                        </span>

                        {/* Infractions */}
                        <span
                          className={`hidden md:block text-sm font-bold ${entry.violations > 0 ? 'text-amber-600' : 'text-slate-400'}`}
                        >
                          {entry.violations > 0 ? `⚠ ${entry.violations}` : '—'}
                        </span>

                        {/* Date */}
                        <span className="hidden md:block text-xs text-slate-600 font-semibold">
                          {formatDate(entry.startedAt)}
                        </span>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {isDisqualified ? (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 whitespace-nowrap">
                              Disqualified
                            </span>
                          ) : entry.isPassed ? (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 whitespace-nowrap">
                              Passed
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 whitespace-nowrap">
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
                          <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-200 pt-4 bg-slate-50">
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Time Taken</p>
                              <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-blue-600" />
                                {formatDuration(entry.startedAt, entry.endedAt)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Passing Marks</p>
                              <p className="text-sm font-bold text-slate-900">
                                {entry.passingMarks} pts required
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Session Result</p>
                              <p className={`text-sm font-bold flex items-center gap-1 ${entry.isPassed && !isDisqualified ? 'text-emerald-600' : 'text-red-600'}`}>
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
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Submitted At</p>
                              <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-blue-600" />
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
