'use client';

import { motion } from 'framer-motion';
import { Award, Download, ExternalLink, Calendar } from 'lucide-react';

const certificates = [
  { id: '1', title: 'Algorithm Master', issuer: 'ZCAT Platform', date: '2026-04-15', type: 'Gold', color: '#f59e0b' },
  { id: '2', title: 'Full Stack Developer', issuer: 'ZCAT Platform', date: '2026-03-22', type: 'Platinum', color: '#00d4ff' },
  { id: '3', title: 'Data Structures Expert', issuer: 'ZCAT Platform', date: '2026-03-10', type: 'Silver', color: '#8b949e' },
  { id: '4', title: 'Python Proficiency', issuer: 'ZCAT Platform', date: '2026-02-28', type: 'Gold', color: '#f59e0b' },
  { id: '5', title: 'Problem Solving Champion', issuer: 'Weekly Contest #42', date: '2026-02-15', type: 'Platinum', color: '#00d4ff' },
  { id: '6', title: 'SQL Mastery', issuer: 'ZCAT Platform', date: '2026-01-20', type: 'Bronze', color: '#cd7f32' },
];

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Certificates</h1>
        <p className="text-sm text-[#8b949e] mt-1">Your earned certificates and achievements.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map((cert, i) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-5 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${cert.color}15`, border: `1px solid ${cert.color}25` }}>
                <Award className="w-6 h-6" style={{ color: cert.color }} />
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${cert.color}15`, color: cert.color, border: `1px solid ${cert.color}25` }}>
                {cert.type}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{cert.title}</h3>
            <p className="text-xs text-[#484f58] mb-1">{cert.issuer}</p>
            <p className="text-xs text-[#484f58] flex items-center gap-1 mb-4"><Calendar className="w-3 h-3" /> {cert.date}</p>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-[#161b22] border border-[#21262d] text-xs text-[#8b949e] hover:text-white hover:border-[#30363d] transition-all">
                <Download className="w-3 h-3" /> Download
              </button>
              <button className="flex items-center justify-center p-2 rounded-lg bg-[#161b22] border border-[#21262d] text-[#8b949e] hover:text-white hover:border-[#30363d] transition-all">
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
