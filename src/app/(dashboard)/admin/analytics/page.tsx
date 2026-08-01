'use client';

import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';
import { mockFunnelData, mockTopicData } from '@/lib/data/mock-analytics';

const passRateData = [
  { month: 'Jan', rate: 62 }, { month: 'Feb', rate: 65 }, { month: 'Mar', rate: 68 },
  { month: 'Apr', rate: 71 }, { month: 'May', rate: 74 }, { month: 'Jun', rate: 72 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-600 font-medium mt-1">Comprehensive analytics and recruitment insights.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-6 border border-slate-200 bg-white shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Hiring Funnel</h3>
          <div className="space-y-3">
            {mockFunnelData.map((stage, i) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 w-24">{stage.stage}</span>
                <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stage.count / mockFunnelData[0].count) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded-lg flex items-center justify-end pr-3 bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    <span className="text-xs font-bold text-white">{stage.count.toLocaleString()}</span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pass Rate */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl p-6 border border-slate-200 bg-white shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Pass Rate Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={passRateData}>
              <defs>
                <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis domain={[50, 80]} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="rate" stroke="#059669" fill="url(#passGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Score Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl p-6 border border-slate-200 bg-white shadow-xs lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Topic Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockTopicData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="topic" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontWeight: 'bold' }} />
              <Legend />
              <Bar dataKey="correct" fill="#059669" radius={[4, 4, 0, 0]} name="Passed" />
              <Bar dataKey="incorrect" fill="#dc2626" radius={[4, 4, 0, 0]} name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
