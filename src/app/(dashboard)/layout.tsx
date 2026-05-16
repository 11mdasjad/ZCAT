'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/shared/Sidebar';
import { useUIStore } from '@/lib/store/ui-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { Search, User } from 'lucide-react';
import Link from 'next/link';
import NotificationsPopover from '@/components/shared/NotificationsPopover';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { sidebarOpen } = useUIStore();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#06080f]">
      <Sidebar />
      <div
        className="transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 260 : 72 }}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 glass-strong border-b border-[#21262d] h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input
                type="text"
                placeholder="Search assessments, candidates..."
                className="w-full bg-[#161b22]/50 border border-[#21262d] rounded-lg pl-10 pr-4 py-2 text-sm text-[#e4e8f1] placeholder:text-[#484f58] outline-none focus:border-[#00d4ff]/30 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationsPopover />
            <Link href={user?.role === 'admin' || user?.role === 'recruiter' ? '/admin/profile' : '/candidate/profile'} className="flex items-center gap-2 pl-4 border-l border-[#21262d]">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-sm font-medium text-white hidden sm:block">
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
