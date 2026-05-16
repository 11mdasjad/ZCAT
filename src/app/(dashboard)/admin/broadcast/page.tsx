'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle, Loader2, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BroadcastPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/v1/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send broadcast');
      }

      toast.success(`Broadcast sent to ${data.data.sentCount} users!`);
      setTitle('');
      setMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-[#0066ff]" /> System Broadcast
        </h1>
        <p className="text-sm text-[#8b949e] mt-1">
          Send a real-time alert to all active users on the platform.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
          <AlertCircle className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-white">Warning: Platform-wide action</h4>
            <p className="text-xs text-[#8b949e] mt-1">
              This message will be instantly delivered to <strong>all registered users</strong> via their notification center. Ensure your message is appropriate for all audiences before sending.
            </p>
          </div>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Broadcast Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-neon w-full"
              placeholder="e.g. Scheduled Maintenance Notice"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Message Body</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="input-neon w-full resize-none"
              placeholder="Type your message here..."
              maxLength={500}
              required
            />
            <div className="flex justify-end mt-1 text-xs text-[#484f58]">
              {message.length}/500 characters
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#21262d]">
            <button
              type="submit"
              disabled={isSending || !title.trim() || !message.trim()}
              className="btn-neon btn-neon-primary flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Broadcast
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
