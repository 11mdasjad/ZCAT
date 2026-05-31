'use client';

import { motion, Variants } from 'framer-motion';
import SectionHeading from '@/components/shared/SectionHeading';

import Link from 'next/link';
import { featuresData as features } from '@/lib/data/features';

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
            <Link key={feature.title} href={`/features/${feature.slug}`} className="block">
              <motion.div
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative glass-card rounded-2xl p-7 cursor-pointer h-full"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#00d4ff] transition-colors duration-300 flex items-center gap-2">
                  {feature.title}
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-sm">
                    →
                  </span>
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
