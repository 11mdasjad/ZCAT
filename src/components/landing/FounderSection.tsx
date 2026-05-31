'use client';

import { motion } from 'framer-motion';
import { 
  Award, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  ChevronRight, 
  Quote
} from 'lucide-react';
import SectionHeading from '@/components/shared/SectionHeading';

const achievements = [
  {
    icon: Cpu,
    title: 'Adaptive AI Engine',
    description: 'Spearheaded the development of ZCAT\'s smart evaluation model, tailored for multi-language real-time assessment.',
    color: '#00d4ff',
    bg: 'from-[#0066ff]/10 to-[#00d4ff]/5 border-[#00d4ff]/20'
  },
  {
    icon: ShieldCheck,
    title: 'Military-Grade Proctoring',
    description: 'Designed the multi-layered security system involving face tracking, gaze analysis, and tab lockdown mechanisms.',
    color: '#10b981',
    bg: 'from-[#10b981]/10 to-[#059669]/5 border-[#10b981]/20'
  },
  {
    icon: Zap,
    title: 'High-Scale Architecture',
    description: 'Architected ZCAT on highly scalable Next.js serverless runtimes with sub-40ms execution times.',
    color: '#a855f7',
    bg: 'from-[#7c3aed]/10 to-[#a855f7]/5 border-[#a855f7]/20'
  }
];

const coreTenets = [
  {
    title: 'Empowering Builders Globally',
    desc: 'Creating assessment tools that respect candidates\' time and let true technical expertise shine through without bias.'
  },
  {
    title: 'Uncompromising Security',
    desc: 'Constructing robust anti-cheat infrastructure that guarantees institutional-grade integrity for high-stakes tests.'
  },
  {
    title: 'Developer-First Philosophy',
    desc: 'Refining our fully-featured Monaco editor and execution sandbox to mimic real-world production environments.'
  }
];

export default function FounderSection() {
  return (
    <section id="founder" className="relative py-24 sm:py-32 overflow-hidden bg-[#06080f]">
      {/* Background neon glows */}
      <div className="absolute top-[20%] right-[-10%] w-[450px] h-[450px] bg-[#0066ff]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[450px] h-[450px] bg-[#7c3aed]/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-[0.15] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Visionary Leader"
          title="Meet Our"
          gradient="Founder & CEO"
          description="The driving force, architect, and visionary behind ZCAT's industry-leading adaptive assessment platform."
        />

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start mt-12">
          
          {/* Left Column - Beautiful Profile & Social Card */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col items-center"
          >
            <div className="relative group w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden p-[1px] gradient-border neon-glow-blue">
              {/* Outer decorative neon lines */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#ec4899] rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-500" />
              
              {/* Main Card Container */}
              <div className="relative w-full h-full rounded-2xl bg-[#0d1117] overflow-hidden flex flex-col justify-end">
                {/* Founder Image */}
                <img 
                  src="/founder.jpg" 
                  alt="Md Asjad - Founder & CEO of ZCAT" 
                  className="w-full h-full object-cover scale-[1.02] group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Inner Gradient Shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06080f] via-[#06080f]/40 to-transparent" />
                
                {/* Hover overlay text/milestone */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-col">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
                    <span className="text-xs uppercase tracking-widest text-[#10b981] font-mono font-semibold">Active & Building</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white font-sans tracking-wide">Md Asjad</h3>
                  <p className="text-sm text-[#00d4ff] font-mono font-medium">Founder, CEO & Principal Architect</p>
                </div>
              </div>
            </div>

            {/* Social & Contact info */}
            <div className="w-full max-w-[420px] mt-6 flex justify-between items-center px-6 py-4 glass rounded-xl border border-[#21262d]">
              <span className="text-xs text-[#8b949e] font-mono">Connect with Asjad:</span>
              <div className="flex gap-4">
                {/* GitHub - White Brand Icon */}
                <a 
                  href="https://github.com/11mdasjad" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-[#161b22] border border-[#21262d] hover:border-white/40 hover:bg-white/[0.08] text-white transition-all duration-200"
                  title="GitHub Profile"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                </a>
                {/* LinkedIn - Official Blue Icon */}
                <a 
                  href="https://www.linkedin.com/in/md-asjad-48a9042b4/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-[#161b22] border border-[#21262d] hover:border-[#0077B5]/40 hover:bg-[#0077B5]/[0.08] text-[#0077B5] transition-all duration-200"
                  title="LinkedIn Profile"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0077B5">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                {/* Gmail - Original 4-Color Google Icon */}
                <a 
                  href="mailto:asjad.ml.dev@gmail.com" 
                  className="p-2 rounded-lg bg-[#161b22] border border-[#21262d] hover:border-[#EA4335]/40 hover:bg-[#EA4335]/[0.08] transition-all duration-200"
                  title="Gmail Contact"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M4 20h3V9.5L4 7V20z" fill="#4285F4"/>
                    <path d="M20 20h-3V9.5l3-2.5V20z" fill="#34A853"/>
                    <path d="M17 6.5l-5 4-5-4V9.5l5 4 5-4V6.5z" fill="#EA4335"/>
                    <path d="M4 7l8 6.5L20 7V5.5L12 12 4 5.5V7z" fill="#FBBC05"/>
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Vision, Personal Quote & Accomplishments */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="lg:col-span-7 space-y-8"
          >
            {/* The Vision Quote */}
            <div className="relative glass-card rounded-2xl p-6 sm:p-8 border-l-4 border-l-[#00d4ff]">
              <Quote className="absolute top-4 right-4 w-10 h-10 text-[#00d4ff]/10" />
              <p className="text-lg text-white leading-relaxed italic pr-4">
                &ldquo;Our vision at ZCAT is to build the ultimate, highly secure, and adaptive testing system that evaluates talent purely on capability. We have engineered a platform where integrity meets modern developer comfort, giving every developer a fair stage and every recruiter actionable, bulletproof insights.&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0066ff] to-[#00d4ff] flex items-center justify-center font-bold text-xs text-white">
                  MA
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Md Asjad</h4>
                  <p className="text-xs text-[#8b949e]">CEO & Chief Engineer</p>
                </div>
              </div>
            </div>

            {/* Core Story & Philosophy */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#a855f7]" /> The Story Behind ZCAT
              </h3>
              <p className="text-[#8b949e] leading-relaxed text-sm">
                Frustrated by basic multiple-choice question boards and laggy coding editors that did not mimic real-world environments, <strong>Md Asjad</strong> set out to design ZCAT. The objective was simple: build a state-of-the-art playground with an adaptive evaluation engine, browser locks, and precise AI video assessment.
              </p>
              
              {/* List of Tenets */}
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                {coreTenets.map((t, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#0d1117] border border-[#21262d] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white">{t.title}</h4>
                    </div>
                    <p className="text-xs text-[#8b949e] leading-relaxed">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Accomplishments & Tech Breakthroughs */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[#10b981]" /> Engineering Breakthroughs & Contributions
              </h3>
              
              <div className="grid gap-4">
                {achievements.map((ach, idx) => (
                  <div 
                    key={idx}
                    className={`flex flex-col sm:flex-row items-start gap-4 p-5 rounded-2xl border bg-gradient-to-r ${ach.bg} transition-all duration-300 hover:translate-x-1`}
                  >
                    <div className="p-3 rounded-xl bg-[#06080f] border border-[#21262d] text-white flex-shrink-0">
                      <ach.icon className="w-6 h-6" style={{ color: ach.color }} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        {ach.title}
                        <ChevronRight className="w-4 h-4 text-[#8b949e]" />
                      </h4>
                      <p className="text-sm text-[#8b949e] leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
