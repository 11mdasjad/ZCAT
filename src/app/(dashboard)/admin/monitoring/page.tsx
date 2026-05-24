'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, AlertTriangle, CheckCircle, XCircle, Eye, RefreshCw, Loader2,
  ShieldAlert, X, User, Clock, Shield, Activity, Trash2, Zap, Monitor,
  Wifi, TrendingDown, CheckCircle2, AlertCircle, Info, Code2, FileText,
  Timer, Users, Flag, Target,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LiveExam {
  id: string;
  name: string;          // assessment title
  candidate: string;     // candidate name
  status: 'active' | 'warning' | 'flagged';
  violations: number;
  timeLeft: string;      // pre-computed MM:SS string from API
  integrity: number;
  imageUrl?: string | null;
  // raw timestamps for client-side live countdown
  startedAt?: string;
  assessmentDuration?: number; // in minutes
}

interface SessionDetails {
  id: string;
  status: string;
  startedAt: string;
  integrityScore: number;
  ipAddress: string;
  userAgent: string;
  elapsedSeconds: number;
  remainingSeconds: number;
  timeRemainingFormatted: string;
  hasCriticalViolation: boolean;
  uniqueQuestionsAnswered: number;
  correctSubmissions: number;
  currentScore: number;
  totalSubmissions: number;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  assessment: {
    id: string;
    title: string;
    type: string;
    difficulty: string;
    duration: number;
    totalMarks: number;
    passingMarks: number;
  };
  violations: {
    id: string;
    type: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    description: string;
    timestamp: string;
  }[];
  snapshots: {
    id: string;
    imageUrl: string;
    capturedAt: string;
  }[];
  submissions: {
    id: string;
    questionId: string;
    status: string;
    score: number | null;
    submittedAt: string;
  }[];
}

const SEVERITY_CONFIG = {
  CRITICAL: { color: '#ef4444', bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/30', label: 'CRITICAL' },
  WARNING:  { color: '#f59e0b', bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/30', label: 'WARNING'  },
  INFO:     { color: '#00d4ff', bg: 'bg-[#00d4ff]/10', border: 'border-[#00d4ff]/30', label: 'INFO'     },
};

const VIOLATION_ICONS: Record<string, string> = {
  TAB_SWITCH:          '🔀',
  COPY_PASTE:          '📋',
  MULTIPLE_FACES:      '👥',
  NO_FACE:             '🚫',
  SUSPICIOUS_ACTIVITY: '⚠️',
  UNAUTHORIZED_DEVICE: '💻',
};

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function LiveCountdown({ startedAt, durationMins }: { startedAt: string; durationMins: number }) {
  const [remaining, setRemaining] = useState('--:--');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const tick = () => {
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      const total = durationMins * 60;
      const rem = Math.max(0, total - elapsed);
      const m = Math.floor(rem / 60);
      const s = rem % 60;
      setRemaining(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      setUrgent(rem <= 300); // last 5 minutes
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, durationMins]);

  return (
    <span className={`font-mono text-xs font-bold ${urgent ? 'text-[#ef4444] animate-pulse' : 'text-white'}`}>
      {remaining}
    </span>
  );
}

export default function MonitoringPage() {
  const [sessions, setSessions] = useState<LiveExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Detail modal states
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const [activeSnapshotIdx, setActiveSnapshotIdx] = useState(0);

  const fetchActiveSessions = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const response = await fetch('/api/v1/admin/monitoring');
      if (!response.ok) throw new Error('Failed to load active exam sessions');
      const data = await response.json();
      setSessions(data.data || []);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load + 10-second auto-polling
  useEffect(() => {
    fetchActiveSessions();
    const pollInterval = setInterval(() => fetchActiveSessions(), 10000);
    return () => clearInterval(pollInterval);
  }, [fetchActiveSessions]);

  // Poll detail overlay every 12s when open
  useEffect(() => {
    if (!selectedSessionId) return;
    const pollDetails = async () => {
      try {
        const response = await fetch(`/api/v1/admin/monitoring/${selectedSessionId}`);
        if (response.ok) {
          const data = await response.json();
          setSessionDetails(data.data || null);
        }
      } catch (_) {}
    };
    const interval = setInterval(pollDetails, 12000);
    return () => clearInterval(interval);
  }, [selectedSessionId]);

  const handleOpenDetails = async (id: string) => {
    setSelectedSessionId(id);
    setDetailsLoading(true);
    setActiveSnapshotIdx(0);
    try {
      const response = await fetch(`/api/v1/admin/monitoring/${id}`);
      if (!response.ok) throw new Error('Failed to load proctoring logs.');
      const data = await response.json();
      setSessionDetails(data.data || null);
    } catch (err: any) {
      toast.error(err.message || 'Could not retrieve candidate proctoring data');
      setSelectedSessionId(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleTerminateSession = async (id: string) => {
    const isConfirmed = window.confirm(
      '⚠️ ATTENTION: Are you absolutely sure you want to DISQUALIFY and TERMINATE this candidate\'s exam session?\n\n' +
      'This will immediately lock the candidate out of the exam workspace. This action is permanently audit-logged and CANNOT be undone.'
    );
    if (!isConfirmed) return;

    setTerminatingId(id);
    try {
      const response = await fetch(`/api/v1/admin/monitoring/${id}/terminate`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to terminate exam session.');
      toast.success('Exam session terminated. Candidate disqualified successfully.');
      setSelectedSessionId(null);
      setSessionDetails(null);
      fetchActiveSessions(true);
    } catch (err: any) {
      toast.error(err.message || 'Error occurred during disqualification procedure.');
    } finally {
      setTerminatingId(null);
    }
  };

  const totalActive = sessions.length;
  const noViolations = sessions.filter((s) => s.violations === 0).length;
  const warnings = sessions.filter((s) => s.status === 'warning').length;
  const flagged = sessions.filter((s) => s.status === 'flagged').length;

  // Determine red zone for detail modal
  const isRedZone = sessionDetails
    ? (sessionDetails.integrityScore < 80 ||
       sessionDetails.violations.length >= 2 ||
       sessionDetails.hasCriticalViolation)
    : false;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-[#00d4ff]" />
            </span>
            Live Monitoring
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-[#8b949e]">Real-time proctoring dashboard — all active exam sessions.</p>
            {lastUpdated && (
              <span className="text-[10px] text-[#484f58] font-mono flex items-center gap-1">
                <Wifi className="w-3 h-3 text-[#10b981]" />
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
            Auto-refresh: 10s
          </div>
          <button
            onClick={() => fetchActiveSessions(true)}
            disabled={loading || isRefreshing}
            className="btn-neon btn-neon-secondary !py-2 !px-4 text-sm flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#00d4ff]' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Sessions', value: totalActive, icon: Users, color: '#00d4ff', desc: 'Currently in exam' },
          { label: 'Complying',       value: noViolations, icon: CheckCircle2, color: '#10b981', desc: 'Zero infractions' },
          { label: 'Warnings',        value: warnings, icon: AlertCircle, color: '#f59e0b', desc: '2–4 violations' },
          { label: 'Flagged',         value: flagged, icon: Flag, color: '#ef4444', desc: '5+ violations / critical' },
        ].map(({ label, value, icon: Icon, color, desc }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-5 border border-[#21262d] flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}12`, border: `1px solid ${color}25` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
              <div className="text-xs font-semibold text-white">{label}</div>
              <div className="text-[10px] text-[#484f58]">{desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
          <p className="text-sm text-[#8b949e]">Connecting to live examination feeds...</p>
        </div>
      ) : totalActive > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sessions.map((exam, i) => {
            const isFlagged = exam.status === 'flagged';
            const isWarning = exam.status === 'warning';
            const borderClass = isFlagged
              ? 'border-[#ef4444]/50 shadow-[0_0_20px_rgba(239,68,68,0.12)]'
              : isWarning
              ? 'border-[#f59e0b]/40 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
              : 'border-[#21262d] hover:border-[#00d4ff]/30';

            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleOpenDetails(exam.id)}
                className={`glass-card rounded-xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] duration-200 group ${borderClass}`}
              >
                {/* Webcam / Snapshot Feed */}
                <div className="aspect-video bg-[#06080f] relative flex items-center justify-center overflow-hidden">
                  {exam.imageUrl ? (
                    <img
                      src={exam.imageUrl}
                      alt={exam.candidate}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 scale-x-[-1]"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-[#21262d] group-hover:text-[#484f58] transition-colors">
                      <Camera className="w-7 h-7" />
                      <span className="text-[7px] font-mono tracking-widest uppercase">No Feed</span>
                    </div>
                  )}

                  {/* Live pulse indicator */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      isFlagged ? 'bg-[#ef4444]' : isWarning ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
                    } animate-ping`} />
                  </div>

                  {/* Violation HUD badge */}
                  {exam.violations > 0 && (
                    <div className={`absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded backdrop-blur-sm border ${
                      isFlagged ? 'bg-[#ef4444]/20 border-[#ef4444]/40' : 'bg-[#f59e0b]/20 border-[#f59e0b]/40'
                    }`}>
                      <AlertTriangle className={`w-3 h-3 ${isFlagged ? 'text-[#ef4444]' : 'text-[#f59e0b]'}`} />
                      <span className={`text-[10px] font-bold ${isFlagged ? 'text-[#ef4444]' : 'text-[#f59e0b]'}`}>
                        {exam.violations}
                      </span>
                    </div>
                  )}

                  {/* Live countdown */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-[#21262d]/60 flex items-center gap-1">
                    <Timer className="w-2.5 h-2.5 text-[#8b949e]" />
                    {exam.startedAt && exam.assessmentDuration ? (
                      <LiveCountdown startedAt={exam.startedAt} durationMins={exam.assessmentDuration} />
                    ) : (
                      <span className="font-mono text-xs text-white">{exam.timeLeft}</span>
                    )}
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="p-3 bg-[#0a0c10]/70">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-[#00d4ff] transition-colors">
                    {exam.candidate}
                  </p>
                  <p className="text-[10px] text-[#484f58] truncate mt-0.5">{exam.name}</p>

                  {/* Integrity bar */}
                  <div className="mt-2.5 pt-2 border-t border-[#21262d]/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-[#484f58] uppercase tracking-wider font-bold">Integrity</span>
                      <span className={`text-[10px] font-bold ${
                        exam.integrity >= 90 ? 'text-[#10b981]' : exam.integrity >= 70 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                      }`}>{exam.integrity}%</span>
                    </div>
                    <div className="w-full h-1 bg-[#161b22] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          exam.integrity >= 90 ? 'bg-[#10b981]' : exam.integrity >= 70 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'
                        }`}
                        style={{ width: `${exam.integrity}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-2xl p-16 text-center flex flex-col items-center max-w-xl mx-auto space-y-4 border border-[#21262d]"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center">
            <Monitor className="w-8 h-8 text-[#00d4ff]/40 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">No Active Exam Sessions</h3>
            <p className="text-xs text-[#8b949e] max-w-md leading-relaxed">
              All exam sessions are currently idle or completed. Live proctoring feeds, violation alerts, and integrity tracking will appear here instantly as candidates start their assessments.
            </p>
          </div>
        </motion.div>
      )}

      {/* ===== DETAIL MODAL ===== */}
      <AnimatePresence>
        {selectedSessionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setSelectedSessionId(null)} />

            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 22, stiffness: 200 }}
              className={`relative z-10 w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0a0c10] border rounded-2xl shadow-2xl overflow-hidden ${
                isRedZone
                  ? 'border-[#ef4444]/50 shadow-[0_0_60px_rgba(239,68,68,0.18)]'
                  : 'border-[#21262d]'
              }`}
            >
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-36 space-y-4">
                  <Loader2 className="w-10 h-10 text-[#00d4ff] animate-spin" />
                  <p className="text-sm font-mono text-[#8b949e]">Connecting to proctor live channel...</p>
                </div>
              ) : sessionDetails ? (
                <>
                  {/* ─── RED ZONE BANNER ─── */}
                  {isRedZone && (
                    <div className="flex items-center gap-3 px-5 py-3 bg-[#ef4444]/10 border-b border-[#ef4444]/30">
                      <ShieldAlert className="w-5 h-5 text-[#ef4444] animate-pulse flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs font-black text-[#ef4444] uppercase tracking-widest">
                          ⚠ RED ZONE: CRITICAL PROCTORING ALERT
                        </span>
                        <p className="text-[10px] text-[#ef4444]/70 mt-0.5">
                          {sessionDetails.hasCriticalViolation
                            ? 'CRITICAL severity violation detected. Immediate review required.'
                            : sessionDetails.integrityScore < 80
                            ? `Integrity score critically low at ${sessionDetails.integrityScore}%. Disqualification recommended.`
                            : `${sessionDetails.violations.length} violations logged. Candidate under close watch.`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ─── MODAL HEADER ─── */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d] bg-[#0d1117]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/25 flex items-center justify-center">
                        <User className="w-5 h-5 text-[#00d4ff]" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                          {sessionDetails.user?.name || 'Anonymous Candidate'}
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            sessionDetails.violations.length >= 5 || sessionDetails.hasCriticalViolation
                              ? 'bg-[#ef4444]/10 border border-[#ef4444]/25 text-[#ef4444]'
                              : sessionDetails.violations.length >= 2
                              ? 'bg-[#f59e0b]/10 border border-[#f59e0b]/25 text-[#f59e0b]'
                              : 'bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981]'
                          }`}>
                            {sessionDetails.violations.length >= 5 || sessionDetails.hasCriticalViolation
                              ? '🚩 FLAGGED'
                              : sessionDetails.violations.length >= 2
                              ? '⚠ WARNING'
                              : '✓ COMPLYING'}
                          </span>
                        </h2>
                        <p className="text-[11px] text-[#484f58]">{sessionDetails.user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSessionId(null)}
                      className="p-1.5 rounded-lg border border-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#161b22] transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* ─── MODAL BODY ─── */}
                  <div className="flex-1 overflow-y-auto">
                    {/* Top: quick stat row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-px bg-[#21262d] border-b border-[#21262d]">
                      {[
                        {
                          label: 'Time Remaining',
                          value: (
                            <LiveCountdown
                              startedAt={sessionDetails.startedAt}
                              durationMins={sessionDetails.assessment.duration}
                            />
                          ),
                          icon: Timer,
                          color: '#00d4ff',
                        },
                        {
                          label: 'Time Elapsed',
                          value: <span className="text-xs font-bold text-white">{formatElapsed(sessionDetails.elapsedSeconds)}</span>,
                          icon: Clock,
                          color: '#8b949e',
                        },
                        {
                          label: 'Integrity Score',
                          value: (
                            <span className={`text-base font-extrabold ${
                              sessionDetails.integrityScore >= 80 ? 'text-[#10b981]' :
                              sessionDetails.integrityScore >= 50 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                            }`}>{sessionDetails.integrityScore}%</span>
                          ),
                          icon: Shield,
                          color: sessionDetails.integrityScore >= 80 ? '#10b981' : sessionDetails.integrityScore >= 50 ? '#f59e0b' : '#ef4444',
                        },
                        {
                          label: 'Violations',
                          value: (
                            <span className={`text-base font-extrabold ${
                              sessionDetails.violations.length === 0 ? 'text-[#10b981]' :
                              sessionDetails.violations.length < 5 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                            }`}>{sessionDetails.violations.length}</span>
                          ),
                          icon: AlertTriangle,
                          color: sessionDetails.violations.length === 0 ? '#10b981' : '#ef4444',
                        },
                        {
                          label: 'Qs Answered',
                          value: <span className="text-base font-extrabold text-white">{sessionDetails.uniqueQuestionsAnswered}</span>,
                          icon: Target,
                          color: '#a855f7',
                        },
                        {
                          label: 'Current Score',
                          value: <span className="text-base font-extrabold text-white">{sessionDetails.currentScore} pts</span>,
                          icon: Zap,
                          color: '#f59e0b',
                        },
                      ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-[#0a0c10] px-4 py-3 flex items-center gap-2.5">
                          <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                          <div>
                            <p className="text-[9px] text-[#484f58] uppercase tracking-wider font-bold">{label}</p>
                            <div className="mt-0.5">{value}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Main two-column layout */}
                    <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#21262d]">
                      {/* ── LEFT: Snapshots + Assessment Info ── */}
                      <div className="p-5 space-y-5">
                        {/* Live snapshot */}
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <h3 className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest">
                              Live Webcam Feed
                            </h3>
                            {sessionDetails.snapshots.length > 0 && (
                              <span className="text-[9px] text-[#484f58] font-mono">
                                {sessionDetails.snapshots.length} capture{sessionDetails.snapshots.length !== 1 ? 's' : ''} stored
                              </span>
                            )}
                          </div>

                          <div className="aspect-video rounded-xl bg-[#06080f] border border-[#21262d] overflow-hidden relative flex items-center justify-center">
                            {sessionDetails.snapshots.length > 0 ? (
                              <>
                                <img
                                  src={sessionDetails.snapshots[activeSnapshotIdx]?.imageUrl}
                                  alt="Proctor Feed"
                                  className="w-full h-full object-cover scale-x-[-1]"
                                />
                                {/* Feed live badge */}
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-[#21262d]/60 text-[9px] font-mono text-white flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                                  {activeSnapshotIdx === 0 ? 'Latest Feed' : `Capture ${sessionDetails.snapshots.length - activeSnapshotIdx}`}
                                </div>
                                {/* Timestamp */}
                                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-[#21262d]/60 text-[9px] font-mono text-white">
                                  {new Date(sessionDetails.snapshots[activeSnapshotIdx]?.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                              </>
                            ) : (
                              <div className="relative w-full h-full bg-[#070913] flex flex-col items-center justify-center overflow-hidden">
                                <Camera className="w-10 h-10 text-[#00d4ff]/20 animate-pulse" />
                                <motion.div
                                  initial={{ top: 0 }}
                                  animate={{ top: '100%' }}
                                  transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                                  className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent shadow-[0_0_8px_#00d4ff]"
                                />
                                <span className="text-[8px] font-mono text-[#00d4ff]/60 tracking-widest mt-3 uppercase">Telemetry Online — Awaiting Frame</span>
                              </div>
                            )}
                          </div>

                          {/* Snapshot thumbnails */}
                          {sessionDetails.snapshots.length > 1 && (
                            <div className="mt-3 grid grid-cols-5 gap-1.5">
                              {sessionDetails.snapshots.slice(0, 10).map((snap, idx) => (
                                <button
                                  key={snap.id}
                                  onClick={() => setActiveSnapshotIdx(idx)}
                                  className={`relative aspect-video rounded-md overflow-hidden border transition-all ${
                                    activeSnapshotIdx === idx
                                      ? 'border-[#00d4ff] ring-1 ring-[#00d4ff]/40'
                                      : 'border-[#21262d] hover:border-[#484f58]'
                                  }`}
                                >
                                  <img src={snap.imageUrl} alt="" className="w-full h-full object-cover scale-x-[-1]" />
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[6px] font-mono text-center text-white py-0.5">
                                    {new Date(snap.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Assessment + Session metadata */}
                        <div className="space-y-3">
                          <h3 className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest">Assessment Info</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: 'Test Name',   value: sessionDetails.assessment.title,      color: '#00d4ff' },
                              { label: 'Type',        value: sessionDetails.assessment.type,        color: '#a855f7' },
                              { label: 'Difficulty',  value: sessionDetails.assessment.difficulty,  color: sessionDetails.assessment.difficulty === 'HARD' ? '#ef4444' : sessionDetails.assessment.difficulty === 'MEDIUM' ? '#f59e0b' : '#10b981' },
                              { label: 'Duration',    value: `${sessionDetails.assessment.duration} min`, color: '#8b949e' },
                              { label: 'Total Marks', value: `${sessionDetails.assessment.totalMarks} pts`, color: '#f59e0b' },
                              { label: 'Pass Marks',  value: `${sessionDetails.assessment.passingMarks} pts`, color: '#10b981' },
                            ].map(({ label, value, color }) => (
                              <div key={label} className="bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2">
                                <p className="text-[9px] text-[#484f58] uppercase tracking-wider font-bold">{label}</p>
                                <p className="text-xs font-semibold mt-0.5 truncate" style={{ color }}>{value}</p>
                              </div>
                            ))}
                          </div>

                          {/* IP + Device */}
                          <div className="bg-[#0d1117] border border-[#21262d] rounded-lg px-3 py-2 space-y-1">
                            <p className="text-[9px] text-[#484f58] uppercase tracking-wider font-bold">Session Telemetry</p>
                            <p className="text-[10px] text-[#8b949e] font-mono break-all">
                              IP: <span className="text-white">{sessionDetails.ipAddress || 'Unknown'}</span>
                            </p>
                            <p className="text-[10px] text-[#484f58] font-mono truncate">
                              {sessionDetails.userAgent
                                ? sessionDetails.userAgent.substring(0, 80) + (sessionDetails.userAgent.length > 80 ? '…' : '')
                                : 'No UA data'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ── RIGHT: Violations + Integrity ring ── */}
                      <div className="p-5 space-y-5">
                        {/* Integrity ring */}
                        <div className="flex items-center gap-5 p-4 bg-[#0d1117] border border-[#21262d] rounded-xl">
                          {/* SVG circle */}
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <path
                                strokeWidth="2.5"
                                stroke="#21262d"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                stroke={
                                  sessionDetails.integrityScore >= 80 ? '#10b981' :
                                  sessionDetails.integrityScore >= 50 ? '#f59e0b' : '#ef4444'
                                }
                                strokeDasharray={`${sessionDetails.integrityScore}, 100`}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">
                              {sessionDetails.integrityScore}%
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-black text-white">Integrity Score</p>
                            <p className="text-[10px] text-[#8b949e] mt-0.5">
                              {sessionDetails.integrityScore >= 90
                                ? 'Excellent — No concerns'
                                : sessionDetails.integrityScore >= 70
                                ? 'Moderate — Monitor closely'
                                : 'Critical — Action required'}
                            </p>
                            {/* Mini integrity bar */}
                            <div className="mt-2 h-1 bg-[#161b22] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  sessionDetails.integrityScore >= 80 ? 'bg-[#10b981]' :
                                  sessionDetails.integrityScore >= 50 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'
                                }`}
                                style={{ width: `${sessionDetails.integrityScore}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Violation log */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2.5">
                            <h3 className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest">
                              Infraction Logs
                            </h3>
                            <div className="flex items-center gap-2">
                              {['CRITICAL', 'WARNING', 'INFO'].map((sev) => {
                                const count = sessionDetails.violations.filter((v) => v.severity === sev).length;
                                if (count === 0) return null;
                                const cfg = SEVERITY_CONFIG[sev as keyof typeof SEVERITY_CONFIG];
                                return (
                                  <span
                                    key={sev}
                                    className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${cfg.bg} border ${cfg.border}`}
                                    style={{ color: cfg.color }}
                                  >
                                    {count} {sev}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-2 max-h-[calc(100%-40px)] overflow-y-auto pr-1"
                            style={{ maxHeight: '380px' }}>
                            {sessionDetails.violations.length > 0 ? (
                              sessionDetails.violations.map((violation) => {
                                const cfg = SEVERITY_CONFIG[violation.severity] ?? SEVERITY_CONFIG.INFO;
                                const icon = VIOLATION_ICONS[violation.type] ?? '⚡';
                                return (
                                  <div
                                    key={violation.id}
                                    className={`p-3 rounded-lg border ${cfg.bg} ${cfg.border} transition-all`}
                                  >
                                    <div className="flex items-center justify-between mb-1.5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">{icon}</span>
                                        <span
                                          className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.border}`}
                                          style={{ color: cfg.color }}
                                        >
                                          {violation.type.replace(/_/g, ' ')}
                                        </span>
                                        <span
                                          className={`text-[8px] font-bold uppercase px-1 py-0.5 rounded`}
                                          style={{ color: cfg.color }}
                                        >
                                          {violation.severity}
                                        </span>
                                      </div>
                                      <span className="text-[9px] font-mono text-[#484f58] flex-shrink-0 ml-2">
                                        {new Date(violation.timestamp).toLocaleTimeString([], {
                                          hour: '2-digit', minute: '2-digit', second: '2-digit',
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-[#c9d1d9] leading-relaxed">{violation.description}</p>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#21262d] rounded-xl bg-[#0d1117]/40">
                                <CheckCircle className="w-8 h-8 text-[#10b981] mb-2" />
                                <p className="text-xs font-semibold text-white">Integrity Verified</p>
                                <p className="text-[10px] text-[#484f58] mt-0.5">No infractions recorded for this session.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─── MODAL FOOTER ─── */}
                  <div className="px-5 py-4 border-t border-[#21262d] bg-[#0d1117] flex items-center justify-between gap-3">
                    <div className="text-[10px] text-[#484f58] font-mono">
                      Session ID: <span className="text-[#8b949e]">{sessionDetails.id.substring(0, 16)}…</span>
                      <span className="ml-3">Started: {new Date(sessionDetails.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSessionId(null)}
                        className="px-4 py-2 text-xs font-semibold text-[#8b949e] hover:text-white rounded-lg border border-[#21262d] hover:bg-[#161b22] transition-all"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => handleTerminateSession(sessionDetails.id)}
                        disabled={terminatingId === sessionDetails.id}
                        className="px-4 py-2 text-xs font-black text-white rounded-lg bg-[#ef4444] hover:bg-red-600 active:scale-[0.98] border border-[#ef4444]/30 shadow-[0_0_20px_rgba(239,68,68,0.25)] disabled:opacity-50 flex items-center gap-1.5 transition-all"
                      >
                        {terminatingId === sessionDetails.id ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Terminating...</>
                        ) : (
                          <><Trash2 className="w-3.5 h-3.5" /> Terminate &amp; Disqualify</>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <XCircle className="w-10 h-10 text-red-500" />
                  <p className="text-sm font-semibold text-white">Failed to query session info.</p>
                  <button onClick={() => handleOpenDetails(selectedSessionId!)} className="btn-neon text-xs">
                    Retry Fetch
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
