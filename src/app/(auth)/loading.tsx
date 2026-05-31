'use client';

import ZCATLoader from '@/components/shared/ZCATLoader';

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-[#06080f] flex items-center justify-center">
      <ZCATLoader message="Securing connection..." size="lg" fullScreen />
    </div>
  );
}
