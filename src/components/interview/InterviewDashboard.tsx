'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Play, Plus, Clock, Calendar, Star,
  Award, TrendingUp, ChevronRight, FileText,
  Activity, AlertCircle, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

interface InterviewSession {
  id: string;
  title: string;
  duration: number;
  startedAt: string;
  endedAt: string | null;
  overallScore: number | null;
  feedback: string | null;
}

interface DashboardProps {
  onStartNew: () => void;
  onViewReport: (id: string) => void;
}

export default function InterviewDashboard({ onStartNew, onViewReport }: DashboardProps) {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch('/api/v1/interviews');
        if (!response.ok) throw new Error('Failed to load previous sessions');
        const data = await response.json();
        setSessions(data.data || []);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const completedSessions = sessions.filter(s => s.endedAt && s.overallScore !== null);
  const totalInterviews = completedSessions.length;

  const averageScore = totalInterviews > 0
    ? Math.round(completedSessions.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / totalInterviews)
    : 0;

  const chartData = [...completedSessions]
    .reverse()
    .map((s, index) => ({
      name: `Attempt ${index + 1}`,
      Score: s.overallScore || 0,
      role: s.title,
    }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin" />
        <p className="text-sm font-medium text-[#64748b]">Loading your prep dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0f172a] flex items-center gap-3">
            <Brain className="w-8 h-8 text-[#2563eb]" /> AI Interview Arena
          </h1>
          <p className="text-sm font-medium text-[#64748b] mt-1">
            Build career-defining interview skills with natural voice feedback powered by Gemini AI.
          </p>
        </div>
        <button
          onClick={onStartNew}
          className="btn-neon btn-neon-primary flex items-center gap-2 self-start md:self-auto !py-2.5 !px-6 text-sm font-semibold cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" /> Start Mock Session
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-[#dc2626] text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 border border-[#e2e8f0] bg-white shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#2563eb]/5 rounded-full filter blur-2xl" />
          <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Interviews Completed</p>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl font-extrabold text-[#0f172a]">{totalInterviews}</span>
            <span className="text-xs text-[#059669] font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Sessions
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-2 font-medium">Active mock practice sessions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5 border border-[#e2e8f0] bg-white shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#7c3aed]/5 rounded-full filter blur-2xl" />
          <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Average Evaluation Score</p>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl font-extrabold text-[#0f172a]">{averageScore}%</span>
            <span className="text-xs text-[#7c3aed] font-bold flex items-center">
              <Award className="w-3.5 h-3.5 mr-0.5" /> Target 85%+
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-2 font-medium">Aggregated across completed modules</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5 border border-[#e2e8f0] bg-white shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#059669]/5 rounded-full filter blur-2xl" />
          <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Estimated Readiness</p>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl font-extrabold text-[#0f172a]">
              {averageScore > 85 ? 'HIGH' : averageScore > 65 ? 'MEDIUM' : 'STARTING'}
            </span>
            <span className="text-xs text-[#059669] font-bold flex items-center">
              <Activity className="w-3.5 h-3.5 mr-0.5" /> Live Pace
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-2 font-medium">Calculated from communication profiles</p>
        </motion.div>
      </div>

      {/* Analytics Chart & Callout */}
      {totalInterviews > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-5 lg:col-span-2 space-y-4 border border-[#e2e8f0] bg-white shadow-sm"
          >
            <h3 className="text-lg font-bold text-[#0f172a]">Performance Progress</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#0f172a',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                    labelStyle={{ color: '#64748b', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Score"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#scoreColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-6 bg-slate-50 flex flex-col justify-between border-l-4 border-l-[#2563eb] border border-[#e2e8f0] shadow-sm"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#2563eb]/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-[#2563eb]" />
              </div>
              <h4 className="text-xl font-bold text-[#0f172a]">Smart AI Evaluation</h4>
              <p className="text-sm text-[#64748b] leading-relaxed">
                Gemini automatically scores your answers based on tech accuracy, verbal confidence, logic structuring, and STAR principles. It reviews filler word pacing in real-time.
              </p>
            </div>
            <button
              onClick={onStartNew}
              className="w-full btn-neon btn-neon-secondary flex items-center justify-center gap-2 mt-6 !py-2.5 font-semibold cursor-pointer"
            >
              <Play className="w-4 h-4" /> Start New Simulation
            </button>
          </motion.div>
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-2xl p-12 text-center flex flex-col items-center max-w-2xl mx-auto space-y-6 border border-[#e2e8f0] bg-white shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2563eb]/10 to-[#7c3aed]/10 flex items-center justify-center border border-[#2563eb]/20">
            <Brain className="w-8 h-8 text-[#2563eb] animate-pulse-glow" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#0f172a]">No Mock Interviews Recorded</h3>
            <p className="text-sm text-[#64748b] max-w-md mx-auto">
              Simulate actual placement rounds. Speak naturally using your mic and get immediate feedback on structure, vocabulary, and technical depths.
            </p>
          </div>
          <button
            onClick={onStartNew}
            className="btn-neon btn-neon-primary flex items-center gap-2 !py-2.5 !px-8 text-sm font-semibold cursor-pointer shadow-md"
          >
            <Play className="w-4 h-4" /> Start First Interview
          </button>
        </motion.div>
      )}

      {/* Sessions History List */}
      {completedSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#64748b]" /> Previous Performance History
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedSessions.map((session) => (
              <motion.div
                key={session.id}
                whileHover={{ scale: 1.01 }}
                className="glass-card rounded-xl p-4 flex items-center justify-between border border-[#e2e8f0] bg-white shadow-xs hover:border-[#2563eb] transition-all cursor-pointer"
                onClick={() => onViewReport(session.id)}
              >
                <div className="space-y-1.5">
                  <h4 className="font-bold text-[#0f172a] text-sm">{session.title}</h4>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#64748b] font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(session.startedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.duration} mins
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-[#64748b] block font-semibold">Evaluation</span>
                    <span className="font-extrabold text-[#2563eb] text-base">{session.overallScore}%</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#94a3b8]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
