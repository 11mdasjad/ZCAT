'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, ArrowLeft, Loader2, Sparkles,
  User, Shield, MessageSquare, Mic, Volume2, HelpCircle
} from 'lucide-react';

interface WizardProps {
  onBack: () => void;
  onStart: (config: {
    title: string;
    category: 'TECHNICAL' | 'HR' | 'PLACEMENT';
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    voiceMode: boolean;
  }) => void;
}

const rolePresets = [
  'Software Engineer',
  'Frontend Developer',
  'Fullstack Developer',
  'Product Manager',
  'Data Analyst',
];

export default function InterviewWizard({ onBack, onStart }: WizardProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'TECHNICAL' | 'HR' | 'PLACEMENT'>('TECHNICAL');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [voiceMode, setVoiceMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    // Let it spin for 500ms to allow parent fetch to start
    setTimeout(() => {
      onStart({
        title: title.trim(),
        category,
        difficulty,
        voiceMode,
      });
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Back Link */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-[#8b949e] hover:text-[#00d4ff] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Main Card */}
      <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden border border-[#21262d]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d4ff]/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-[#00d4ff]" /> Configure Your AI Mock Interview
          </h2>
          <p className="text-sm text-[#8b949e]">
            Choose a target role, interview parameters, and practice speaking under real-time constraints.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              1. Target Job Role / Title
            </label>
            <input
              type="text"
              required
              disabled={loading}
              placeholder="e.g. Frontend Engineer, Fullstack React Developer..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full input-neon text-sm"
            />
            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              {rolePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={loading}
                  onClick={() => setTitle(preset)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    title === preset
                      ? 'border-[#00d4ff]/40 bg-[#00d4ff]/10 text-[#00d4ff]'
                      : 'border-[#21262d] bg-[#161b22]/30 text-[#8b949e] hover:border-[#484f58] hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Category / Interview Type */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              2. Round/Category Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => setCategory('TECHNICAL')}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                  category === 'TECHNICAL'
                    ? 'border-[#00d4ff]/40 bg-[#0066ff]/10 text-white'
                    : 'border-[#21262d] bg-[#0d1117] text-[#8b949e] hover:border-[#30363d]'
                }`}
              >
                <div className={`p-2 rounded-lg ${category === 'TECHNICAL' ? 'bg-[#00d4ff]/20 text-[#00d4ff]' : 'bg-[#161b22] text-[#8b949e]'}`}>
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold block">Technical</p>
                  <span className="text-[10px] text-[#8b949e]">Coding & Architecture</span>
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => setCategory('HR')}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                  category === 'HR'
                    ? 'border-[#a855f7]/40 bg-[#a855f7]/10 text-white'
                    : 'border-[#21262d] bg-[#0d1117] text-[#8b949e] hover:border-[#30363d]'
                }`}
              >
                <div className={`p-2 rounded-lg ${category === 'HR' ? 'bg-[#a855f7]/20 text-[#a855f7]' : 'bg-[#161b22] text-[#8b949e]'}`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold block">HR & Values</p>
                  <span className="text-[10px] text-[#8b949e]">Behavioral & Teamwork</span>
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => setCategory('PLACEMENT')}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                  category === 'PLACEMENT'
                    ? 'border-[#10b981]/40 bg-[#10b981]/10 text-white'
                    : 'border-[#21262d] bg-[#0d1117] text-[#8b949e] hover:border-[#30363d]'
                }`}
              >
                <div className={`p-2 rounded-lg ${category === 'PLACEMENT' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#161b22] text-[#8b949e]'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold block">Placement</p>
                  <span className="text-[10px] text-[#8b949e]">General Placement Mock</span>
                </div>
              </button>
            </div>
          </div>

          {/* Difficulty and Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                3. Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['EASY', 'MEDIUM', 'HARD'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    disabled={loading}
                    onClick={() => setDifficulty(lvl)}
                    className={`text-xs py-2.5 rounded-lg border font-semibold text-center transition-all ${
                      difficulty === lvl
                        ? 'border-[#00d4ff]/40 bg-[#00d4ff]/10 text-[#00d4ff]'
                        : 'border-[#21262d] bg-[#0d1117] text-[#8b949e] hover:border-[#30363d] hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Mode Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                4. Conversation Format
              </label>
              <div
                onClick={() => !loading && setVoiceMode(!voiceMode)}
                className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  voiceMode
                    ? 'border-[#00d4ff]/30 bg-[#00d4ff]/5 text-white'
                    : 'border-[#21262d] bg-[#0d1117] text-[#8b949e]'
                }`}
              >
                <div className="flex items-center gap-2.5 pl-1.5">
                  {voiceMode ? (
                    <Mic className="w-4 h-4 text-[#00d4ff] animate-pulse-glow" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-[#8b949e]" />
                  )}
                  <div>
                    <span className="text-xs font-bold block">{voiceMode ? 'Voice Mode' : 'Text Input Mode'}</span>
                    <span className="text-[9px] text-[#8b949e]">
                      {voiceMode ? 'Interactive TTS & Speak transcription' : 'Traditional text typing answers'}
                    </span>
                  </div>
                </div>
                <div className="pr-1.5">
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-all ${voiceMode ? 'bg-[#00d4ff]' : 'bg-[#21262d]'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-all ${voiceMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !title}
              className="w-full btn-neon btn-neon-primary flex items-center justify-center gap-2.5 !py-3.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                  <span>Configuring Gemini Platform Environment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-white" />
                  <span>Generate AI Interview Question</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
