'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Info, AlertTriangle, ShieldAlert, Award, FileText, CheckCircle2 } from 'lucide-react';
import { useNotificationStore } from '@/lib/store/notification-store';
import { useAuthStore } from '@/lib/store/auth-store';

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'ASSESSMENT_INVITE': return <FileText className="w-4 h-4 text-[#2563eb]" />;
    case 'ASSESSMENT_REMINDER': return <AlertTriangle className="w-4 h-4 text-[#d97706]" />;
    case 'SUBMISSION_RESULT': return <CheckCircle2 className="w-4 h-4 text-[#059669]" />;
    case 'VIOLATION_ALERT': return <ShieldAlert className="w-4 h-4 text-[#dc2626]" />;
    case 'CERTIFICATE_ISSUED': return <Award className="w-4 h-4 text-[#7c3aed]" />;
    case 'SYSTEM_ALERT': return <Info className="w-4 h-4 text-[#0891b2]" />;
    default: return <Bell className="w-4 h-4 text-[#64748b]" />;
  }
};

export default function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthStore();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    initialize, 
    cleanup 
  } = useNotificationStore();

  useEffect(() => {
    if (user?.id) {
      initialize(user.id);
    }
    return () => cleanup();
  }, [user?.id, initialize, cleanup]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-slate-100 transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#dc2626] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#dc2626]"></span>
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-[#e2e8f0] shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0] bg-slate-50">
              <h3 className="text-sm font-semibold text-[#0f172a]">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAsRead()}
                  className="text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-[#64748b]">
                  <div className="w-5 h-5 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-[#64748b]">
                  <Bell className="w-8 h-8 opacity-20 mx-auto mb-3 text-[#94a3b8]" />
                  <p className="text-sm font-medium">You&apos;re all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-[#e2e8f0]">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 transition-colors hover:bg-slate-50 ${!notification.isRead ? 'bg-blue-50/40' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5 flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!notification.isRead ? 'bg-white border border-[#e2e8f0]' : 'opacity-60 bg-slate-100'}`}>
                            {getIconForType(notification.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm ${!notification.isRead ? 'font-semibold text-[#0f172a]' : 'font-medium text-[#334155]'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-[10px] text-[#94a3b8] whitespace-nowrap pt-0.5">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 ${!notification.isRead ? 'text-[#475569]' : 'text-[#64748b]'}`}>
                            {notification.message}
                          </p>
                          
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="mt-2 text-[10px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
