'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, AlertTriangle, Trophy, TrendingUp, ArrowRight, Eye } from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';
import toast from 'react-hot-toast';

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Transform assessment activity data for chart
  const assessmentData = stats.assessmentActivity.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    candidates: item.count,
    completed: Math.floor(item.count * 0.85), // Estimate completed
  }));

  // Add colors to skill distribution
  const skillPieData = stats.skillDistribution.map((skill, index) => ({
    ...skill,
    color: skillColors[index % skillColors.length],
  }));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-[#8b949e] mt-1">Overview of platform activity and assessments.</p>
        </div>
        <Link href="/admin/assessments/create" className="btn-neon btn-neon-primary text-sm flex items-center gap-2">
          Create Assessment <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, change, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <TrendingUp className="w-4 h-4 text-[#10b981]" />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-[#8b949e] mt-1">{label}</div>
            <div className="text-xs mt-1" style={{ color }}>{change}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Assessment Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Assessment Activity</h3>
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

      {/* Recent Exams */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Assessments</h3>
          <Link href="/admin/monitoring" className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {stats.recentAssessments.length > 0 ? (
            stats.recentAssessments.map((exam) => (
              <div key={exam.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#161b22]/30 border border-[#21262d]/50">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">{exam.name}</h4>
                  <p className="text-xs text-[#484f58]">{exam.candidates} candidates</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-[#161b22] rounded-full overflow-hidden hidden sm:block">
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
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Users */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Users</h3>
          <Link href="/admin/candidates" className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
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
                stats.recentUsers.map((user) => (
                  <tr key={user.id} className="text-sm border-b border-[#21262d]/50 last:border-0">
                    <td className="py-3 text-white">{user.name}</td>
                    <td className="py-3 text-[#8b949e]">{user.email}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.role === 'CANDIDATE' ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20' :
                        user.role === 'RECRUITER' ? 'bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20' :
                        'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 text-[#8b949e]">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3">
                      {user.emailVerified ? (
                        <span className="text-xs text-[#10b981]">✓ Verified</span>
                      ) : (
                        <span className="text-xs text-[#f59e0b]">Pending</span>
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
    </div>
  );
}
