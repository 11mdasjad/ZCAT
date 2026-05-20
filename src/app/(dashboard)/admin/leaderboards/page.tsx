'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Shield, PlayCircle, CalendarDays, Users, Search, Filter,
  Link, Link2Off, RefreshCw, Eye, AlertTriangle, CheckCircle, Info, X
} from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import toast from 'react-hot-toast';

interface LeaderboardRecord {
  id: string;
  title: string;
  type: string;
  status: string;
  duration: number;
  leaderboardConnected: boolean;
  leaderboardId: string | null;
  participantsCount: number;
  updatedAt: string | null;
}

interface RankedEntry {
  rank: number;
  score: number;
  timeTaken: number;
  problemsSolved: number;
  user: {
    name: string;
    email: string;
    avatarUrl: string | null;
    sessions?: { integrityScore: number }[];
  };
}

export default function AdminLeaderboardManagementPage() {
  const [leaderboards, setLeaderboards] = useState<LeaderboardRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Slide-over state for viewing a specific leaderboard's live ranks
  const [viewingAssessment, setViewingAssessment] = useState<LeaderboardRecord | null>(null);
  const [viewingEntries, setViewingEntries] = useState<RankedEntry[]>([]);
  const [isEntriesLoading, setIsEntriesLoading] = useState(false);

  // 1. Fetch all assessments with leaderboard details
  const fetchLeaderboards = async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await fetch('/api/v1/leaderboards');
      const data = await res.json();
      if (data.success) {
        setLeaderboards(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboards:', err);
      toast.error('Failed to sync leaderboard list');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboards(true);
  }, []);

  // 2. Toggle leaderboard connection status
  const handleToggleLeaderboard = async (assessmentId: string, currentlyConnected: boolean) => {
    const nextState = !currentlyConnected;
    try {
      setIsSyncing(true);
      const res = await fetch('/api/v1/leaderboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, enabled: nextState }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || 'Leaderboard status updated successfully!');
        // Update local state dynamically
        setLeaderboards((prev) =>
          prev.map((l) =>
            l.id === assessmentId
              ? {
                  ...l,
                  leaderboardConnected: nextState,
                  participantsCount: nextState ? l.participantsCount : 0,
                }
              : l
          )
        );
      } else {
        toast.error(data.error || 'Failed to update leaderboard connection');
      }
    } catch (err) {
      console.error('Failed to toggle connection:', err);
      toast.error('Network error updating connection');
    } finally {
      setIsSyncing(false);
    }
  };

  // 3. Reset leaderboard rankings
  const handleResetLeaderboard = async (assessmentId: string) => {
    if (!confirm('Are you absolutely sure you want to reset this leaderboard? This will wipe all current candidate scores and rankings!')) {
      return;
    }

    try {
      setIsSyncing(true);
      const res = await fetch(`/api/v1/leaderboards/${assessmentId}/reset`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Leaderboard rankings reset successfully!');
        // Reset count locally
        setLeaderboards((prev) =>
          prev.map((l) => (l.id === assessmentId ? { ...l, participantsCount: 0 } : l))
        );
        if (viewingAssessment?.id === assessmentId) {
          setViewingEntries([]);
        }
      } else {
        toast.error(data.error || 'Failed to reset leaderboard');
      }
    } catch (err) {
      console.error('Failed to reset leaderboard:', err);
      toast.error('Error resetting leaderboard rankings');
    } finally {
      setIsSyncing(false);
    }
  };

  // 4. View live rankings slide-over
  const handleViewRankings = async (record: LeaderboardRecord) => {
    setViewingAssessment(record);
    setIsEntriesLoading(true);
    setViewingEntries([]);

    try {
      const res = await fetch(`/api/v1/leaderboards/${record.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setViewingEntries(data.data.entries || []);
      }
    } catch (err) {
      console.error('Failed to fetch ranks:', err);
      toast.error('Failed to load active rankings');
    } finally {
      setIsEntriesLoading(false);
    }
  };

  // Filter listings based on searches
  const filteredLeaderboards = leaderboards.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || l.type === typeFilter.toUpperCase();
    return matchesSearch && matchesType;
  });

  // Dynamic Dashboard Stats
  const connectedCount = leaderboards.filter((l) => l.leaderboardConnected).length;
  const totalCompetitors = leaderboards.reduce((acc, l) => acc + (l.leaderboardConnected ? l.participantsCount : 0), 0);
  const liveCount = leaderboards.filter((l) => l.status === 'LIVE').length;

  const stats = [
    { label: 'Connected Leaderboards', value: connectedCount, icon: Trophy, color: '#3b82f6' },
    { label: 'Active Competitors', value: totalCompetitors, icon: Users, color: '#10b981' },
    { label: 'Live Assessment Sessions', value: liveCount, icon: PlayCircle, color: '#f59e0b' },
    { label: 'Total Assessments Checked', value: leaderboards.length, icon: CalendarDays, color: '#7c3aed' },
  ];

  if (isLoading) {
    return <ZCATLoader message="Loading Recruiters Leaderboards Dashboard..." fullScreen />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#00d4ff]" /> Leaderboard Management
          </h1>
          <p className="text-sm text-[#8b949e] mt-1">
            Connect dynamic scoring tables, monitor candidates in real time, and reset exam ranking sheets.
          </p>
        </div>
        <button
          onClick={() => fetchLeaderboards(true)}
          disabled={isSyncing}
          className="btn-neon btn-neon-secondary flex items-center gap-2 self-start md:self-auto py-2 px-4"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync Dashboard
        </button>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5 rounded-xl flex items-center gap-4 border border-[#21262d]"
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[#8b949e] font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Settings Panel */}
      <div className="glass-strong rounded-xl border border-[#21262d] overflow-hidden flex flex-col">
        {/* Toolbars */}
        <div className="p-4 border-b border-[#21262d] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161b22]/50">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363d] self-start md:self-auto">
            {['All', 'Coding', 'Aptitude', 'MCQ', 'Interview'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTypeFilter(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  typeFilter === tab
                    ? 'bg-[#21262d] text-white shadow-sm'
                    : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]" />
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-4 py-1.5 text-sm text-[#e4e8f1] placeholder:text-[#8b949e] focus:border-[#00d4ff]/50 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Table listings */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#21262d] text-xs uppercase text-[#8b949e] bg-[#0d1117]/80">
                <th className="px-6 py-4 font-semibold">Assessment Title</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Connection Status</th>
                <th className="px-6 py-4 font-semibold">Active Participants</th>
                <th className="px-6 py-4 font-semibold">Exam Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {filteredLeaderboards.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white text-sm">{row.title}</div>
                    <div className="text-xs text-[#8b949e] mt-1">Duration: {row.duration} mins</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#c9d1d9]">{row.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    {row.leaderboardConnected ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold border bg-[#10b981]/15 text-[#10b981] border-[#10b981]/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold border bg-white/[0.03] text-[#8b949e] border-[#21262d]">
                        Offline
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#c9d1d9]">
                    {row.leaderboardConnected ? (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#8b949e]" />
                        <span>{row.participantsCount} candidates</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#484f58]">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        row.status === 'LIVE'
                          ? 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/25'
                          : row.status === 'SCHEDULED'
                          ? 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/25'
                          : row.status === 'DRAFT'
                          ? 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/25'
                          : 'bg-[#8b949e]/15 text-[#8b949e] border-[#8b949e]/25'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      {/* Connection Toggle Action */}
                      <button
                        onClick={() => handleToggleLeaderboard(row.id, row.leaderboardConnected)}
                        disabled={isSyncing}
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          row.leaderboardConnected
                            ? 'border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10'
                            : 'border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/10'
                        }`}
                        title={row.leaderboardConnected ? 'Disconnect Leaderboard' : 'Link Leaderboard'}
                      >
                        {row.leaderboardConnected ? (
                          <>
                            <Link2Off className="w-4 h-4" /> Disconnect
                          </>
                        ) : (
                          <>
                            <Link className="w-4 h-4" /> Connect
                          </>
                        )}
                      </button>

                      {row.leaderboardConnected && (
                        <>
                          {/* View Live Leaderboard */}
                          <button
                            onClick={() => handleViewRankings(row)}
                            className="p-1.5 text-[#8b949e] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 border border-[#30363d] rounded-lg transition-colors"
                            title="Monitor Ranks"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </button>

                          {/* Reset Rankings */}
                          <button
                            onClick={() => handleResetLeaderboard(row.id)}
                            className="p-1.5 text-[#8b949e] hover:text-[#ef4444] hover:bg-[#ef4444]/10 border border-[#30363d] rounded-lg transition-colors"
                            title="Reset Rankings"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLeaderboards.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#8b949e]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertTriangle className="w-8 h-8 text-[#f59e0b]/40" />
                      <p>No exams found matching filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rankings Visual Panel Modal (Slide-over right side) */}
      <AnimatePresence>
        {viewingAssessment && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingAssessment(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-xl h-full bg-[#0d1117] border-l border-[#21262d] shadow-2xl relative z-10 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#21262d] flex items-center justify-between bg-[#161b22]/40">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#f59e0b]" /> Rankings Monitor
                  </h3>
                  <p className="text-xs text-[#8b949e] mt-1 max-w-sm truncate">
                    {viewingAssessment.title}
                  </p>
                </div>
                <button
                  onClick={() => setViewingAssessment(null)}
                  className="p-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contest details stats strip */}
              <div className="p-4 bg-[#161b22]/20 border-b border-[#21262d] grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-[#8b949e]">Registered</div>
                  <div className="text-white font-bold mt-1 text-sm">{viewingEntries.length} candidates</div>
                </div>
                <div>
                  <div className="text-[#8b949e]">Score Increment</div>
                  <div className="text-yellow-400 font-bold mt-1 text-sm">+4 pts / Q</div>
                </div>
                <div>
                  <div className="text-[#8b949e]">Type</div>
                  <div className="text-[#00d4ff] font-bold mt-1 text-sm">{viewingAssessment.type}</div>
                </div>
              </div>

              {/* Ranks list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isEntriesLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#00d4ff]/25 border-t-[#00d4ff] rounded-full animate-spin" />
                      <span className="text-xs text-[#8b949e]">Synchronizing rankings...</span>
                    </div>
                  </div>
                ) : viewingEntries.length > 0 ? (
                  <div className="space-y-3">
                    {viewingEntries.map((row) => {
                      const integrityScore = row.user.sessions?.[0]?.integrityScore ?? 100;
                      return (
                      <div
                        key={row.user.email}
                        className="glass-card p-4 rounded-xl flex items-center justify-between border border-[#21262d] hover:border-[#30363d] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                              row.rank === 1
                                ? 'bg-yellow-400 text-slate-900'
                                : row.rank === 2
                                ? 'bg-slate-300 text-slate-800'
                                : row.rank === 3
                                ? 'bg-amber-600 text-white'
                                : 'bg-[#161b22] text-[#8b949e]'
                            }`}
                          >
                            {row.rank}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-white">{row.user.name}</div>
                            <div className="text-[10px] text-[#8b949e] flex items-center gap-2 mt-1">
                              {row.user.email}
                              <span className={`px-1.5 py-0.5 rounded font-medium flex items-center gap-1 border ${
                                integrityScore >= 90 ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 
                                integrityScore >= 70 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'
                              }`}>
                                <Shield className="w-2.5 h-2.5" />
                                {integrityScore}% Integrity
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-white">{row.score} pts</div>
                          <div className="text-[10px] text-[#8b949e] mt-0.5">
                            {row.problemsSolved} Solved | {Math.floor(row.timeTaken / 60)}m {row.timeTaken % 60}s
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-[#8b949e] gap-3">
                    <Users className="w-10 h-10 text-[#484f58]" />
                    <p className="text-sm max-w-xs">
                      No candidates are active on this leaderboard yet. They will appear here immediately once they log in and begin!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
