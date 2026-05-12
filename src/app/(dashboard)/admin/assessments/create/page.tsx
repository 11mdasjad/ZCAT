'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, FileText, Code2, Clock, Settings, Plus, Trash2, CheckCircle } from 'lucide-react';

const steps = ['Basic Info', 'Questions', 'Settings', 'Review'];

export default function CreateAssessmentPage() {
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([
    { id: 1, title: '', type: 'coding' as const, difficulty: 'medium' as const },
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Create Assessment</h1>
        <p className="text-sm text-[#8b949e] mt-1">Set up a new assessment for candidates.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
              i <= step ? 'bg-gradient-to-r from-[#0066ff] to-[#7c3aed] text-white' : 'bg-[#161b22] text-[#484f58] border border-[#21262d]'
            }`}>{i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}</div>
            <span className={`text-xs hidden sm:block ${i <= step ? 'text-white' : 'text-[#484f58]'}`}>{s}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-[#0066ff]' : 'bg-[#21262d]'}`} />}
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-6">
        {step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Assessment Title</label>
              <input type="text" placeholder="e.g., Full Stack Developer Assessment" className="input-neon w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Description</label>
              <textarea rows={3} placeholder="Describe the assessment..." className="input-neon w-full resize-none" />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Type</label>
                <select className="input-neon w-full">
                  <option value="coding">Coding Test</option>
                  <option value="aptitude">Aptitude Test</option>
                  <option value="mixed">Mixed</option>
                  <option value="interview">AI Interview</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Difficulty</label>
                <select className="input-neon w-full">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Duration (minutes)</label>
                <input type="number" placeholder="120" className="input-neon w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Tags</label>
                <input type="text" placeholder="react, node.js, sql" className="input-neon w-full" />
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">Questions ({questions.length})</h3>
              <button onClick={() => setQuestions([...questions, { id: questions.length + 1, title: '', type: 'coding', difficulty: 'medium' }])}
                className="btn-neon btn-neon-secondary !py-1.5 !px-3 text-xs flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Question
              </button>
            </div>
            {questions.map((q, i) => (
              <div key={q.id} className="bg-[#161b22]/50 rounded-xl p-4 border border-[#21262d] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#8b949e]">Question {i + 1}</span>
                  <button onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))} className="text-[#484f58] hover:text-[#ef4444] transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input type="text" placeholder="Question title" className="input-neon w-full text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <select className="input-neon text-sm">
                    <option value="coding">Coding</option>
                    <option value="mcq">MCQ</option>
                    <option value="subjective">Subjective</option>
                  </select>
                  <select className="input-neon text-sm">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <h3 className="text-sm font-semibold text-white">Exam Settings</h3>
            <div className="space-y-4">
              {[
                { label: 'Enable AI Proctoring', desc: 'Face detection, tab monitoring, and audio analysis' },
                { label: 'Anti Copy-Paste', desc: 'Prevent candidates from copying/pasting code' },
                { label: 'Browser Lockdown', desc: 'Full-screen mode with tab switch detection' },
                { label: 'Randomize Questions', desc: 'Show questions in random order for each candidate' },
                { label: 'Show Score After Completion', desc: 'Display score immediately after submission' },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#161b22]/50 border border-[#21262d]">
                  <div>
                    <p className="text-sm text-white">{setting.label}</p>
                    <p className="text-xs text-[#484f58]">{setting.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#21262d] peer-checked:bg-[#0066ff] rounded-full peer-focus:ring-2 peer-focus:ring-[#0066ff]/20 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Publish!</h3>
            <p className="text-sm text-[#8b949e] max-w-md mx-auto">Review your assessment details and click publish to make it available to candidates.</p>
          </motion.div>
        )}

        <div className="flex gap-3 mt-6 pt-6 border-t border-[#21262d]">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn-neon btn-neon-secondary flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button onClick={() => step < 3 ? setStep(step + 1) : null} className="btn-neon btn-neon-primary flex-1 flex items-center justify-center gap-2 text-sm">
            {step < 3 ? <>Next <ArrowRight className="w-4 h-4" /></> : <>Publish Assessment <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
