'use client';

import { motion } from 'framer-motion';
import { Award, Inbox, Zap } from 'lucide-react';
import Link from 'next/link';
import ZCATLoader from '@/components/shared/ZCATLoader';
import { useState, useEffect } from 'react';

export default function CertificatesPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ZCATLoader message="Loading certificates..." fullScreen />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Certificates</h1>
        <p className="text-sm text-[#64748b] font-medium mt-1">Your earned certificates and achievements.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-12 text-center border border-[#e2e8f0] bg-white shadow-xs max-w-2xl mx-auto"
      >
        <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10 text-[#2563eb]" />
        </div>
        <h3 className="text-xl font-bold text-[#0f172a] mb-2">No Certificates Yet</h3>
        <p className="text-sm text-[#64748b] font-medium max-w-md mx-auto mb-6 leading-relaxed">
          Complete assessments and achieve top scores to earn certificates.
          Your earned certifications will be displayed here for download and sharing.
        </p>
        <div className="flex flex-col items-center gap-4">
          <Link href="/candidate/tests" className="btn-neon btn-neon-primary px-5 py-2.5 text-sm font-bold shadow-md inline-flex items-center gap-2">
            <Zap className="w-4 h-4" /> Browse Tests & Assessments
          </Link>
          <div className="flex items-center justify-center gap-2 text-xs text-[#94a3b8] font-medium">
            <Inbox className="w-4 h-4" />
            <span>Complete challenges to earn your first certificate</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
