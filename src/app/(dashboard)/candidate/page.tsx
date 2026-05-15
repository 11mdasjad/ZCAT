'use client';

import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Code2, FileText, Trophy, BarChart3, Clock, ArrowRight,
  Zap, Target, TrendingUp, Award, Inbox,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { getQuestions, getQuestionStats } from '@/lib/data/questions-data';
import toast from 'react-hot-toast';

const quickActions = [
  { icon: Code2, label: 'Start Coding Challenge', href: '/candidate/challenges', color: '#00d4ff' },
  { icon: FileText, label: 'Take Aptitude Test', href: '/candidate/tests', color: '#a855f7' },
  { icon: Trophy, label: 'View Leaderboard', href: '/candidate/leaderboard', color: '#f59e0b' },
  { icon: BarChart3, label: 'Performance Analytics', href: '/candidate/performance', color: '#10b981' },
];

export default function CandidateDashboard() {
  const { user } = useAuthStore();
  const stats = useMemo(() => getQuestionStats(), []);
  const recentQuestions = useMemo(() => getQuestions({ limit: 3 }).questions, []);

  // Show error toast if redirected from admin panel due to unauthorized access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'unauthorized') {
      toast.error('Access denied. Admin panel requires admin privileges.', { duration: 4000 });
      window.history.replaceState({}, '', '/candidate');
    }
  }, []);

  const summaryCards = [
    { label: 'Available Questions', value: stats.total.toString(), change: `${stats.EASY} easy, ${stats.MEDIUM} medium`, icon: Target, color: '#00d4ff' },
    { label: 'Easy Questions', value: stats.EASY.toString(), change: 'Ready to practice', icon: TrendingUp, color: '#10b981' },
    { label: 'Medium Questions', value: stats.MEDIUM.toString(), change: 'Build your skills', icon: Trophy, color: '#f59e0b' },
    { label: 'Hard Questions', value: stats.HARD.toString(), change: 'Master level', icon: Award, color: '#a855f7' },
  ];

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
        {/* Featured Questions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Start Practicing</h2>
            <Link href="/candidate/challenges" className="text-xs text-[#00d4ff] hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {recentQuestions.length > 0 ? (
            <div className="space-y-3">
              {recentQuestions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="glass-card rounded-xl p-4 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    q.difficulty === 'EASY' ? 'bg-[#10b981]/10 border border-[#10b981]/20' :
                    q.difficulty === 'MEDIUM' ? 'bg-[#f59e0b]/10 border border-[#f59e0b]/20' :
                    'bg-[#ef4444]/10 border border-[#ef4444]/20'
                  }`}>
                    <Code2 className={`w-5 h-5 ${
                      q.difficulty === 'EASY' ? 'text-[#10b981]' :
                      q.difficulty === 'MEDIUM' ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{q.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#484f58] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {q.timeLimit}ms
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        q.difficulty === 'EASY' ? 'bg-[#10b981]/10 text-[#10b981]' :
                        q.difficulty === 'MEDIUM' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                        'bg-[#ef4444]/10 text-[#ef4444]'
                      }`}>
                        {q.difficulty.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <Link href={`/code/${q.id}`} className="btn-neon btn-neon-secondary !py-2 !px-4 text-xs">
                    Solve
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center">
              <Inbox className="w-10 h-10 text-[#484f58] mx-auto mb-3" />
              <p className="text-sm text-[#8b949e]">No questions available yet.</p>
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Platform Overview</h2>
          <div className="glass-card rounded-xl p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#00d4ff]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#e4e8f1] leading-snug">{stats.total} coding challenges available</p>
                <p className="text-xs text-[#484f58] mt-0.5">Practice at your own pace</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#a855f7]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#e4e8f1] leading-snug">Multiple difficulty levels</p>
                <p className="text-xs text-[#484f58] mt-0.5">From easy to hard</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#f59e0b]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#e4e8f1] leading-snug">Built-in code editor</p>
                <p className="text-xs text-[#484f58] mt-0.5">Write and test your solutions</p>
              </div>
            </div>
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
              <Link href={href} className="glass-card rounded-xl p-5 flex flex-col items-center gap-3 text-center group">
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
