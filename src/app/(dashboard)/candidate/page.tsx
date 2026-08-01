'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Code2, FileText, Trophy, BarChart3, Clock, ArrowRight,
  Zap, Target, TrendingUp, Award, Inbox,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import toast from 'react-hot-toast';

const quickActions = [
  { icon: Code2, label: 'Start Coding Challenge', href: '/candidate/challenges', color: '#0284c7' },
  { icon: FileText, label: 'Take Aptitude Test', href: '/candidate/tests', color: '#7c3aed' },
  { icon: Trophy, label: 'View Leaderboard', href: '/candidate/leaderboard', color: '#d97706' },
  { icon: BarChart3, label: 'Performance Analytics', href: '/candidate/performance', color: '#059669' },
];

export default function CandidateDashboard() {
  const { user } = useAuthStore();
  
  const [stats, setStats] = useState({ EASY: 0, MEDIUM: 0, HARD: 0, total: 0 });
  const [recentQuestions, setRecentQuestions] = useState<any[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'unauthorized') {
      toast.error('Access denied. Admin panel requires admin privileges.', { duration: 4000 });
      window.history.replaceState({}, '', '/candidate');
    }
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const statsRes = await fetch('/api/v1/questions/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success && statsData.data && statsData.data.stats) {
            const s = { EASY: 0, MEDIUM: 0, HARD: 0, total: 0 };
            statsData.data.stats.forEach((item: any) => {
              if (item.difficulty === 'EASY') s.EASY = item.count;
              if (item.difficulty === 'MEDIUM') s.MEDIUM = item.count;
              if (item.difficulty === 'HARD') s.HARD = item.count;
            });
            s.total = s.EASY + s.MEDIUM + s.HARD;
            setStats(s);
          }
        }

        const questionsRes = await fetch('/api/v1/questions?limit=3');
        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          if (questionsData.success && questionsData.data) {
            setRecentQuestions(questionsData.data.questions || []);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    }
    loadDashboardData();
  }, []);

  const summaryCards = useMemo(() => [
    { label: 'Available Questions', value: stats.total.toString(), change: `${stats.EASY} easy, ${stats.MEDIUM} medium`, icon: Target, color: '#0284c7' },
    { label: 'Easy Questions', value: stats.EASY.toString(), change: 'Ready to practice', icon: TrendingUp, color: '#059669' },
    { label: 'Medium Questions', value: stats.MEDIUM.toString(), change: 'Build your skills', icon: Trophy, color: '#d97706' },
    { label: 'Hard Questions', value: stats.HARD.toString(), change: 'Master level', icon: Award, color: '#7c3aed' },
  ], [stats]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Welcome back, <span className="gradient-text">{user?.name ? user.name.split(' ')[0] : 'User'}</span> 👋</h1>
          <p className="text-sm text-[#64748b] mt-1 font-medium">Here&apos;s your assessment overview for today.</p>
        </div>
        <Link href="/candidate/challenges" className="btn-neon btn-neon-primary flex items-center gap-2 text-sm self-start font-semibold cursor-pointer shadow-md">
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
            className="glass-card rounded-xl p-5 border border-[#e2e8f0] bg-white shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0f172a]">{value}</div>
            <div className="text-xs font-semibold text-[#64748b] mt-1">{label}</div>
            <div className="text-xs font-semibold mt-1" style={{ color }}>{change}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Featured Questions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0f172a]">Start Practicing</h2>
            <Link href="/candidate/challenges" className="text-xs text-[#2563eb] font-semibold hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {recentQuestions.length > 0 ? (
            <div className="space-y-3">
              {recentQuestions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="glass-card rounded-xl p-4 flex items-center gap-4 border border-[#e2e8f0] bg-white shadow-xs"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    q.difficulty === 'EASY' ? 'bg-emerald-50 border border-emerald-200' :
                    q.difficulty === 'MEDIUM' ? 'bg-amber-50 border border-amber-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <Code2 className={`w-5 h-5 ${
                      q.difficulty === 'EASY' ? 'text-[#059669]' :
                      q.difficulty === 'MEDIUM' ? 'text-[#d97706]' : 'text-[#dc2626]'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-[#0f172a] truncate">{q.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#64748b] flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" /> {q.timeLimit}ms
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        q.difficulty === 'EASY' ? 'bg-emerald-50 text-[#059669]' :
                        q.difficulty === 'MEDIUM' ? 'bg-amber-50 text-[#d97706]' :
                        'bg-red-50 text-[#dc2626]'
                      }`}>
                        {q.difficulty.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <Link href={`/code/${q.id}`} className="btn-neon btn-neon-secondary !py-2 !px-4 text-xs font-semibold">
                    Solve
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center border border-[#e2e8f0] bg-white shadow-xs">
              <Inbox className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
              <p className="text-sm text-[#64748b]">No questions available yet.</p>
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div>
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">Platform Overview</h2>
          <div className="glass-card rounded-xl p-4 space-y-4 border border-[#e2e8f0] bg-white shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#0284c7]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0f172a] leading-snug">{stats.total} coding challenges available</p>
                <p className="text-xs text-[#64748b] mt-0.5">Practice at your own pace</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#7c3aed]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0f172a] leading-snug">Multiple difficulty levels</p>
                <p className="text-xs text-[#64748b] mt-0.5">From easy to hard</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#d97706]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0f172a] leading-snug">Built-in code editor</p>
                <p className="text-xs text-[#64748b] mt-0.5">Write and test your solutions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-[#0f172a] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ icon: Icon, label, href, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Link href={href} className="glass-card rounded-xl p-5 flex flex-col items-center gap-3 text-center group border border-[#e2e8f0] bg-white shadow-xs hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="text-sm font-semibold text-[#64748b] group-hover:text-[#0f172a] transition-colors">{label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
