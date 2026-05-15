'use client';

import { motion } from 'framer-motion';
import { Trophy, Inbox } from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import { useState, useEffect } from 'react';

export default function LeaderboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ZCATLoader message="Loading leaderboard..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-sm text-[#8b949e] mt-1">Global rankings based on coding challenge performance.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-12 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-[#f59e0b]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Leaderboard Coming Soon</h3>
        <p className="text-sm text-[#8b949e] max-w-md mx-auto mb-6">
          Complete coding challenges and aptitude tests to earn your spot on the leaderboard.
          Rankings are calculated based on your overall performance and consistency.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-[#484f58]">
          <Inbox className="w-4 h-4" />
          <span>No ranking data available yet — start solving challenges!</span>
        </div>
      </motion.div>
    </div>
  );
}
