'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  gradient?: string;
  description?: string;
  children?: ReactNode;
  align?: 'left' | 'center';
}

export default function SectionHeading({ badge, title, gradient, description, children, align = 'center' }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className={`mb-16 ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      {badge && (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-[#00d4ff] bg-[#00d4ff]/[0.08] border border-[#00d4ff]/20 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-[pulse-glow_2s_ease-in-out_infinite]" />
          {badge}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
        {title}{' '}
        {gradient && <span className="gradient-text">{gradient}</span>}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </motion.div>
  );
}
