'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';
import { LogoIcon } from './LogoIcon';
import { RedZcatLogo } from './RedZcatLogo';
import { useEffect } from 'react';
import {
  LayoutDashboard, Code2, FileText, Trophy, BarChart3,
  Award, User, Brain, History, BookOpen,
  Users, PlusCircle, Database, Eye, LineChart,
  FileDown, Settings, Zap, ChevronLeft, LogOut,
  Shield, HelpCircle, Megaphone, ClipboardList,
} from 'lucide-react';

const candidateLinks = [
  { href: '/candidate', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/candidate/challenges', icon: Code2, label: 'Coding Challenges' },
  { href: '/candidate/tests', icon: FileText, label: 'Tests' },
  { href: '/candidate/history', icon: History, label: 'Test History' },
  { href: '/candidate/performance', icon: BarChart3, label: 'Performance' },
  { href: '/candidate/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/candidate/certificates', icon: Award, label: 'Certificates' },
  { href: '/candidate/profile', icon: User, label: 'Profile' },
  { href: '/candidate/interview', icon: Brain, label: 'AI Interview' },
];

const adminLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/assessments', icon: ClipboardList, label: 'Test Management' },
  { href: '/admin/candidates', icon: Users, label: 'Candidates' },
  { href: '/admin/assessments/create', icon: PlusCircle, label: 'Create Assessment' },
  { href: '/admin/questions', icon: Database, label: 'Question Bank' },
  { href: '/admin/monitoring', icon: Eye, label: 'Live Monitoring' },
  { href: '/admin/leaderboards', icon: Trophy, label: 'Leaderboards' },
  { href: '/admin/analytics', icon: LineChart, label: 'Analytics' },
  { href: '/admin/broadcast', icon: Megaphone, label: 'Broadcast Alerts' },
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
    await fetch('/auth/logout', { method: 'POST' });
    window.location.assign('/login');
  };

  useEffect(() => {
    const root = document.getElementById('dashboard-layout-root');
    if (root) {
      if (sidebarOpen) {
        root.classList.add('sidebar-expanded');
        root.classList.remove('sidebar-collapsed');
      } else {
        root.classList.add('sidebar-collapsed');
        root.classList.remove('sidebar-expanded');
      }
    }
  }, [sidebarOpen]);

  const isAdmin = pathname.startsWith('/admin');
  const links = isAdmin ? adminLinks : candidateLinks;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-white border-r border-[#e2e8f0] shadow-sm"
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-[#e2e8f0] transition-all duration-300 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
        {sidebarOpen ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <RedZcatLogo height={28} />
          </div>
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-slate-100 transition-all flex items-center justify-center"
            title="Expand Sidebar"
          >
            <LogoIcon className="w-8 h-8" />
          </button>
        )}
        
        {sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-slate-100 transition-all"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
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
              <span className={`sidebar-text ${!sidebarOpen ? 'collapsed' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Links */}
      <div className="p-3 border-t border-[#e2e8f0] space-y-1">
        <button 
          className={`sidebar-item w-full ${!sidebarOpen ? 'justify-center !px-0' : ''}`}
          title={!sidebarOpen ? 'Help & Support' : undefined}
        >
          <HelpCircle className="w-[18px] h-[18px] flex-shrink-0" />
          <span className={`sidebar-text ${!sidebarOpen ? 'collapsed' : ''}`}>Help & Support</span>
        </button>
        <button
          onClick={handleLogout}
          className={`sidebar-item w-full text-[#dc2626] hover:!text-[#dc2626] hover:!bg-red-50 ${!sidebarOpen ? 'justify-center !px-0' : ''}`}
          title={!sidebarOpen ? 'Logout' : undefined}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          <span className={`sidebar-text ${!sidebarOpen ? 'collapsed' : ''}`}>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}
