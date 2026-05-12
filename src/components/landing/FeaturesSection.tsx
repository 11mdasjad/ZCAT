'use client';

import { motion, Variants } from 'framer-motion';
import { Shield, Code2, Eye, BarChart3, Brain, Lock } from 'lucide-react';
import SectionHeading from '@/components/shared/SectionHeading';

const features = [
  {
    icon: Shield,
    title: 'AI Proctoring',
    description: 'Advanced face detection, tab monitoring, and anti-cheating with real-time AI analysis.',
    color: '#00d4ff',
    gradient: 'from-[#00d4ff]/20 to-[#0066ff]/20',
  },
  {
    icon: Code2,
    title: 'Coding Assessment',
    description: 'Multi-language code editor with auto-evaluation, hidden test cases, and plagiarism detection.',
    color: '#a855f7',
    gradient: 'from-[#a855f7]/20 to-[#7c3aed]/20',
  },
  {
    icon: Eye,
    title: 'Live Monitoring',
    description: 'Real-time candidate monitoring with webcam feeds, violation alerts, and activity tracking.',
    color: '#ec4899',
    gradient: 'from-[#ec4899]/20 to-[#db2777]/20',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Comprehensive dashboards with skill analysis, performance heatmaps, and hiring insights.',
    color: '#10b981',
    gradient: 'from-[#10b981]/20 to-[#059669]/20',
  },
  {
    icon: Brain,
    title: 'AI Interview',
    description: 'AI-powered technical interviews with voice analysis, behavioral scoring, and instant feedback.',
    color: '#f59e0b',
    gradient: 'from-[#f59e0b]/20 to-[#d97706]/20',
  },
  {
    icon: Lock,
    title: 'Secure Examination',
    description: 'Browser lockdown, copy-paste prevention, encrypted data, and SOC 2 compliant infrastructure.',
    color: '#06b6d4',
    gradient: 'from-[#06b6d4]/20 to-[#0891b2]/20',
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] },
  }),
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Features"
          title="Everything You Need for"
          gradient="Smart Assessments"
          description="A comprehensive suite of AI-powered tools designed for modern technical hiring and skill evaluation."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative glass-card rounded-2xl p-7 cursor-pointer"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#00d4ff] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-sm text-[#8b949e] leading-relaxed">
                {feature.description}
              </p>

              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(400px circle at 50% 50%, ${feature.color}08, transparent)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
