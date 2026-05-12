'use client';

import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts';
import { mockSkillData, mockTrendData, mockTopicData } from '@/lib/data/mock-analytics';

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Performance Analytics</h1>
        <p className="text-sm text-[#8b949e] mt-1">Detailed insights into your skills and progress.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skill Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Skill Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={mockSkillData}>
              <PolarGrid stroke="#21262d" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8b949e', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#484f58', fontSize: 10 }} />
              <Radar name="Score" dataKey="score" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Score Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="date" tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={{ stroke: '#21262d' }} />
              <YAxis domain={[40, 100]} tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={{ stroke: '#21262d' }} />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '8px', color: '#e4e8f1' }} />
              <Line type="monotone" dataKey="score" stroke="#00d4ff" strokeWidth={2} dot={{ fill: '#00d4ff', r: 4 }} />
              <Line type="monotone" dataKey="average" stroke="#484f58" strokeWidth={1} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Topic Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Topic Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockTopicData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="topic" tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={{ stroke: '#21262d' }} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={{ stroke: '#21262d' }} />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '8px', color: '#e4e8f1' }} />
              <Legend />
              <Bar dataKey="correct" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="incorrect" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
