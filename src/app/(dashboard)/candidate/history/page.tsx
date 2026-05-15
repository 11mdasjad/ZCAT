'use client';

import { motion } from 'framer-motion';
import { History, Inbox } from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import { useState, useEffect } from 'react';

export default function HistoryPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ZCATLoader message="Loading test history..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Test History</h1>
        <p className="text-sm text-[#8b949e] mt-1">Review your past assessments and track your progress.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-12 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center mx-auto mb-6">
          <History className="w-10 h-10 text-[#a855f7]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Test History</h3>
        <p className="text-sm text-[#8b949e] max-w-md mx-auto mb-6">
          Your completed assessments will show up here with scores, dates, and performance details.
          Start taking tests to build your history.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-[#484f58]">
          <Inbox className="w-4 h-4" />
          <span>No assessments completed yet</span>
        </div>
      </motion.div>
    </div>
  );
}
