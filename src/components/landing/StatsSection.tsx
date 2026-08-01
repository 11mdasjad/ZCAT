'use client';

import { motion } from 'framer-motion';
import { Users, Building2, FileCheck, Target } from 'lucide-react';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

const stats = [
  { icon: Users, value: 50, suffix: 'K+', label: 'Students', color: '#0284c7' },
  { icon: Building2, value: 500, suffix: '+', label: 'Companies', color: '#7c3aed' },
  { icon: FileCheck, value: 1, suffix: 'M+', label: 'Assessments', color: '#db2777' },
  { icon: Target, value: 98, suffix: '%', label: 'Accuracy', color: '#059669' },
];

export default function StatsSection() {
  return (
    <section className="relative py-24 sm:py-32 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-[#e2e8f0] bg-white shadow-xl relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb]/5 via-[#7c3aed]/5 to-[#db2777]/5" />

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {stats.map(({ icon: Icon, value, suffix, label, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xs"
                  style={{ background: `${color}10`, border: `1px solid ${color}30` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-1">
                  <AnimatedCounter end={value} suffix={suffix} />
                </div>
                <div className="text-sm font-semibold text-[#64748b]">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
