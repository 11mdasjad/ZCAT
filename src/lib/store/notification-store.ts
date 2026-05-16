import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id?: string) => Promise<void>;
  initialize: (userId: string) => void;
  cleanup: () => void;
}

let subscription: RealtimeChannel | null = null;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: true,

  fetchNotifications: async () => {
    try {
      const res = await fetch('/api/v1/notifications?limit=20');
      if (res.ok) {
        const data = await res.json();
        set({ 
          notifications: data.data.notifications, 
          unreadCount: data.data.unreadCount,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id?: string) => {
    const { notifications, unreadCount } = get();
    
    // Optimistic update
    if (id) {
      set({
        notifications: notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, unreadCount - 1)
      });
    } else {
      set({
        notifications: notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      });
    }

    try {
      await fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { notificationIds: [id] } : { markAllRead: true }),
      });
    } catch (error) {
      console.error('Failed to mark notification(s) as read:', error);
      // We could revert optimistic update here, but let's just refetch
      get().fetchNotifications();
    }
  },

  initialize: (userId: string) => {
    if (!userId) return;
    
    // Fetch initial data
    get().fetchNotifications();

    const supabase = createClient();

    // Clean up existing subscription if any
    if (subscription) {
      supabase.removeChannel(subscription);
    }

    // Subscribe to new notifications for this user
    subscription = supabase
      .channel(`public:notifications:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = {
            id: payload.new.id,
            type: payload.new.type,
            title: payload.new.title,
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: payload.new.created_at,
            data: payload.new.data,
          } as Notification;

          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
        }
      )
      .subscribe();
  },

  cleanup: () => {
    if (subscription) {
      const supabase = createClient();
      supabase.removeChannel(subscription);
      subscription = null;
    }
  }
}));
