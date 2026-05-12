'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Send, Bot, User, Mic, Video, Sparkles } from 'lucide-react';

const mockMessages = [
  { role: 'bot' as const, content: 'Welcome to ZCAT AI Interview Prep! I\'m your AI interviewer. Let\'s start with a technical question. Can you explain the difference between REST and GraphQL APIs?' },
  { role: 'user' as const, content: 'REST APIs use multiple endpoints for different resources, while GraphQL uses a single endpoint where you can query exactly the data you need. GraphQL reduces over-fetching and under-fetching issues.' },
  { role: 'bot' as const, content: 'Great answer! You covered the key differences well. Let me follow up — what are some drawbacks of GraphQL compared to REST?' },
];

export default function InterviewPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        role: 'bot',
        content: 'That\'s an excellent point! Your understanding of the trade-offs shows good architectural thinking. Let me ask you about system design next — how would you design a URL shortening service like bit.ly?',
      }]);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Interview Prep</h1>
          <p className="text-sm text-[#8b949e] mt-1">Practice with our AI interviewer for technical rounds.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-neon btn-neon-secondary !py-2 !px-4 text-sm flex items-center gap-2">
            <Mic className="w-4 h-4" /> Voice Mode
          </button>
          <button className="btn-neon btn-neon-secondary !py-2 !px-4 text-sm flex items-center gap-2">
            <Video className="w-4 h-4" /> Video Mode
          </button>
        </div>
      </div>

      {/* Topic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['Data Structures', 'System Design', 'Algorithms', 'Behavioral'].map((topic, i) => (
          <motion.button
            key={topic}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-3 text-sm text-[#8b949e] hover:text-[#00d4ff] hover:border-[#00d4ff]/20 transition-all text-center"
          >
            {topic}
          </motion.button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="glass-card rounded-xl flex flex-col" style={{ height: 'calc(100vh - 350px)', minHeight: '400px' }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#21262d]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">ZCAT AI Interviewer</p>
            <div className="flex items-center gap-1 text-xs text-[#10b981]">
              <Sparkles className="w-3 h-3" /> Active
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.role === 'bot'
                  ? 'bg-gradient-to-br from-[#a855f7] to-[#ec4899]'
                  : 'bg-gradient-to-br from-[#0066ff] to-[#7c3aed]'
              }`}>
                {msg.role === 'bot' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
              </div>
              <div className={`max-w-[70%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                msg.role === 'bot'
                  ? 'bg-[#161b22] border border-[#21262d] text-[#e4e8f1]'
                  : 'bg-[#0066ff]/10 border border-[#0066ff]/20 text-[#e4e8f1]'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#21262d]">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your answer..."
              className="input-neon flex-1"
            />
            <button onClick={sendMessage} className="btn-neon btn-neon-primary !py-2 !px-4 flex items-center gap-2">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
