'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';
import {
  LayoutDashboard, Code2, FileText, Trophy, BarChart3,
  Award, User, Brain, History, BookOpen,
  Users, PlusCircle, Database, Eye, LineChart,
  FileDown, Settings, Zap, ChevronLeft, LogOut,
  Shield, HelpCircle,
} from 'lucide-react';

const candidateLinks = [
  { href: '/candidate', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/candidate/challenges', icon: Code2, label: 'Coding Challenges' },
  { href: '/candidate/tests', icon: FileText, label: 'Aptitude Tests' },
  { href: '/candidate/history', icon: History, label: 'Test History' },
  { href: '/candidate/performance', icon: BarChart3, label: 'Performance' },
  { href: '/candidate/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/candidate/certificates', icon: Award, label: 'Certificates' },
  { href: '/candidate/profile', icon: User, label: 'Profile' },
  { href: '/candidate/interview', icon: Brain, label: 'AI Interview' },
];

const adminLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/candidates', icon: Users, label: 'Candidates' },
  { href: '/admin/assessments/create', icon: PlusCircle, label: 'Create Assessment' },
  { href: '/admin/questions', icon: Database, label: 'Question Bank' },
  { href: '/admin/monitoring', icon: Eye, label: 'Live Monitoring' },
  { href: '/admin/analytics', icon: LineChart, label: 'Analytics' },
  { href: '/admin/reports', icon: FileDown, label: 'Reports' },
  { href: '/admin/profile', icon: User, label: 'Profile' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isAdmin = pathname.startsWith('/admin');
  const links = isAdmin ? adminLinks : candidateLinks;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col glass-strong border-r border-[#21262d]"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#21262d]">
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold gradient-text">ZCAT</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-item ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center !px-0' : ''}`}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Links */}
      <div className="p-3 border-t border-[#21262d] space-y-1">
        <button className={`sidebar-item w-full ${!sidebarOpen ? 'justify-center !px-0' : ''}`}>
          <HelpCircle className="w-[18px] h-[18px] flex-shrink-0" />
          {sidebarOpen && <span>Help & Support</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`sidebar-item w-full text-[#ef4444] hover:!text-[#ef4444] hover:!bg-[#ef4444]/10 ${!sidebarOpen ? 'justify-center !px-0' : ''}`}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
