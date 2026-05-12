'use client';

import { motion } from 'framer-motion';
import { Camera, AlertTriangle, CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';

const liveExams = [
  { id: 1, name: 'Full Stack Assessment', candidate: 'Rahul Kumar', status: 'active', violations: 0, timeLeft: '45:12', integrity: 98 },
  { id: 2, name: 'Full Stack Assessment', candidate: 'Ananya Patel', status: 'active', violations: 1, timeLeft: '32:05', integrity: 92 },
  { id: 3, name: 'Full Stack Assessment', candidate: 'Mohammed Ali', status: 'warning', violations: 3, timeLeft: '28:33', integrity: 74 },
  { id: 4, name: 'Python Challenge', candidate: 'Sneha Reddy', status: 'active', violations: 0, timeLeft: '55:21', integrity: 100 },
  { id: 5, name: 'Python Challenge', candidate: 'Vikram Singh', status: 'flagged', violations: 5, timeLeft: '12:47', integrity: 45 },
  { id: 6, name: 'Full Stack Assessment', candidate: 'Kavitha Nair', status: 'active', violations: 0, timeLeft: '41:09', integrity: 96 },
  { id: 7, name: 'Python Challenge', candidate: 'Arjun Mehta', status: 'active', violations: 0, timeLeft: '48:55', integrity: 99 },
  { id: 8, name: 'Full Stack Assessment', candidate: 'Deepa Gupta', status: 'warning', violations: 2, timeLeft: '22:18', integrity: 81 },
];

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Monitoring</h1>
          <p className="text-sm text-[#8b949e] mt-1">Real-time monitoring of active exam sessions.</p>
        </div>
        <button className="btn-neon btn-neon-secondary !py-2 !px-4 text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Sessions', value: liveExams.length, color: '#00d4ff' },
          { label: 'No Violations', value: liveExams.filter((e) => e.violations === 0).length, color: '#10b981' },
          { label: 'Warnings', value: liveExams.filter((e) => e.status === 'warning').length, color: '#f59e0b' },
          { label: 'Flagged', value: liveExams.filter((e) => e.status === 'flagged').length, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-xl p-4 text-center">
            <div className="text-xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs text-[#484f58]">{label}</div>
          </div>
        ))}
      </div>

      {/* Monitoring Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {liveExams.map((exam, i) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card rounded-xl overflow-hidden ${
              exam.status === 'flagged' ? 'border-[#ef4444]/30' : exam.status === 'warning' ? 'border-[#f59e0b]/30' : ''
            }`}
          >
            {/* Webcam placeholder */}
            <div className="aspect-video bg-[#0d1117] relative flex items-center justify-center">
              <Camera className="w-8 h-8 text-[#21262d]" />
              {/* Status indicator */}
              <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${
                exam.status === 'active' ? 'bg-[#10b981]' : exam.status === 'warning' ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'
              } animate-[pulse-glow_2s_ease-in-out_infinite]`} />
              {exam.violations > 0 && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#ef4444]/20 border border-[#ef4444]/30">
                  <AlertTriangle className="w-3 h-3 text-[#ef4444]" />
                  <span className="text-[10px] text-[#ef4444] font-medium">{exam.violations}</span>
                </div>
              )}
              {/* Time */}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/50 text-xs font-mono text-white">
                {exam.timeLeft}
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-sm font-medium text-white truncate">{exam.candidate}</p>
              <p className="text-xs text-[#484f58] truncate">{exam.name}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-full max-w-[60px] h-1 bg-[#161b22] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      exam.integrity >= 90 ? 'bg-[#10b981]' : exam.integrity >= 70 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'
                    }`} style={{ width: `${exam.integrity}%` }} />
                  </div>
                  <span className="text-xs text-[#484f58]">{exam.integrity}%</span>
                </div>
                <button className="p-1 rounded text-[#8b949e] hover:text-[#00d4ff] transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
