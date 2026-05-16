'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FileText, AlertTriangle, Trophy, TrendingUp, ArrowRight, Eye,
  Database, Megaphone, BarChart3, PlusCircle, Settings, Send, Loader2,
  Code2, Shield, Clock, Activity, Zap, ChevronRight,
} from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/auth-store';

interface DashboardStats {
  kpis: {
    totalCandidates: { value: number; change: string };
    activeExams: { value: number; change: string };
    violations: { value: number; change: string };
    topScore: { value: string; change: string };
  };
  recentUsers: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    emailVerified: boolean;
  }>;
  assessmentActivity: Array<{ date: string; count: number }>;
  skillDistribution: Array<{ name: string; value: number }>;
  recentAssessments: Array<{
    id: string;
    name: string;
    status: string;
    candidates: number;
    progress: number;
  }>;
}

const skillColors = ['#00d4ff', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];

const quickActions = [
  { label: 'Create Assessment', desc: 'Build a new exam', icon: PlusCircle, href: '/admin/assessments/create', color: '#0066ff', gradient: 'from-[#0066ff] to-[#00d4ff]' },
  { label: 'Question Bank', desc: 'Manage questions', icon: Database, href: '/admin/questions', color: '#a855f7', gradient: 'from-[#a855f7] to-[#ec4899]' },
  { label: 'Broadcast Alert', desc: 'Notify all users', icon: Megaphone, href: '/admin/broadcast', color: '#f59e0b', gradient: 'from-[#f59e0b] to-[#ef4444]' },
  { label: 'Live Monitoring', desc: 'Watch active exams', icon: Eye, href: '/admin/monitoring', color: '#10b981', gradient: 'from-[#10b981] to-[#00d4ff]' },
  { label: 'Analytics', desc: 'View insights', icon: BarChart3, href: '/admin/analytics', color: '#ec4899', gradient: 'from-[#ec4899] to-[#a855f7]' },
  { label: 'Settings', desc: 'Platform config', icon: Settings, href: '/admin/settings', color: '#8b949e', gradient: 'from-[#484f58] to-[#8b949e]' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  // Quick Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/stats');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleQuickBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setBroadcasting(true);
    try {
      const res = await fetch('/api/v1/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: broadcastTitle, message: broadcastMsg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      toast.success(`Broadcast sent to ${data.data.sentCount} users!`);
      setBroadcastTitle('');
      setBroadcastMsg('');
    } catch (err: any) {
      toast.error(err.message || 'Broadcast failed');
    } finally {
      setBroadcasting(false);
    }
  };

  if (loading) {
    return <ZCATLoader message="Loading admin dashboard..." fullScreen />;
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-[#ef4444] mx-auto mb-4" />
          <p className="text-sm text-[#8b949e]">Failed to load dashboard data</p>
          <button onClick={fetchDashboardStats} className="btn-neon btn-neon-primary text-sm mt-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Total Candidates', value: stats.kpis.totalCandidates.value.toLocaleString(), change: stats.kpis.totalCandidates.change, icon: Users, color: '#00d4ff' },
    { label: 'Active Exams', value: stats.kpis.activeExams.value.toString(), change: stats.kpis.activeExams.change, icon: FileText, color: '#a855f7' },
    { label: 'Violations', value: stats.kpis.violations.value.toString(), change: stats.kpis.violations.change, icon: AlertTriangle, color: '#ef4444' },
    { label: 'Top Score', value: stats.kpis.topScore.value, change: stats.kpis.topScore.change, icon: Trophy, color: '#f59e0b' },
  ];

  const assessmentData = stats.assessmentActivity.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    candidates: item.count,
    completed: Math.floor(item.count * 0.85),
  }));

  const skillPieData = stats.skillDistribution.map((skill, index) => ({
    ...skill,
    color: skillColors[index % skillColors.length],
  }));

  return (
    <div className="space-y-8">
      {/* ═══ Welcome Banner ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[#21262d] bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0066ff] rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#7c3aed] rounded-full blur-[120px]" />
        </div>
        <div className="relative px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Admin Command Center
            </h1>
            <p className="text-[#8b949e] mt-2 max-w-lg">
              Welcome back, <span className="text-[#00d4ff] font-medium">{user?.name?.split(' ')[0] || 'Admin'}</span>. Manage assessments, monitor exams, and oversee the entire platform from here.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/assessments/create" className="btn-neon btn-neon-primary text-sm flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Create Assessment
            </Link>
            <Link href="/admin/candidates" className="btn-neon btn-neon-secondary text-sm flex items-center gap-2">
              <Users className="w-4 h-4" /> Manage Users
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ═══ KPI Cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, change, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-5 group hover:border-[#30363d] transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color }}>
                <TrendingUp className="w-3 h-3" />
                <span>{change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-[#8b949e] mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* ═══ Quick Actions Grid ═══ */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#f59e0b]" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map(({ label, desc, icon: Icon, href, color, gradient }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <Link href={href}
                className="glass-card rounded-xl p-4 flex flex-col items-center gap-3 text-center group hover:border-[#30363d] transition-all h-full"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-[10px] text-[#484f58] mt-0.5">{desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══ Charts Row ═══ */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Assessment Activity Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00d4ff]" /> Assessment Activity
            </h3>
            <Link href="/admin/analytics" className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1">
              Full Analytics <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={assessmentData}>
              <defs>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="date" tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={{ stroke: '#21262d' }} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={{ stroke: '#21262d' }} />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '8px', color: '#e4e8f1' }} />
              <Area type="monotone" dataKey="candidates" stroke="#00d4ff" fill="url(#gradBlue)" strokeWidth={2} />
              <Area type="monotone" dataKey="completed" stroke="#a855f7" fill="url(#gradPurple)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Skill Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Skill Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={skillPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {skillPieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '8px', color: '#e4e8f1' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {skillPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-[#8b949e]">{item.name}</span>
                </div>
                <span className="text-white font-medium">{item.value}</span>
              </div>
            ))}
            {skillPieData.length === 0 && (
              <div className="text-center py-4">
                <p className="text-xs text-[#8b949e]">No skill data yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ═══ Quick Broadcast + Recent Assessments ═══ */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Broadcast */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#f59e0b]" /> Quick Broadcast
          </h3>
          <p className="text-xs text-[#484f58] mb-4">Send a system-wide notification to all users instantly.</p>
          <div className="space-y-3">
            <input
              type="text"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="Alert title..."
              className="input-neon w-full text-sm"
              maxLength={100}
            />
            <textarea
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              placeholder="Write your message..."
              rows={3}
              className="input-neon w-full text-sm resize-none"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#484f58]">{broadcastMsg.length}/500</span>
              <button
                onClick={handleQuickBroadcast}
                disabled={broadcasting || !broadcastTitle.trim() || !broadcastMsg.trim()}
                className="btn-neon btn-neon-primary !py-2 !px-4 text-sm flex items-center gap-2 disabled:opacity-40"
              >
                {broadcasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {broadcasting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Recent Assessments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#a855f7]" /> Recent Assessments
            </h3>
            <Link href="/admin/monitoring" className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentAssessments.length > 0 ? (
              stats.recentAssessments.map((exam) => (
                <div key={exam.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#161b22]/30 border border-[#21262d]/50 hover:border-[#30363d] transition-colors">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{exam.name}</h4>
                    <p className="text-xs text-[#484f58]">{exam.candidates} candidates</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1.5 bg-[#161b22] rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#0066ff] to-[#7c3aed]" style={{ width: `${exam.progress}%` }} />
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      exam.status === 'live' ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' :
                      exam.status === 'completed' ? 'bg-[#484f58]/10 text-[#8b949e] border border-[#484f58]/20' :
                      'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20'
                    }`}>{exam.status}</span>
                  </div>
                  <Link href={`/admin/monitoring?assessment=${exam.id}`} className="p-2 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/[0.06] transition-all">
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-[#484f58] mx-auto mb-2" />
                <p className="text-sm text-[#8b949e]">No assessments yet</p>
                <Link href="/admin/assessments/create" className="text-xs text-[#00d4ff] hover:underline mt-2 inline-block">Create your first</Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ═══ Recent Users ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00d4ff]" /> Recent Users
          </h3>
          <Link href="/admin/candidates" className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1">
            Manage All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-[#8b949e] border-b border-[#21262d]">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((u) => (
                  <tr key={u.id} className="text-sm border-b border-[#21262d]/50 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 text-white font-medium">{u.name}</td>
                    <td className="py-3 text-[#8b949e]">{u.email}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        u.role === 'CANDIDATE' ? 'bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20' :
                        u.role === 'RECRUITER' ? 'bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20' :
                        'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-[#8b949e]">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3">
                      {u.emailVerified ? (
                        <span className="text-xs text-[#10b981] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Verified
                        </span>
                      ) : (
                        <span className="text-xs text-[#f59e0b] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <Users className="w-8 h-8 text-[#484f58] mx-auto mb-2" />
                    <p className="text-sm text-[#8b949e]">No users yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ═══ Platform Info Footer ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Platform', value: 'ZCAT v2.0', icon: Shield, color: '#00d4ff' },
          { label: 'Database', value: 'Connected', icon: Database, color: '#10b981' },
          { label: 'Uptime', value: '99.9%', icon: Activity, color: '#a855f7' },
          { label: 'Last Refresh', value: new Date().toLocaleTimeString(), icon: Clock, color: '#f59e0b' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-[#484f58]">{label}</p>
              <p className="text-sm font-medium text-white">{value}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
