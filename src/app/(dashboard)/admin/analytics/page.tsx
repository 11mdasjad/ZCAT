'use client';

import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { mockFunnelData, mockTrendData, mockTopicData } from '@/lib/data/mock-analytics';

const passRateData = [
  { month: 'Jan', rate: 62 }, { month: 'Feb', rate: 65 }, { month: 'Mar', rate: 68 },
  { month: 'Apr', rate: 71 }, { month: 'May', rate: 74 }, { month: 'Jun', rate: 72 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-[#8b949e] mt-1">Comprehensive analytics and recruitment insights.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Hiring Funnel</h3>
          <div className="space-y-3">
            {mockFunnelData.map((stage, i) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <span className="text-xs text-[#8b949e] w-20">{stage.stage}</span>
                <div className="flex-1 h-8 bg-[#161b22] rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stage.count / mockFunnelData[0].count) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded-lg flex items-center justify-end pr-3"
                    style={{ background: `linear-gradient(90deg, ${stage.color}30, ${stage.color}60)` }}
                  >
                    <span className="text-xs font-semibold text-white">{stage.count.toLocaleString()}</span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pass Rate */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Pass Rate Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={passRateData}>
              <defs>
                <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="month" tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={{ stroke: '#21262d' }} />
              <YAxis domain={[50, 80]} tick={{ fill: '#8b949e', fontSize: 12 }} axisLine={{ stroke: '#21262d' }} />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '8px', color: '#e4e8f1' }} />
              <Area type="monotone" dataKey="rate" stroke="#10b981" fill="url(#passGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Score Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Topic Performance</h3>
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
