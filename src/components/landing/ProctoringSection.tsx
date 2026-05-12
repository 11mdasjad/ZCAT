'use client';

import { motion } from 'framer-motion';
import { Camera, AlertTriangle, CheckCircle, XCircle, Eye, Volume2, Monitor } from 'lucide-react';
import SectionHeading from '@/components/shared/SectionHeading';

const indicators = [
  { icon: Eye, label: 'Face Detected', status: 'ok', color: '#10b981' },
  { icon: Monitor, label: 'Tab Active', status: 'ok', color: '#10b981' },
  { icon: Volume2, label: 'Audio Normal', status: 'ok', color: '#10b981' },
  { icon: Camera, label: 'Webcam Active', status: 'ok', color: '#10b981' },
];

const violations = [
  { type: 'Tab Switch', time: '14:32:05', severity: 'warning' },
  { type: 'Multiple Faces', time: '14:28:12', severity: 'critical' },
  { type: 'Audio Anomaly', time: '14:15:33', severity: 'info' },
];

export default function ProctoringSection() {
  return (
    <section id="proctoring" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#a855f7]/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          badge="AI Proctoring"
          title="Intelligent Exam"
          gradient="Monitoring System"
          description="Advanced AI-powered proctoring with face detection, tab monitoring, and real-time violation alerts."
        />

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Webcam Preview */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Camera header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-[pulse-glow_2s_ease-in-out_infinite]" />
                <span className="text-sm font-medium text-white">Live Camera Feed</span>
              </div>
              <span className="text-xs text-[#484f58] font-mono">REC 00:45:12</span>
            </div>

            {/* Simulated webcam area */}
            <div className="relative aspect-video bg-[#0d1117] flex items-center justify-center">
              {/* Face detection overlay */}
              <div className="relative">
                {/* Face silhouette */}
                <div className="w-32 h-40 rounded-full bg-gradient-to-b from-[#1c2333] to-[#161b22] border-2 border-dashed border-[#30363d]" />
                
                {/* Detection box */}
                <motion.div
                  animate={{ 
                    borderColor: ['rgba(16,185,129,0.6)', 'rgba(16,185,129,0.2)', 'rgba(16,185,129,0.6)'],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-6 border-2 rounded-xl"
                  style={{ borderColor: 'rgba(16,185,129,0.6)' }}
                >
                  {/* Corner markers */}
                  <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-[#10b981] rounded-tl-md" />
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-[#10b981] rounded-tr-md" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-[#10b981] rounded-bl-md" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-[#10b981] rounded-br-md" />
                </motion.div>

                {/* Label */}
                <motion.div
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#10b981]/20 border border-[#10b981]/30 rounded-md px-2.5 py-1 text-xs font-mono text-[#10b981] whitespace-nowrap"
                >
                  Face Detected — Confidence: 99.2%
                </motion.div>
              </div>

              {/* Scan lines effect */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
                }}
              />
            </div>

            {/* Status indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#21262d]">
              {indicators.map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-3 bg-[#0d1117]">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <span className="text-xs text-[#8b949e]">{label}</span>
                  <CheckCircle className="w-3 h-3 ml-auto" style={{ color }} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side — Anti-Cheat Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Integrity Score */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Integrity Score</h3>
                <span className="text-3xl font-bold text-[#10b981]">96</span>
              </div>
              <div className="w-full h-2 bg-[#161b22] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '96%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#06b6d4]"
                />
              </div>
              <p className="text-xs text-[#484f58] mt-2">Based on behavioral analysis, face tracking, and activity patterns</p>
            </div>

            {/* Violation Log */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Violation Log</h3>
              <div className="space-y-3">
                {violations.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#161b22]/50 border border-[#21262d]"
                  >
                    {v.severity === 'critical' ? (
                      <XCircle className="w-4 h-4 text-[#ef4444]" />
                    ) : v.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-[#00d4ff]" />
                    )}
                    <div className="flex-1">
                      <span className="text-sm text-white">{v.type}</span>
                    </div>
                    <span className="text-xs text-[#484f58] font-mono">{v.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Detection Features */}
            <div className="grid grid-cols-2 gap-3">
              {['Face Detection', 'Tab Monitor', 'Audio Analysis', 'Screen Record'].map((f, i) => (
                <div key={f} className="glass-card rounded-xl px-4 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span className="text-xs text-[#8b949e]">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
