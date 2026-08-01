'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Code2, Calendar, Trophy, Zap, ChevronRight, AlertCircle } from 'lucide-react';
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
  startTime?: string;
  endTime?: string;
  tags: string[];
}

const categories = [
  { id: 'coding', title: 'Coding Challenges', icon: Code2, color: '#2563eb', count: 'Active', desc: 'Algorithmic problems and data structures.' },
];

export default function TestsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTests, setActiveTests] = useState<Assessment[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<Assessment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [sessionStatuses, setSessionStatuses] = useState<Record<string, 'COMPLETED' | 'TERMINATED'>>({});

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);

      const [assessmentsRes, historyRes] = await Promise.all([
        fetch('/api/v1/assessments?limit=100'),
        fetch('/api/v1/candidate/history'),
      ]);

      const json = await assessmentsRes.json();

      if (!assessmentsRes.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to load assessments');
      }

      const allAssessments: Assessment[] = json.data || [];

      const active = allAssessments.filter(
        (a) => a.status === 'LIVE' || a.status === 'DRAFT'
      );
      const upcoming = allAssessments.filter(
        (a) => a.status === 'SCHEDULED'
      );

      setActiveTests(active);
      setUpcomingTests(upcoming);

      if (historyRes.ok) {
        const historyJson = await historyRes.json();
        if (historyJson.success && historyJson.data) {
          const statusMap: Record<string, 'COMPLETED' | 'TERMINATED'> = {};
          historyJson.data.forEach((entry: any) => {
            if (entry.assessmentId && (entry.status === 'COMPLETED' || entry.status === 'TERMINATED')) {
              statusMap[entry.assessmentId] = entry.status;
            }
          });
          setSessionStatuses(statusMap);
        }
      }
    } catch (err: any) {
      console.error('Error fetching assessments:', err);
      setError(err.message || 'Something went wrong while loading assessments.');
      toast.error('Failed to load assessments');
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

      const assessmentDetails = json.data;
      if (!assessmentDetails.questions || assessmentDetails.questions.length === 0) {
        toast.error('This assessment has no questions configured yet.');
        return;
      }

      toast.success(`Starting ${test.type} Assessment: ${test.title} 🚀`);
      router.push(`/candidate/tests/${test.id}`);
    } catch (err: any) {
      console.error('Failed to launch exam:', err);
      toast.error(err.message || 'Failed to start exam workspace');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return <ZCATLoader message="Loading Tests Hub..." fullScreen />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Tests Hub</h1>
          <p className="text-slate-600 font-medium">Your centralized portal for all assessments and challenges.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
          <Link href="/candidate/leaderboard" className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 text-slate-900 bg-white hover:bg-slate-50 transition-colors border border-slate-300 shadow-xs cursor-pointer">
            <Trophy className="w-4 h-4 text-amber-600" /> View Leaderboard
          </Link>
        </motion.div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 flex items-center gap-3 text-red-700 font-medium text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Active Tests */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-red-600" />
          <h2 className="text-xl font-extrabold text-slate-900">Active Tests</h2>
        </div>

        {activeTests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-8 border border-slate-200 bg-white shadow-xs text-center max-w-2xl mx-auto"
          >
            <Zap className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Tests Available</h3>
            <p className="text-slate-600 text-sm mb-4 font-medium">
              There are currently no active tests in the database. Head over to the Recruiter Dashboard to auto-generate a coding or MCQ assessment using AI!
            </p>
            <Link
              href="/admin/assessments/create"
              className="btn-neon btn-neon-primary inline-flex items-center gap-2 text-sm py-2 px-4 font-bold shadow-md"
            >
              Create Assessment <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTests.map((test, i) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl p-5 border-l-4 border-l-red-600 border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative z-10 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold uppercase tracking-wider border border-red-200">
                      {test.status === 'DRAFT' ? 'DEV / PLAY' : 'LIVE NOW'}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold uppercase font-mono">
                      {test.type === 'APTITUDE' ? 'MCQ' : test.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2 line-clamp-1">{test.title}</h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2 font-medium leading-relaxed">{test.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 mb-5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> {test.duration} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-slate-500" /> {test.totalMarks} Marks
                    </span>
                    {test.difficulty && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800">
                        {test.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                {(() => {
                  const sessionStatus = sessionStatuses[test.id];
                  if (sessionStatus === 'COMPLETED') {
                    return (
                      <button
                        disabled
                        className="w-full text-sm py-2 flex items-center justify-center gap-2 relative z-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold cursor-not-allowed"
                      >
                        ✓ Submitted
                      </button>
                    );
                  }
                  if (sessionStatus === 'TERMINATED') {
                    return (
                      <button
                        disabled
                        className="w-full text-sm py-2 flex items-center justify-center gap-2 relative z-10 rounded-lg bg-red-50 border border-red-200 text-red-700 font-bold cursor-not-allowed"
                      >
                        ✕ Disqualified
                      </button>
                    );
                  }
                  return (
                    <button
                      onClick={() => handleStartAssessment(test)}
                      disabled={actionLoadingId === test.id}
                      className="btn-neon btn-neon-primary w-full text-sm py-2.5 flex items-center justify-center gap-2 relative z-10 disabled:opacity-50 font-bold shadow-md cursor-pointer"
                    >
                      {actionLoadingId === test.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Start Assessment'
                      )}
                    </button>
                  );
                })()}
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-xl font-extrabold text-slate-900 mb-4">Explore Categories</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
              >
                <div className="p-6 rounded-xl block group border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-200 text-blue-600">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-900 text-white">{cat.count}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{cat.title}</h3>
                  <p className="text-sm text-slate-600 font-medium mb-4">{cat.desc}</p>
                  <div className="flex items-center text-sm font-bold text-blue-600 mt-auto cursor-pointer">
                    Explore <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Upcoming Tests */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-extrabold text-slate-900">Upcoming Schedules</h2>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-200">
            {upcomingTests.length === 0 ? (
              <div className="p-8 text-center text-slate-600">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50 text-slate-400" />
                <p className="text-sm font-medium">No upcoming scheduled assessments found.</p>
              </div>
            ) : (
              upcomingTests.map((test, i) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-xs text-slate-500 uppercase font-bold">OCT</span>
                      <span className="text-xl font-extrabold text-blue-600">20</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-slate-900">{test.title}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-100 border-slate-200 text-slate-700 font-bold uppercase tracking-wider">{test.type}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Upcoming Session</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {test.duration} mins</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleStartAssessment(test)}
                      className="btn-neon btn-neon-secondary px-4 py-2 text-sm w-full md:w-auto font-bold cursor-pointer"
                    >
                      Pre-Register
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
