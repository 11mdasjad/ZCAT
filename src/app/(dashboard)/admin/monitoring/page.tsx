'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, AlertTriangle, CheckCircle, XCircle, Eye, RefreshCw, Loader2, ShieldAlert } from 'lucide-react';

interface LiveExam {
  id: string | number;
  name: string;
  candidate: string;
  status: string;
  violations: number;
  timeLeft: string;
  integrity: number;
}

export default function MonitoringPage() {
  const [sessions, setSessions] = useState<LiveExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const totalActive = sessions.length;
  const noViolations = sessions.filter((s) => s.violations === 0).length;
  const warnings = sessions.filter((s) => s.status === 'warning').length;
  const flagged = sessions.filter((s) => s.status === 'flagged').length;

  return (
    <div className="space-y-6 animate-fade-in">
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
              className={`glass-card rounded-xl overflow-hidden border border-[#21262d] ${
                exam.status === 'flagged' ? 'border-[#ef4444]/40' : exam.status === 'warning' ? 'border-[#f59e0b]/40' : 'hover:border-[#00d4ff]/20'
              }`}
            >
              {/* Webcam Container */}
              <div className="aspect-video bg-[#0d1117] relative flex items-center justify-center">
                <Camera className="w-8 h-8 text-[#21262d]" />
                
                {/* Status Indicator */}
                <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${
                  exam.status === 'active' ? 'bg-[#10b981]' : exam.status === 'warning' ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'
                } animate-[pulse-glow_2s_ease-in-out_infinite]`} />
                
                {/* Violation Count HUD */}
                {exam.violations > 0 && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#ef4444]/20 border border-[#ef4444]/30">
                    <AlertTriangle className="w-3 h-3 text-[#ef4444]" />
                    <span className="text-[10px] text-[#ef4444] font-bold">{exam.violations}</span>
                  </div>
                )}
                
                {/* Clock Remaining */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/50 text-xs font-mono text-white">
                  {exam.timeLeft}
                </div>
              </div>

              {/* Candidate Info */}
              <div className="p-3">
                <p className="text-sm font-semibold text-white truncate">{exam.candidate}</p>
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
                  <button className="p-1 rounded text-[#8b949e] hover:text-[#00d4ff] transition-colors" title="View Logs">
                    <Eye className="w-4 h-4" />
                  </button>
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
    </div>
  );
}
