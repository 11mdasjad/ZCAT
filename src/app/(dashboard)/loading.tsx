'use client';

import ZCATLoader from '@/components/shared/ZCATLoader';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#06080f] flex items-center justify-center">
      <ZCATLoader message="Preparing your workspace..." size="lg" fullScreen />
    </div>
  );
}
