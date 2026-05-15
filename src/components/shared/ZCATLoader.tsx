'use client';

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface ZCATLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function ZCATLoader({ 
  message = 'Loading...', 
  size = 'md', 
  fullScreen = false 
}: ZCATLoaderProps) {
  const sizes = {
    sm: { container: 'py-8', logo: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-xs', orb: 'w-1.5 h-1.5' },
    md: { container: 'py-16', logo: 'w-14 h-14', icon: 'w-6 h-6', text: 'text-sm', orb: 'w-2 h-2' },
    lg: { container: 'py-24', logo: 'w-20 h-20', icon: 'w-8 h-8', text: 'text-base', orb: 'w-2.5 h-2.5' },
  };

  const s = sizes[size];

  const content = (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-[60vh]' : s.container}`}>
      {/* Orbiting particles */}
      <div className="relative">
        {/* Glow backdrop */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.15), transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Orbiting dots */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className={`absolute ${s.orb} rounded-full`}
            style={{
              background: i % 2 === 0 ? '#00d4ff' : '#a855f7',
              boxShadow: i % 2 === 0
                ? '0 0 8px rgba(0,212,255,0.6)'
                : '0 0 8px rgba(168,85,247,0.6)',
              top: '50%',
              left: '50%',
            }}
            animate={{
              x: [
                Math.cos((i * Math.PI) / 3) * (size === 'sm' ? 24 : size === 'md' ? 38 : 52),
                Math.cos((i * Math.PI) / 3 + Math.PI * 2) * (size === 'sm' ? 24 : size === 'md' ? 38 : 52),
              ],
              y: [
                Math.sin((i * Math.PI) / 3) * (size === 'sm' ? 24 : size === 'md' ? 38 : 52),
                Math.sin((i * Math.PI) / 3 + Math.PI * 2) * (size === 'sm' ? 24 : size === 'md' ? 38 : 52),
              ],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.15,
            }}
          />
        ))}

        {/* Center logo */}
        <motion.div
          className={`${s.logo} rounded-2xl bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center relative z-10`}
          style={{
            boxShadow: '0 0 30px rgba(0,102,255,0.3), 0 0 60px rgba(124,58,237,0.15)',
          }}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Zap className={`${s.icon} text-white`} />
        </motion.div>
      </div>

      {/* Message with shimmer */}
      <motion.p
        className={`${s.text} text-[#8b949e] mt-6 font-medium`}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {message}
      </motion.p>

      {/* Progress bar */}
      <div className="w-32 h-0.5 bg-[#21262d] rounded-full mt-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#0066ff] via-[#a855f7] to-[#00d4ff]"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '50%' }}
        />
      </div>
    </div>
  );

  return content;
}
