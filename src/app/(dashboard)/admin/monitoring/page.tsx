'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, AlertTriangle, CheckCircle, XCircle, Eye, RefreshCw, Loader2,
  ShieldAlert, X, User, Clock, Shield, Activity, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LiveExam {
  id: string;
  name: string;
  candidate: string;
  status: string;
  violations: number;
  timeLeft: string;
  integrity: number;
  imageUrl?: string | null;
}

export default function MonitoringPage() {
  const [sessions, setSessions] = useState<LiveExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal / Detail States
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);

  const fetchActiveSessions = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const response = await fetch('/api/v1/admin/monitoring');
      if (!response.ok) throw new Error('Failed to load active exam sessions');
      const data = await response.json();
      setSessions(data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();

    // Auto-refresh every 30 seconds to support true real-time tracking
    const pollInterval = setInterval(() => {
      fetchActiveSessions();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  // Poll details of selected session if open to support live proctor logs update
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

    const interval = setInterval(pollDetails, 15000); // refresh detail overlay every 15s
    return () => clearInterval(interval);
  }, [selectedSessionId]);

  const handleOpenDetails = async (id: string) => {
    setSelectedSessionId(id);
    setDetailsLoading(true);
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
      'This will immediately boot the candidate out of the exam workspace and close their connection. This action is recorded in the audit log and CANNOT be undone.'
    );
    if (!isConfirmed) return;

    setTerminatingId(id);
    try {
      const response = await fetch(`/api/v1/admin/monitoring/${id}/terminate`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to terminate exam session.');
      
      toast.success('Exam session terminated. Candidate disqualified successfully.');
      setSelectedSessionId(null);
      setSessionDetails(null);
      fetchActiveSessions(true); // reload dashboard
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

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Camera className="w-6 h-6 text-[#00d4ff]" /> Live Monitoring
          </h1>
          <p className="text-sm text-[#8b949e] mt-1">Real-time database tracking of active exam sessions.</p>
        </div>
        <button
          onClick={() => fetchActiveSessions(true)}
          disabled={loading || isRefreshing}
          className="btn-neon btn-neon-secondary !py-2 !px-4 text-sm flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#00d4ff]' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Sessions', value: totalActive, color: '#00d4ff' },
          { label: 'No Violations', value: noViolations, color: '#10b981' },
          { label: 'Warnings', value: warnings, color: '#f59e0b' },
          { label: 'Flagged', value: flagged, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-xl p-4 text-center border border-[#21262d]">
            <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
            <div className="text-xs text-[#8b949e] font-medium mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Monitoring Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
          <p className="text-sm text-[#8b949e]">Connecting to live examination feeds...</p>
        </div>
      ) : totalActive > 0 ? (
        /* Active Sessions Grid */
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sessions.map((exam, i) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleOpenDetails(exam.id)}
              className={`glass-card rounded-xl overflow-hidden border border-[#21262d] cursor-pointer transition-all hover:scale-[1.02] duration-300 group ${
                exam.status === 'flagged' ? 'border-[#ef4444]/40 hover:border-[#ef4444]/70 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : exam.status === 'warning' ? 'border-[#f59e0b]/40 hover:border-[#f59e0b]/70' : 'hover:border-[#00d4ff]/30'
              }`}
            >
              {/* Webcam Container */}
              <div className="aspect-video bg-[#0d1117] relative flex items-center justify-center overflow-hidden">
                {exam.imageUrl ? (
                  <img
                    src={exam.imageUrl}
                    alt={exam.candidate}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-[#21262d] group-hover:text-[#8b949e] transition-colors">
                    <Camera className="w-8 h-8" />
                    <span className="text-[8px] font-mono tracking-wider uppercase">Loading Feed...</span>
                  </div>
                )}
                
                {/* Status Indicator */}
                <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${
                  exam.status === 'active' ? 'bg-[#10b981]' : exam.status === 'warning' ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'
                } animate-[pulse-glow_2s_ease-in-out_infinite]`} />
                
                {/* Violation Count HUD */}
                {exam.violations > 0 && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#ef4444]/20 border border-[#ef4444]/30 backdrop-blur-md">
                    <AlertTriangle className="w-3 h-3 text-[#ef4444]" />
                    <span className="text-[10px] text-[#ef4444] font-bold">{exam.violations}</span>
                  </div>
                )}
                
                {/* Clock Remaining */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-xs font-mono text-white backdrop-blur-sm border border-[#21262d]/50">
                  {exam.timeLeft}
                </div>
              </div>

              {/* Candidate Info */}
              <div className="p-3 bg-[#0c0e12]/60">
                <p className="text-sm font-semibold text-white truncate group-hover:text-[#00d4ff] transition-colors">{exam.candidate}</p>
                <p className="text-xs text-[#8b949e] truncate mt-0.5">{exam.name}</p>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#21262d]/50">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-[#161b22] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        exam.integrity >= 90 ? 'bg-[#10b981]' : exam.integrity >= 70 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'
                      }`} style={{ width: `${exam.integrity}%` }} />
                    </div>
                    <span className="text-[10px] text-[#8b949e] font-semibold">{exam.integrity}% integrity</span>
                  </div>
                  <span className="p-1 rounded text-[#8b949e] group-hover:text-[#00d4ff] transition-colors" title="View Telemetry">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-2xl p-12 text-center flex flex-col items-center max-w-xl mx-auto space-y-4 border border-[#21262d]"
        >
          <div className="w-12 h-12 rounded-full bg-[#161b22] flex items-center justify-center text-[#8b949e]">
            <ShieldAlert className="w-6 h-6 text-[#8b949e] animate-pulse-glow" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Active Exam Sessions Found</h3>
            <p className="text-xs text-[#8b949e] max-w-md leading-relaxed">
              All candidate examinations are currently idle or completed. Live WebRTC monitoring feeds and violation alerts will register here instantly as soon as a candidate starts an assessment.
            </p>
          </div>
        </motion.div>
      )}

      {/* PROCTORINGSnapshots & INFRACTIONS TELEMETRY MODAL OVERLAY */}
      <AnimatePresence>
        {selectedSessionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            {/* Backdrop Dismiss Target */}
            <div className="absolute inset-0 cursor-default" onClick={() => setSelectedSessionId(null)} />

            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col glass-card bg-[#0d1117]/95 border border-[#21262d] rounded-2xl shadow-2xl overflow-hidden ${
                sessionDetails && (sessionDetails.integrityScore < 80 || sessionDetails.violations?.length >= 2)
                  ? 'border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-[pulse-glow_3s_infinite]'
                  : ''
              }`}
            >
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                  <Loader2 className="w-10 h-10 text-[#00d4ff] animate-spin" />
                  <p className="text-sm font-mono text-[#8b949e]">Connecting to proctor live channel...</p>
                </div>
              ) : sessionDetails ? (
                <>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-4.5 border-b border-[#21262d]/80 bg-[#161b22]/40 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff]">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                          {sessionDetails.user?.name || 'Anonymous Candidate'}
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            sessionDetails.status === 'ACTIVE' 
                              ? sessionDetails.violations?.length >= 5
                                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                : sessionDetails.violations?.length >= 2
                                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : 'bg-zinc-500/10 border border-zinc-500/20 text-zinc-400'
                          }`}>
                            {sessionDetails.violations?.length >= 5
                              ? 'FLAGGED'
                              : sessionDetails.violations?.length >= 2
                              ? 'WARNING'
                              : 'COMPLYING'}
                          </span>
                        </h2>
                        <p className="text-[11px] text-[#8b949e]">{sessionDetails.user?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSessionId(null)}
                      className="p-1.5 rounded-lg border border-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#161b22] transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Webcam Snapshot Feed & circular stats */}
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-2">Live Snapshots Feed</h3>
                        <div className="relative aspect-video rounded-xl bg-[#06080f] overflow-hidden border border-[#21262d] flex items-center justify-center group shadow-inner">
                          {sessionDetails.snapshots && sessionDetails.snapshots.length > 0 ? (
                            <img
                              src={sessionDetails.snapshots[0].imageUrl}
                              alt="Live Proctor Feed"
                              className="w-full h-full object-cover scale-x-[-1]"
                            />
                          ) : (
                            /* Advanced Scanning Vector Backdrop Fallback */
                            <div className="relative w-full h-full bg-[#070913] flex flex-col items-center justify-center border border-[#1f2937]/50 rounded-xl overflow-hidden p-4">
                              <div className="absolute inset-0 bg-radial-grid opacity-15" />
                              <Camera className="w-10 h-10 text-[#00d4ff]/25 animate-pulse" />
                              {/* Horizontal Frame Scanning line */}
                              <motion.div
                                initial={{ top: 0 }}
                                animate={{ top: "100%" }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent shadow-[0_0_8px_#00d4ff]"
                              />
                              <span className="text-[8px] font-mono text-[#00d4ff] tracking-widest mt-2 uppercase animate-pulse">Telemetry Scan Online...</span>
                            </div>
                          )}
                          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 text-[9px] font-mono text-white backdrop-blur-sm border border-[#21262d]/50 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                            Feed Live
                          </div>
                        </div>
                      </div>

                      {/* Snapshots Timeline Grid */}
                      {sessionDetails.snapshots && sessionDetails.snapshots.length > 1 && (
                        <div>
                          <h4 className="text-[10px] font-black text-[#8b949e] uppercase tracking-wider mb-2">Webcam Captures Timeline</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {sessionDetails.snapshots.slice(0, 4).map((snap: any, index: number) => (
                              <div key={snap.id} className="relative aspect-video rounded-lg border border-[#21262d] overflow-hidden group cursor-pointer hover:border-[#00d4ff] transition-colors">
                                <img src={snap.imageUrl} alt={`Capture ${index}`} className="w-full h-full object-cover scale-x-[-1]" />
                                <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-[7px] font-mono text-center text-white py-0.5">
                                  {new Date(snap.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Integrity circle & Telemetry specs */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Circle score */}
                        <div className="glass-card rounded-xl p-4 border border-[#21262d] flex flex-col items-center justify-center text-center">
                          <div className="relative w-20 h-20 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                              <path
                                className="text-[#161b22]"
                                strokeWidth="2.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={
                                  sessionDetails.integrityScore >= 80 
                                    ? 'text-[#10b981]' 
                                    : sessionDetails.integrityScore >= 50 
                                    ? 'text-[#f59e0b]' 
                                    : 'text-[#ef4444]'
                                }
                                strokeDasharray={`${sessionDetails.integrityScore}, 100`}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <span className="absolute text-base font-black text-white">{sessionDetails.integrityScore}%</span>
                          </div>
                          <span className="text-[10px] text-[#8b949e] font-semibold mt-2.5 uppercase tracking-wide">Session Integrity</span>
                        </div>

                        {/* Telemetry rows */}
                        <div className="glass-card rounded-xl p-4 border border-[#21262d] flex flex-col justify-center space-y-3">
                          <div className="flex items-center gap-2 text-xs">
                            <Activity className="w-4 h-4 text-[#00d4ff] flex-shrink-0" />
                            <div>
                              <p className="text-[9px] text-[#8b949e] uppercase font-bold tracking-wider">Test Name</p>
                              <p className="font-semibold text-white truncate max-w-[120px]">{sessionDetails.assessment?.title || 'Coding Test'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                            <div>
                              <p className="text-[9px] text-[#8b949e] uppercase font-bold tracking-wider">Time Active</p>
                              <p className="font-semibold text-white">
                                {new Date(sessionDetails.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Started)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Violation Logs (High Contrast Red Zone indicator) */}
                    <div className="space-y-4 flex flex-col h-full">
                      {/* Red Zone alert banner */}
                      {(sessionDetails.integrityScore < 80 || sessionDetails.violations?.length >= 2) && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                          <ShieldAlert className="w-6 h-6 flex-shrink-0 text-red-500 animate-bounce" />
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wide">Red Zone Proctor Alert</h4>
                            <p className="text-[11px] text-red-300 mt-0.5">Critical anomalies or low integrity score logged. Disqualification recommended.</p>
                          </div>
                        </div>
                      )}

                      <div className="flex-1 flex flex-col min-h-[300px]">
                        <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-2">Proctoring Infractions Logs</h3>
                        
                        <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] pr-1">
                          {sessionDetails.violations && sessionDetails.violations.length > 0 ? (
                            sessionDetails.violations.map((violation: any) => (
                              <div key={violation.id} className="p-3 bg-[#0d1117] border border-[#21262d] hover:border-red-500/30 rounded-lg flex flex-col gap-1.5 transition-colors">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-400">
                                    {violation.type}
                                  </span>
                                  <span className="text-[9px] font-mono text-[#8b949e]">
                                    {new Date(violation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-white leading-relaxed font-medium">{violation.description}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-[#8b949e]">
                                  <AlertTriangle className="w-3 h-3 text-[#f59e0b]" />
                                  <span>Severity: <strong className="text-[#f59e0b]">{violation.severity}</strong></span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-2 border border-dashed border-[#21262d] rounded-xl bg-[#0c0e12]/20">
                              <CheckCircle className="w-8 h-8 text-[#10b981] animate-pulse" />
                              <p className="text-xs text-white font-semibold">Integrity Verified</p>
                              <p className="text-[10px] text-[#8b949e] max-w-xs">No infractions recorded for this session. Candidate is fully complying with test instructions.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer Controls */}
                  <div className="p-4.5 border-t border-[#21262d]/80 bg-[#161b22]/30 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedSessionId(null)}
                      className="px-4 py-2 text-xs font-semibold text-[#8b949e] hover:text-white rounded-lg border border-[#21262d] hover:bg-[#161b22] transition-all"
                    >
                      Close Details
                    </button>
                    
                    <button
                      onClick={() => handleTerminateSession(sessionDetails.id)}
                      disabled={terminatingId === sessionDetails.id}
                      className="px-4 py-2 text-xs font-bold text-white rounded-lg bg-red-600 hover:bg-red-700 active:scale-[0.98] border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)] disabled:opacity-50 flex items-center gap-1.5 transition-all"
                    >
                      {terminatingId === sessionDetails.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Terminating...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          Terminate Exam & Disqualify
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <XCircle className="w-10 h-10 text-red-500" />
                  <p className="text-sm font-semibold text-white">Failed to query session info.</p>
                  <button onClick={() => handleOpenDetails(selectedSessionId)} className="btn-neon text-xs">
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
