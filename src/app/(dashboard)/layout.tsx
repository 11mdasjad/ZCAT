'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/shared/Sidebar';
import { useAuthStore } from '@/lib/store/auth-store';
import { Search, User } from 'lucide-react';
import Link from 'next/link';
import NotificationsPopover from '@/components/shared/NotificationsPopover';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const isTestWorkspace = pathname?.includes('/candidate/tests/') && pathname !== '/candidate/tests';

  if (isTestWorkspace) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div id="dashboard-layout-root" className="min-h-screen bg-[#f8fafc] sidebar-expanded">
      <Sidebar />
      <div className="main-content-wrapper">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#e2e8f0] h-16 flex items-center justify-between px-6 shadow-xs">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search assessments, candidates..."
                className="w-full bg-slate-50 border border-[#cbd5e1] rounded-lg pl-10 pr-4 py-2 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:border-[#2563eb] transition-colors font-medium shadow-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationsPopover />
            <Link href={user?.role === 'admin' || user?.role === 'recruiter' ? '/admin/profile' : '/candidate/profile'} className="flex items-center gap-2 pl-4 border-l border-[#e2e8f0]">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover border border-[#e2e8f0]" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] flex items-center justify-center shadow-xs">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-sm font-semibold text-[#0f172a] hidden sm:block">
                {user?.name ? user.name.split(' ')[0] : 'User'}
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
