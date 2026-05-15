'use client';

import { motion } from 'framer-motion';
import { BarChart3, Inbox } from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import { useState, useEffect } from 'react';

export default function PerformancePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ZCATLoader message="Loading performance data..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Performance Analytics</h1>
        <p className="text-sm text-[#8b949e] mt-1">Detailed insights into your skills and progress.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-12 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-10 h-10 text-[#10b981]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Performance Data Yet</h3>
        <p className="text-sm text-[#8b949e] max-w-md mx-auto mb-6">
          Your performance analytics will appear here once you start completing coding challenges and tests.
          Charts will show your skill distribution, score trends, and topic mastery.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-[#484f58]">
          <Inbox className="w-4 h-4" />
          <span>Complete at least one challenge to see your analytics</span>
        </div>
      </motion.div>
    </div>
  );
}
