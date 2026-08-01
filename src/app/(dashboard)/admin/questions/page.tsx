'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Trash2, Edit3, Eye, Code2, HelpCircle, X, PlusCircle, Check, AlertCircle } from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import toast from 'react-hot-toast';

interface TestCase {
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

interface Question {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: 'CODING' | 'MCQ' | 'DESCRIPTIVE';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit: number;
  memoryLimit: number;
  marks: number;
  tags: string[];
  options?: string[];
  testCases?: TestCase[];
  solutionCode?: string;
  isPublic: boolean;
}

const difficultyColors = {
  EASY: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  HARD: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'CODING' | 'MCQ' | 'DESCRIPTIVE'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'EASY' | 'MEDIUM' | 'HARD'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [newQ, setNewQ] = useState<Partial<Question>>({
    title: '',
    description: '',
    type: 'CODING',
    difficulty: 'MEDIUM',
    timeLimit: 2000,
    memoryLimit: 256,
    marks: 10,
    tags: [],
    options: ['', '', '', ''],
    testCases: [{ input: '', expectedOutput: '', isSample: true }],
    solutionCode: '',
    isPublic: true,
  });
  const [tagInput, setTagInput] = useState('');

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/questions?limit=100');
      const data = await res.json();
      if (data.success && data.data && data.data.questions) {
        setQuestions(data.data.questions);
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      toast.error('Failed to load question bank');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.title || !newQ.description) {
      toast.error('Please fill in title and description');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/v1/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQ),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create question');
      }

      toast.success('Question created successfully!');
      setShowAddModal(false);
      fetchQuestions();
      // Reset form
      setNewQ({
        title: '',
        description: '',
        type: 'CODING',
        difficulty: 'MEDIUM',
        timeLimit: 2000,
        memoryLimit: 256,
        marks: 10,
        tags: [],
        options: ['', '', '', ''],
        testCases: [{ input: '', expectedOutput: '', isSample: true }],
        solutionCode: '',
        isPublic: true,
      });
    } catch (err: any) {
      toast.error(err.message || 'Error creating question');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/v1/questions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to delete');
      }
      toast.success('Question deleted');
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newQ.tags?.includes(tagInput.trim())) {
      setNewQ({ ...newQ, tags: [...(newQ.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setNewQ({ ...newQ, tags: newQ.tags?.filter((t) => t !== tag) });
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
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Question Bank</h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            {questions.length} questions in library. Create, edit, and manage assessment questions.
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-neon btn-neon-primary text-sm font-bold flex items-center gap-2 self-start shadow-md cursor-pointer">
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="input-neon w-full !pl-10 text-sm font-medium"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'CODING', 'MCQ', 'DESCRIPTIVE'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                typeFilter === t
                  ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {filtered.map((q) => {
          const dc = difficultyColors[q.difficulty] || difficultyColors.MEDIUM;
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-5 border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-bold text-slate-900 truncate">{q.title}</h3>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${dc.bg} ${dc.text} ${dc.border}`}>
                    {q.difficulty}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono">
                    {q.type}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium line-clamp-1 mb-3">{q.description}</p>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span>{q.marks} Marks</span>
                  <span>{q.timeLimit}ms</span>
                  <div className="flex gap-1">
                    {q.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setViewingQuestion(q)}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="View Details"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewingQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">{viewingQuestion.title}</h3>
                <button onClick={() => setViewingQuestion(null)} className="p-1 rounded-lg text-slate-500 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed font-medium">
                <p>{viewingQuestion.description}</p>
                {viewingQuestion.options && viewingQuestion.options.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase text-slate-500">Options</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {viewingQuestion.options.map((opt, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-semibold">
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
