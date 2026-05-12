'use client';

import { motion } from 'framer-motion';
import { Users, Building2, FileCheck, Target } from 'lucide-react';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

const stats = [
  { icon: Users, value: 50, suffix: 'K+', label: 'Students', color: '#00d4ff' },
  { icon: Building2, value: 500, suffix: '+', label: 'Companies', color: '#a855f7' },
  { icon: FileCheck, value: 1, suffix: 'M+', label: 'Assessments', color: '#ec4899' },
  { icon: Target, value: 98, suffix: '%', label: 'Accuracy', color: '#10b981' },
];

export default function StatsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-[#21262d] relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0066ff]/5 via-[#7c3aed]/5 to-[#ec4899]/5" />

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
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  <AnimatedCounter end={value} suffix={suffix} />
                </div>
                <div className="text-sm text-[#8b949e]">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
