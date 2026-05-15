'use client';

import { motion } from 'framer-motion';
import { Award, Inbox } from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import { useState, useEffect } from 'react';

export default function CertificatesPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ZCATLoader message="Loading certificates..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Certificates</h1>
        <p className="text-sm text-[#8b949e] mt-1">Your earned certificates and achievements.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-12 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10 text-[#00d4ff]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Certificates Yet</h3>
        <p className="text-sm text-[#8b949e] max-w-md mx-auto mb-6">
          Complete assessments and achieve top scores to earn certificates.
          Your earned certifications will be displayed here for download and sharing.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-[#484f58]">
          <Inbox className="w-4 h-4" />
          <span>Complete challenges to earn your first certificate</span>
        </div>
      </motion.div>
    </div>
  );
}
