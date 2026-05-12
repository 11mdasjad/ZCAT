'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Code2, FileText, Trophy, BarChart3, Clock, ArrowRight,
  Zap, Target, TrendingUp, Award,
} from 'lucide-react';
import { mockExams } from '@/lib/data/mock-exams';
import { mockRecentActivity } from '@/lib/data/mock-analytics';

const quickActions = [
  { icon: Code2, label: 'Start Coding Challenge', href: '/candidate/challenges', color: '#00d4ff' },
  { icon: FileText, label: 'Take Aptitude Test', href: '/candidate/tests', color: '#a855f7' },
  { icon: Trophy, label: 'View Leaderboard', href: '/candidate/leaderboard', color: '#f59e0b' },
  { icon: BarChart3, label: 'Performance Analytics', href: '/candidate/performance', color: '#10b981' },
];

const summaryCards = [
  { label: 'Tests Completed', value: '24', change: '+3 this week', icon: Target, color: '#00d4ff' },
  { label: 'Average Score', value: '85.4%', change: '+2.1%', icon: TrendingUp, color: '#10b981' },
  { label: 'Global Rank', value: '#42', change: '↑ 5 positions', icon: Trophy, color: '#f59e0b' },
  { label: 'Certificates', value: '6', change: '+1 new', icon: Award, color: '#a855f7' },
];

const activityIcons: Record<string, string> = {
  coding: '#00d4ff',
  test: '#a855f7',
  achievement: '#f59e0b',
  contest: '#ec4899',
};

import { useAuthStore } from '@/lib/store/auth-store';

export default function CandidateDashboard() {
  const { user } = useAuthStore();
  
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, <span className="gradient-text">{user?.name ? user.name.split(' ')[0] : 'User'}</span> 👋</h1>
          <p className="text-sm text-[#8b949e] mt-1">Here&apos;s your assessment overview for today.</p>
        </div>
        <Link href="/candidate/challenges" className="btn-neon btn-neon-primary flex items-center gap-2 text-sm self-start">
          <Zap className="w-4 h-4" /> Start New Challenge
        </Link>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, change, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-[#8b949e] mt-1">{label}</div>
            <div className="text-xs mt-1" style={{ color }}>{change}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Exams */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Upcoming Assessments</h2>
            <Link href="/candidate/tests" className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {mockExams.slice(0, 3).map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="glass-card rounded-xl p-4 flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  exam.type === 'coding' ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/20' :
                  exam.type === 'aptitude' ? 'bg-[#a855f7]/10 border border-[#a855f7]/20' :
                  'bg-[#f59e0b]/10 border border-[#f59e0b]/20'
                }`}>
                  {exam.type === 'coding' ? <Code2 className="w-5 h-5 text-[#00d4ff]" /> :
                   exam.type === 'aptitude' ? <FileText className="w-5 h-5 text-[#a855f7]" /> :
                   <Zap className="w-5 h-5 text-[#f59e0b]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{exam.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[#484f58] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {exam.duration} min
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      exam.difficulty === 'easy' ? 'bg-[#10b981]/10 text-[#10b981]' :
                      exam.difficulty === 'medium' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                      'bg-[#ef4444]/10 text-[#ef4444]'
                    }`}>
                      {exam.difficulty}
                    </span>
                  </div>
                </div>
                <Link href={`/code/${exam.id}`} className="btn-neon btn-neon-secondary !py-2 !px-4 text-xs">
                  Start
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="glass-card rounded-xl p-4 space-y-4">
            {mockRecentActivity.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: activityIcons[activity.type] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#e4e8f1] leading-snug">{activity.action}</p>
                  <p className="text-xs text-[#484f58] mt-0.5">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ icon: Icon, label, href, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Link href={href} className="glass-card rounded-xl p-5 flex flex-col items-center gap-3 text-center group hover:border-[color]/20">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="text-sm font-medium text-[#8b949e] group-hover:text-white transition-colors">{label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
