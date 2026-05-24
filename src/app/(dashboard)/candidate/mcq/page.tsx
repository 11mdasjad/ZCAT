'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Clock, Trophy, Zap, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import toast from 'react-hot-toast';

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: 'CODING' | 'APTITUDE' | 'INTERVIEW' | 'MIXED';
  status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'ARCHIVED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  duration: number;
  totalMarks: number;
  passingMarks: number;
  tags: string[];
}

export default function MCQAssessmentsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [mcqTests, setMcqTests] = useState<Assessment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/assessments?limit=100');
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to load assessments');
      }

      const all: Assessment[] = json.data || [];
      // Filter for MCQ (APTITUDE type)
      const filtered = all.filter(
        (a) => a.type === 'APTITUDE' && (a.status === 'LIVE' || a.status === 'DRAFT')
      );
      setMcqTests(filtered);
    } catch (err: any) {
      console.error('Error fetching MCQ assessments:', err);
      setError(err.message || 'Unable to retrieve MCQ assessments.');
      toast.error('Failed to load MCQ assessments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleStartAssessment = async (test: Assessment) => {
    setActionLoadingId(test.id);
    try {
      const res = await fetch(`/api/v1/assessments/${test.id}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to load assessment details');
      }

      if (!json.data.questions || json.data.questions.length === 0) {
        toast.error('This MCQ assessment has no questions configured.');
        return;
      }

      toast.success(`Starting MCQ Assessment: ${test.title} 🚀`);
      router.push(`/candidate/tests/${test.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to start exam workspace');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return <ZCATLoader message="Loading MCQ Assessments..." fullScreen />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#10b981]" /> MCQ Assessments
        </h1>
        <p className="text-sm text-[#8b949e] mt-1">
          Multiple choice quizzes on various technical topics, logical thinking, and aptitude.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {mcqTests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-12 border border-[#21262d] text-center max-w-xl mx-auto space-y-4"
        >
          <FileText className="w-12 h-12 text-[#8b949e] mx-auto opacity-60" />
          <div>
            <h3 className="text-lg font-semibold text-white">No MCQ Assessments Available</h3>
            <p className="text-[#8b949e] text-xs mt-1 leading-relaxed">
              There are currently no live Multiple Choice exams configured in the library. Recruiter and administrators can add new MCQ questions in the Question Bank and schedule assessments.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mcqTests.map((test, i) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-5 border-l-4 border-l-[#10b981] relative overflow-hidden group hover:border-[#30363d] transition-all flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileText className="w-16 h-16 text-[#10b981]" />
              </div>
              <div className="relative z-10 flex-1">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] font-semibold uppercase tracking-wider">
                    {test.status === 'DRAFT' ? 'DEV / PLAY' : 'LIVE NOW'}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#8b949e] uppercase font-mono">
                    MCQ
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-[#10b981] transition-colors">{test.title}</h3>
                <p className="text-xs text-[#8b949e] mb-4 line-clamp-2 leading-relaxed">{test.description}</p>
                
                <div className="flex items-center gap-4 text-[10px] text-[#c9d1d9] mb-5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#8b949e]" /> {test.duration} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-[#8b949e]" /> {test.totalMarks} Marks
                  </span>
                  {test.difficulty && (
                    <span className="uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/15">
                      {test.difficulty}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleStartAssessment(test)}
                disabled={actionLoadingId === test.id}
                className="btn-neon bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/25 w-full text-xs py-2 flex items-center justify-center gap-2 relative z-10 disabled:opacity-50"
              >
                {actionLoadingId === test.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#10b981]" />
                ) : (
                  <>Start Assessment <ChevronRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
