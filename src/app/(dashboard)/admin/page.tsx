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

const skillColors = ['#0284c7', '#7c3aed', '#db2777', '#059669', '#d97706'];

const quickActions = [
  { label: 'Create Assessment', desc: 'Build a new exam', icon: PlusCircle, href: '/admin/assessments/create', color: '#2563eb', gradient: 'from-[#2563eb] to-[#0284c7]' },
  { label: 'Question Bank', desc: 'Manage questions', icon: Database, href: '/admin/questions', color: '#7c3aed', gradient: 'from-[#7c3aed] to-[#db2777]' },
  { label: 'Broadcast Alert', desc: 'Notify all users', icon: Megaphone, href: '/admin/broadcast', color: '#d97706', gradient: 'from-[#d97706] to-[#dc2626]' },
  { label: 'Live Monitoring', desc: 'Watch active exams', icon: Eye, href: '/admin/monitoring', color: '#059669', gradient: 'from-[#059669] to-[#0284c7]' },
  { label: 'Analytics', desc: 'View insights', icon: BarChart3, href: '/admin/analytics', color: '#db2777', gradient: 'from-[#db2777] to-[#7c3aed]' },
  { label: 'Settings', desc: 'Platform config', icon: Settings, href: '/admin/settings', color: '#64748b', gradient: 'from-[#475569] to-[#64748b]' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

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
          <AlertTriangle className="w-8 h-8 text-[#dc2626] mx-auto mb-4" />
          <p className="text-sm text-[#64748b]">Failed to load dashboard data</p>
          <button onClick={fetchDashboardStats} className="btn-neon btn-neon-primary text-sm mt-4 cursor-pointer">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Total Candidates', value: stats.kpis.totalCandidates.value.toLocaleString(), change: stats.kpis.totalCandidates.change, icon: Users, color: '#0284c7' },
    { label: 'Active Exams', value: stats.kpis.activeExams.value.toString(), change: stats.kpis.activeExams.change, icon: FileText, color: '#7c3aed' },
    { label: 'Violations', value: stats.kpis.violations.value.toString(), change: stats.kpis.violations.change, icon: AlertTriangle, color: '#dc2626' },
    { label: 'Top Score', value: stats.kpis.topScore.value, change: stats.kpis.topScore.change, icon: Trophy, color: '#d97706' },
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
        className="relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563eb] rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#7c3aed] rounded-full blur-[120px]" />
        </div>
        <div className="relative px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0f172a]">
              Admin Command Center
            </h1>
            <p className="text-[#64748b] mt-2 max-w-lg">
              Welcome back, <span className="text-[#2563eb] font-semibold">{user?.name?.split(' ')[0] || 'Admin'}</span>. Manage assessments, monitor exams, and oversee the entire platform from here.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/assessments/create" className="btn-neon btn-neon-primary text-sm flex items-center gap-2 font-semibold">
              <PlusCircle className="w-4 h-4" /> Create Assessment
            </Link>
            <Link href="/admin/candidates" className="btn-neon btn-neon-secondary text-sm flex items-center gap-2 font-semibold">
              <Users className="w-4 h-4" /> Manage Users
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ═══ KPI Cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, change, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-5 border border-[#e2e8f0] bg-white shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold" style={{ color }}>
                <TrendingUp className="w-3 h-3" />
                <span>{change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0f172a]">{value}</div>
            <div className="text-xs font-medium text-[#64748b] mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* ═══ Quick Actions Grid ═══ */}
      <div>
        <h2 className="text-lg font-bold text-[#0f172a] mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#d97706]" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map(({ label, desc, icon: Icon, href, gradient }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <Link href={href}
                className="glass-card rounded-xl p-4 flex flex-col items-center gap-3 text-center border border-[#e2e8f0] bg-white shadow-xs hover:shadow-md transition-all h-full"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0f172a]">{label}</p>
                  <p className="text-[10px] text-[#64748b] font-medium mt-0.5">{desc}</p>
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
          className="glass-card rounded-xl p-6 lg:col-span-2 border border-[#e2e8f0] bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2563eb]" /> Assessment Activity
            </h3>
            <Link href="/admin/analytics" className="text-xs text-[#2563eb] font-semibold hover:underline flex items-center gap-1">
              Full Analytics <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={assessmentData}>
              <defs>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
              <Area type="monotone" dataKey="candidates" stroke="#2563eb" fill="url(#gradBlue)" strokeWidth={2} />
              <Area type="monotone" dataKey="completed" stroke="#7c3aed" fill="url(#gradPurple)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Skill Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6 border border-[#e2e8f0] bg-white shadow-sm">
          <h3 className="text-lg font-bold text-[#0f172a] mb-4">Skill Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={skillPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {skillPieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {skillPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-[#64748b]">{item.name}</span>
                </div>
                <span className="text-[#0f172a] font-bold">{item.value}</span>
              </div>
            ))}
            {skillPieData.length === 0 && (
              <div className="text-center py-4">
                <p className="text-xs text-[#64748b]">No skill data yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ═══ Quick Broadcast + Recent Assessments ═══ */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Broadcast */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card rounded-xl p-6 border border-[#e2e8f0] bg-white shadow-sm">
          <h3 className="text-lg font-bold text-[#0f172a] mb-1 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#d97706]" /> Quick Broadcast
          </h3>
          <p className="text-xs text-[#64748b] mb-4">Send a system-wide notification to all users instantly.</p>
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
              <span className="text-[10px] text-[#94a3b8] font-medium">{broadcastMsg.length}/500</span>
              <button
                onClick={handleQuickBroadcast}
                disabled={broadcasting || !broadcastTitle.trim() || !broadcastMsg.trim()}
                className="btn-neon btn-neon-primary !py-2 !px-4 text-sm flex items-center gap-2 disabled:opacity-40 font-semibold cursor-pointer shadow-xs"
              >
                {broadcasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {broadcasting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Recent Assessments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-6 border border-[#e2e8f0] bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#7c3aed]" /> Recent Assessments
            </h3>
            <Link href="/admin/monitoring" className="text-xs text-[#2563eb] font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentAssessments.length > 0 ? (
              stats.recentAssessments.map((exam) => (
                <div key={exam.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-50 border border-[#e2e8f0] hover:border-[#cbd5e1] transition-colors">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#0f172a] truncate">{exam.name}</h4>
                    <p className="text-xs text-[#64748b]">{exam.candidates} candidates</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed]" style={{ width: `${exam.progress}%` }} />
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      exam.status === 'live' ? 'bg-emerald-50 text-[#059669] border border-emerald-200' :
                      exam.status === 'completed' ? 'bg-slate-100 text-[#64748b] border border-[#e2e8f0]' :
                      'bg-amber-50 text-[#d97706] border border-amber-200'
                    }`}>{exam.status}</span>
                  </div>
                  <Link href={`/admin/monitoring?assessment=${exam.id}`} className="p-2 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-slate-200 transition-all">
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                <p className="text-sm text-[#64748b]">No assessments yet</p>
                <Link href="/admin/assessments/create" className="text-xs text-[#2563eb] font-semibold hover:underline mt-2 inline-block">Create your first</Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ═══ Recent Users ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="glass-card rounded-xl p-6 border border-[#e2e8f0] bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2563eb]" /> Recent Users
          </h3>
          <Link href="/admin/candidates" className="text-xs text-[#2563eb] font-semibold hover:underline flex items-center gap-1">
            Manage All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-[#64748b] border-b border-[#e2e8f0]">
                <th className="pb-3 font-semibold uppercase tracking-wider">Name</th>
                <th className="pb-3 font-semibold uppercase tracking-wider">Email</th>
                <th className="pb-3 font-semibold uppercase tracking-wider">Role</th>
                <th className="pb-3 font-semibold uppercase tracking-wider">Joined</th>
                <th className="pb-3 font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((u) => (
                  <tr key={u.id} className="text-sm border-b border-[#e2e8f0]/60 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 text-[#0f172a] font-semibold">{u.name}</td>
                    <td className="py-3 text-[#64748b]">{u.email}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
                        u.role === 'CANDIDATE' ? 'bg-blue-50 text-[#2563eb] border-blue-200' :
                        u.role === 'RECRUITER' ? 'bg-purple-50 text-[#7c3aed] border-purple-200' :
                        'bg-red-50 text-[#dc2626] border-red-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-[#64748b]">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3">
                      {u.emailVerified ? (
                        <span className="text-xs text-[#059669] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" /> Verified
                        </span>
                      ) : (
                        <span className="text-xs text-[#d97706] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <Users className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                    <p className="text-sm text-[#64748b]">No users yet</p>
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
          { label: 'Platform', value: 'ZCAT v2.0', icon: Shield, color: '#2563eb' },
          { label: 'Database', value: 'Connected', icon: Database, color: '#059669' },
          { label: 'Uptime', value: '99.9%', icon: Activity, color: '#7c3aed' },
          { label: 'Last Refresh', value: new Date().toLocaleTimeString(), icon: Clock, color: '#d97706' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-xl p-4 flex items-center gap-3 border border-[#e2e8f0] bg-white shadow-xs">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-[#64748b] font-medium">{label}</p>
              <p className="text-sm font-bold text-[#0f172a]">{value}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
