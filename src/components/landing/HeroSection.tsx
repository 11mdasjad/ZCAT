'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, Code2, Shield, BarChart3, Cpu } from 'lucide-react';
import ParticleBackground from '@/components/shared/ParticleBackground';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <ParticleBackground />
      <div className="absolute inset-0 bg-radial-glow z-0" />
      <div className="absolute inset-0 bg-grid z-0" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-[10%] w-72 h-72 bg-[#0066ff]/10 rounded-full blur-[100px] animate-[float_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-[#7c3aed]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_2s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ec4899]/5 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column — Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-[#00d4ff] bg-[#00d4ff]/[0.08] border border-[#00d4ff]/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-[pulse-glow_2s_ease-in-out_infinite]" />
                Next-Gen Assessment Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              <span className="text-white">AI Powered</span>
              <br />
              <span className="gradient-text">Assessment</span>
              <br />
              <span className="text-white">Platform</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-[#8b949e] mb-4 leading-relaxed max-w-lg"
            >
              Smart Hiring &bull; Smart Testing &bull; Smart Future
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-base text-[#484f58] mb-8 leading-relaxed max-w-lg"
            >
              Enterprise-grade coding assessments, AI proctoring, and real-time analytics — all in one platform trusted by 500+ companies worldwide.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/register" className="btn-neon btn-neon-primary flex items-center gap-2 text-base">
                Start Assessment <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#features" className="btn-neon btn-neon-secondary flex items-center gap-2 text-base">
                <Play className="w-4 h-4" /> Explore Platform
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 flex items-center gap-6 text-xs text-[#484f58]"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#10b981]" />
                <span>SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#a855f7]" />
                <span>AI Proctored</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00d4ff]" />
                <span>Real-time Analytics</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column — 3D Code Dashboard Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              {/* Glow behind */}
              <div className="absolute -inset-4 bg-gradient-to-br from-[#0066ff]/20 via-[#7c3aed]/10 to-[#ec4899]/20 rounded-2xl blur-2xl" />
              
              {/* Main card */}
              <div className="relative glass-card rounded-2xl p-1 border border-[#21262d] overflow-hidden">
                {/* Header bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#21262d] bg-[#0d1117]/80">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                    <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-[#484f58] font-mono">zcat-assessment.dev</span>
                  </div>
                </div>

                {/* Code content */}
                <div className="p-5 font-mono text-sm space-y-1.5 bg-[#0d1117]">
                  <div><span className="text-[#7c3aed]">class</span> <span className="text-[#00d4ff]">ZCATEngine</span> {'{'}</div>
                  <div className="pl-4"><span className="text-[#7c3aed]">async</span> <span className="text-[#f59e0b]">evaluateCandidate</span>(<span className="text-[#ec4899]">submission</span>) {'{'}</div>
                  <div className="pl-8"><span className="text-[#484f58]">{'// AI-powered code analysis'}</span></div>
                  <div className="pl-8"><span className="text-[#7c3aed]">const</span> <span className="text-white">result</span> = <span className="text-[#7c3aed]">await</span> <span className="text-[#f59e0b]">this</span>.<span className="text-[#00d4ff]">runTests</span>(<span className="text-[#ec4899]">submission</span>);</div>
                  <div className="pl-8"><span className="text-[#7c3aed]">const</span> <span className="text-white">score</span> = <span className="text-[#f59e0b]">this</span>.<span className="text-[#00d4ff]">calculateScore</span>(<span className="text-white">result</span>);</div>
                  <div className="pl-8"><span className="text-[#7c3aed]">const</span> <span className="text-white">integrity</span> = <span className="text-[#f59e0b]">this</span>.<span className="text-[#00d4ff]">checkProctoring</span>();</div>
                  <div className="pl-8" />
                  <div className="pl-8"><span className="text-[#7c3aed]">return</span> {'{'} <span className="text-white">score</span>, <span className="text-white">integrity</span>, <span className="text-white">status</span>: <span className="text-[#10b981]">&apos;✓ passed&apos;</span> {'}'}</div>
                  <div className="pl-4">{'}'}</div>
                  <div>{'}'}</div>
                </div>

                {/* Terminal output */}
                <div className="terminal-output">
                  <div className="text-[#10b981]">$ Running evaluation pipeline...</div>
                  <div className="text-[#8b949e]">  ✓ 54/54 test cases passed</div>
                  <div className="text-[#8b949e]">  ✓ AI proctoring: No violations</div>
                  <div className="text-[#00d4ff]">  → Score: 98/100 | Runtime: 42ms</div>
                </div>
              </div>

              {/* Floating metrics */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 glass-card rounded-xl px-4 py-3 border border-[#10b981]/20"
              >
                <div className="text-xs text-[#8b949e] mb-1">Accuracy</div>
                <div className="text-xl font-bold text-[#10b981]">98.5%</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -left-4 glass-card rounded-xl px-4 py-3 border border-[#a855f7]/20"
              >
                <div className="text-xs text-[#8b949e] mb-1">AI Score</div>
                <div className="text-xl font-bold text-[#a855f7]">A+</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#06080f] to-transparent z-10" />
    </section>
  );
}
