'use client';

import { motion } from 'framer-motion';
import { Users, FileText, AlertTriangle, Trophy, TrendingUp, Activity, ArrowRight, Eye } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

const kpiCards = [
  { label: 'Total Candidates', value: '12,847', change: '+324 this week', icon: Users, color: '#00d4ff' },
  { label: 'Active Exams', value: '23', change: '5 starting today', icon: FileText, color: '#a855f7' },
  { label: 'Violations', value: '47', change: '-12% vs last week', icon: AlertTriangle, color: '#ef4444' },
  { label: 'Top Score', value: '98.5%', change: 'Rahul Kumar', icon: Trophy, color: '#f59e0b' },
];

const assessmentData = [
  { date: 'Mon', candidates: 120, completed: 95 },
  { date: 'Tue', candidates: 180, completed: 150 },
  { date: 'Wed', candidates: 250, completed: 210 },
  { date: 'Thu', candidates: 200, completed: 175 },
  { date: 'Fri', candidates: 310, completed: 280 },
  { date: 'Sat', candidates: 150, completed: 130 },
  { date: 'Sun', candidates: 90, completed: 78 },
];

const skillPieData = [
  { name: 'Frontend', value: 35, color: '#00d4ff' },
  { name: 'Backend', value: 28, color: '#a855f7' },
  { name: 'Data Science', value: 20, color: '#ec4899' },
  { name: 'DevOps', value: 10, color: '#10b981' },
  { name: 'Mobile', value: 7, color: '#f59e0b' },
];

const recentExams = [
  { name: 'Full Stack Assessment', candidates: 245, status: 'live', progress: 68 },
  { name: 'Python Challenge', candidates: 180, status: 'completed', progress: 100 },
  { name: 'Campus Hiring Round 1', candidates: 520, status: 'scheduled', progress: 0 },
  { name: 'AI/ML Interview', candidates: 75, status: 'live', progress: 42 },
];

export default function AdminDashboard() {
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
                <span className="text-white font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Exams */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Exams</h3>
          <Link href="/admin/monitoring" className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {recentExams.map((exam, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#161b22]/30 border border-[#21262d]/50">
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
              <button className="p-2 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/[0.06] transition-all">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
