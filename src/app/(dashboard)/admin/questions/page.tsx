'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Code2, FileText, Edit, Trash2, Copy, X, Loader2,
  Save, Tag, Clock, Cpu, CheckCircle, AlertCircle, ChevronDown, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ZCATLoader from '@/components/shared/ZCATLoader';

interface Question {
  id: string;
  title: string;
  slug: string;
  type: string;
  difficulty: string;
  tags: string[];
  successRate: number | null;
  totalAttempts: number;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
}

const difficultyColors: Record<string, string> = {
  EASY: 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20',
  MEDIUM: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
  HARD: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20',
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'CODING' | 'MCQ' | 'DESCRIPTIVE'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'EASY' | 'MEDIUM' | 'HARD'>('all');

  // Add Question Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newQ, setNewQ] = useState({
    title: '',
    description: '',
    type: 'CODING',
    difficulty: 'MEDIUM',
    tags: [] as string[],
    tagInput: '',
    timeLimit: 5000,
    memoryLimit: 256,
    constraints: '',
    solution: '',
    isPublic: true,
    testCases: [] as any[],
  });
  const [generating, setGenerating] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/questions?limit=100');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.data?.questions || data.data || []);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAddQuestion = async () => {
    if (!newQ.title.trim() || !newQ.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    setSaving(true);
    try {
      const slug = newQ.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + '-' + Date.now().toString(36);

      const body = {
        title: newQ.title,
        slug,
        description: newQ.description,
        type: newQ.type,
        difficulty: newQ.difficulty,
        tags: newQ.tags,
        timeLimit: newQ.timeLimit,
        memoryLimit: newQ.memoryLimit,
        constraints: newQ.constraints ? [newQ.constraints] : [],
        solution: newQ.solution || undefined,
        isPublic: newQ.isPublic,
        isActive: true,
        supportedLangs: newQ.type === 'CODING' ? ['PYTHON', 'JAVASCRIPT', 'JAVA', 'CPP'] : [],
        testCases: newQ.testCases,
      };

      const res = await fetch('/api/v1/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to create question');
      }

      toast.success('Question created successfully!');
      setShowAddModal(false);
      setNewQ({
        title: '', description: '', type: 'CODING', difficulty: 'MEDIUM',
        tags: [], tagInput: '', timeLimit: 5000, memoryLimit: 256,
        constraints: '', solution: '', isPublic: true,
        testCases: [],
      });
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create question');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!newQ.title.trim()) {
      toast.error('Please enter a title first');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/v1/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newQ.title, type: newQ.type }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'AI generation failed');
      }

      const data = await res.json();
      const generated = data.data;

      setNewQ({
        ...newQ,
        description: generated.description,
        difficulty: generated.difficulty,
        tags: generated.tags,
        timeLimit: generated.timeLimit,
        memoryLimit: generated.memoryLimit,
        constraints: generated.constraints?.join('\n') || '',
        testCases: generated.testCases,
      });

      toast.success('AI magic complete! Content generated.', {
        icon: '✨',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate content. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/v1/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Question deleted');
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      } else {
        toast.error('Failed to delete question');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const addTag = () => {
    const tag = newQ.tagInput.trim().toLowerCase();
    if (tag && !newQ.tags.includes(tag)) {
      setNewQ({ ...newQ, tags: [...newQ.tags, tag], tagInput: '' });
    }
  };

  const removeTag = (tag: string) => {
    setNewQ({ ...newQ, tags: newQ.tags.filter((t) => t !== tag) });
  };

  const filtered = questions.filter((q) => {
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && q.type !== typeFilter) return false;
    if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
    return true;
  });

  if (loading) {
    return <ZCATLoader message="Loading question bank..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Question Bank</h1>
          <p className="text-sm text-[#8b949e] mt-1">
            {questions.length} questions in library. Create, edit, and manage assessment questions.
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-neon btn-neon-primary text-sm flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions..." className="input-neon w-full !pl-10" />
        </div>
        <div className="flex gap-2">
          {(['all', 'CODING', 'MCQ', 'DESCRIPTIVE'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${
              typeFilter === t ? 'bg-[#0066ff]/10 text-[#00d4ff] border-[#0066ff]/30' : 'bg-[#161b22]/50 text-[#8b949e] border-[#21262d]'
            }`}>{t === 'all' ? 'All' : t}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
            <button key={d} onClick={() => setDifficultyFilter(d)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
              difficultyFilter === d
                ? d === 'EASY' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30'
                : d === 'MEDIUM' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30'
                : d === 'HARD' ? 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30'
                : 'bg-[#0066ff]/10 text-[#00d4ff] border-[#0066ff]/30'
                : 'bg-[#161b22]/50 text-[#8b949e] border-[#21262d]'
            }`}>{d === 'all' ? 'All' : d.charAt(0) + d.slice(1).toLowerCase()}</button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-[#30363d] transition-all">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                q.type === 'MCQ' ? 'bg-[#a855f7]/10 border border-[#a855f7]/20' :
                q.type === 'DESCRIPTIVE' ? 'bg-[#f59e0b]/10 border border-[#f59e0b]/20' :
                'bg-[#00d4ff]/10 border border-[#00d4ff]/20'
              }`}>
                {q.type === 'MCQ' ? <FileText className="w-5 h-5 text-[#a855f7]" /> :
                 q.type === 'DESCRIPTIVE' ? <FileText className="w-5 h-5 text-[#f59e0b]" /> :
                 <Code2 className="w-5 h-5 text-[#00d4ff]" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white">{q.title}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[q.difficulty] || difficultyColors.MEDIUM}`}>
                    {q.difficulty.toLowerCase()}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#161b22] text-[#484f58] border border-[#21262d]">{q.type}</span>
                  {q.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-[#161b22] text-[#484f58]">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs text-[#484f58]">
                <span>{q.totalAttempts} attempts</span>
                {q.successRate !== null && <span>{q.successRate.toFixed(0)}% success</span>}
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all" title="Edit">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#a855f7] hover:bg-[#a855f7]/10 transition-all" title="Duplicate">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <Code2 className="w-10 h-10 text-[#484f58] mx-auto mb-3" />
            <p className="text-sm text-[#8b949e]">{search || typeFilter !== 'all' || difficultyFilter !== 'all' ? 'No questions match your filters' : 'No questions yet'}</p>
            <button onClick={() => setShowAddModal(true)} className="text-xs text-[#00d4ff] hover:underline mt-2 inline-block">Add your first question</button>
          </div>
        )}
      </div>

      {/* ═══ Add Question Modal ═══ */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#21262d]">
                <div>
                  <h2 className="text-lg font-bold text-white">Add New Question</h2>
                  <p className="text-xs text-[#484f58] mt-1">Fill in the details to create a new question.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/[0.06] transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Question Title *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newQ.title}
                      onChange={(e) => setNewQ({ ...newQ, title: e.target.value })}
                      className="input-neon flex-1"
                      placeholder="e.g. Two Sum, Valid Parentheses..."
                    />
                    <button
                      onClick={handleGenerateAI}
                      disabled={generating || !newQ.title.trim()}
                      className="btn-neon bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20 hover:bg-[#a855f7]/20 !py-2.5 !px-3 disabled:opacity-40"
                      title="Generate with Gemini AI"
                    >
                      {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Type & Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Type</label>
                    <select
                      value={newQ.type}
                      onChange={(e) => setNewQ({ ...newQ, type: e.target.value })}
                      className="input-neon w-full"
                    >
                      <option value="CODING">Coding</option>
                      <option value="MCQ">Multiple Choice</option>
                      <option value="DESCRIPTIVE">Descriptive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Difficulty</label>
                    <select
                      value={newQ.difficulty}
                      onChange={(e) => setNewQ({ ...newQ, difficulty: e.target.value })}
                      className="input-neon w-full"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Description / Problem Statement *</label>
                  <textarea
                    value={newQ.description}
                    onChange={(e) => setNewQ({ ...newQ, description: e.target.value })}
                    rows={5}
                    className="input-neon w-full resize-none"
                    placeholder="Write the complete problem statement here. Supports markdown..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newQ.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#161b22] border border-[#21262d] text-xs text-[#8b949e]">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-[#484f58] hover:text-[#ef4444]">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newQ.tagInput}
                      onChange={(e) => setNewQ({ ...newQ, tagInput: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="input-neon flex-1"
                      placeholder="Add tag (press Enter)..."
                    />
                    <button onClick={addTag} className="btn-neon btn-neon-secondary !py-2 !px-3 text-sm">
                      <Tag className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Limits */}
                {newQ.type === 'CODING' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#8b949e] mb-1.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Time Limit (ms)
                      </label>
                      <input
                        type="number"
                        value={newQ.timeLimit}
                        onChange={(e) => setNewQ({ ...newQ, timeLimit: parseInt(e.target.value) || 0 })}
                        className="input-neon w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8b949e] mb-1.5 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" /> Memory Limit (MB)
                      </label>
                      <input
                        type="number"
                        value={newQ.memoryLimit}
                        onChange={(e) => setNewQ({ ...newQ, memoryLimit: parseInt(e.target.value) || 0 })}
                        className="input-neon w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Constraints */}
                <div>
                  <label className="block text-sm font-medium text-[#8b949e] mb-1.5">Constraints</label>
                  <textarea
                    value={newQ.constraints}
                    onChange={(e) => setNewQ({ ...newQ, constraints: e.target.value })}
                    className="input-neon w-full h-20 resize-none"
                    placeholder="e.g. 1 <= n <= 10^5"
                  />
                </div>

                {/* Test Cases Preview */}
                {newQ.testCases.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-[#8b949e]">
                      Generated Test Cases ({newQ.testCases.length})
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {newQ.testCases.map((tc, idx) => (
                        <div key={idx} className="bg-[#161b22] border border-[#21262d] rounded-lg p-3 text-[10px]">
                          <div className="flex justify-between items-center mb-1">
                            <span className={tc.isSample ? "text-[#00d4ff]" : "text-[#8b949e]"}>
                              {tc.isSample ? 'Sample' : tc.isHidden ? 'Hidden' : 'Standard'}
                            </span>
                            <span className="text-[#484f58]">Case #{idx + 1}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[#484f58] uppercase mb-1">Input</p>
                              <code className="block p-1.5 bg-black/40 rounded text-white overflow-x-auto">{tc.input}</code>
                            </div>
                            <div>
                              <p className="text-[#484f58] uppercase mb-1">Output</p>
                              <code className="block p-1.5 bg-black/40 rounded text-white overflow-x-auto">{tc.expectedOutput}</code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visibility */}
                <div className="flex items-center justify-between bg-[#161b22] rounded-xl p-4 border border-[#21262d]">
                  <div>
                    <p className="text-sm font-medium text-white">Public Visibility</p>
                    <p className="text-xs text-[#484f58] mt-0.5">Allow candidates to see this question in practice mode</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={newQ.isPublic} onChange={(e) => setNewQ({ ...newQ, isPublic: e.target.checked })} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#21262d] peer-checked:bg-[#0066ff] rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-full" />
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-[#21262d]">
                <button onClick={() => setShowAddModal(false)} className="btn-neon btn-neon-secondary !py-2 !px-5 text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleAddQuestion}
                  disabled={saving || !newQ.title.trim() || !newQ.description.trim()}
                  className="btn-neon btn-neon-primary !py-2 !px-5 text-sm flex items-center gap-2 disabled:opacity-40"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Creating...' : 'Create Question'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
