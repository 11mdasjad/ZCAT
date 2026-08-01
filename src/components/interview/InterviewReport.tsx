'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, ArrowLeft, Award, TrendingUp, AlertCircle,
  CheckCircle2, AlertTriangle, BookOpen, Clock, FileText,
  Star, ChevronDown, ChevronUp, Printer, MessageSquare, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList
} from 'recharts';

interface Question {
  id: string;
  question: string;
  category: string;
  order: number;
}

interface Response {
  id: string;
  questionId: string;
  response: string;
  score: number | null;
  feedback: string | null;
}

interface ParsedFeedback {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvementAreas: string[];
}

interface ReportProps {
  sessionId: string;
  onBack: () => void;
}

export default function InterviewReport({ sessionId, onBack }: ReportProps) {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const response = await fetch(`/api/v1/interviews/${sessionId}`);
        if (!response.ok) throw new Error('Failed to load interview feedback report');
        const data = await response.json();
        setSession(data.data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin" />
        <p className="text-sm font-medium text-[#64748b]">Compiling Gemini diagnostic report...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#dc2626] mx-auto" />
        <h3 className="text-xl font-bold text-[#0f172a]">Error Loading Report</h3>
        <p className="text-sm text-[#64748b]">{error || 'Could not locate session details.'}</p>
        <button onClick={onBack} className="btn-neon btn-neon-secondary !py-2 !px-6 text-xs font-semibold cursor-pointer">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { title, startedAt, overallScore, parsedFeedback, questions = [], responses = [] } = session;

  const scoreData = questions.map((q: Question) => {
    const resp = responses.find((r: Response) => r.questionId === q.id);
    return {
      name: `Q${q.order}`,
      Score: resp ? Math.round((resp.score || 0) * 10) : 0,
      topic: q.category,
    };
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#059669]';
    if (score >= 70) return 'text-[#2563eb]';
    if (score >= 50) return 'text-[#d97706]';
    return 'text-[#dc2626]';
  };

  const strengthsList = parsedFeedback?.strengths || ['Strong conceptual understanding'];
  const improvementsList = parsedFeedback?.improvementAreas || ['Include code complexity details in answers'];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back to Dashboard link */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-[#64748b] hover:text-[#2563eb] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-xs font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Save PDF / Print
        </button>
      </div>

      {/* Main Scorecard Banner */}
      <div className="glass-card rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center border border-[#e2e8f0] bg-white shadow-sm">
        <div className="flex flex-col items-center justify-center text-center space-y-3 md:border-r md:border-[#e2e8f0] md:pr-6">
          {/* Radial score orb */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e2e8f0"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#gradientScore)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (overallScore || 0) / 100)}`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-[#0f172a]">{overallScore || 0}%</span>
              <p className="text-[10px] text-[#64748b] uppercase font-bold tracking-wider">Overall Score</p>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-[#0f172a] text-base">{title}</h3>
            <span className="text-xs text-[#64748b] font-medium">
              Completed on {new Date(startedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Diagnostic Assessment Summary Text */}
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] text-[#2563eb] font-extrabold uppercase tracking-wider block">Diagnostic Summary</span>
            <h4 className="text-lg font-bold text-[#0f172a]">Gemini Performance Analysis</h4>
          </div>
          <p className="text-sm text-[#64748b] leading-relaxed font-medium">
            {parsedFeedback?.summary || 'You successfully concluded the placement mock interview round. You demonstrated strong critical thinking, although structured answers in coding principles could be improved.'}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[#059669] font-bold">
              Ready: Medium
            </span>
            <span className="text-xs px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-[#2563eb] font-bold">
              Placement Prep Complete
            </span>
          </div>
        </div>
      </div>

      {/* Strengths and Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="glass-card rounded-2xl p-5 border border-[#e2e8f0] bg-gradient-to-br from-white to-emerald-50/40 shadow-xs">
          <h4 className="text-sm font-bold text-[#0f172a] flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-[#059669]" /> Key Strengths
          </h4>
          <ul className="space-y-2.5">
            {strengthsList.map((strength: string, i: number) => (
              <li key={i} className="text-sm text-[#0f172a] flex items-start gap-2.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] mt-2 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvement Areas */}
        <div className="glass-card rounded-2xl p-5 border border-[#e2e8f0] bg-gradient-to-br from-white to-amber-50/40 shadow-xs">
          <h4 className="text-sm font-bold text-[#0f172a] flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-[#d97706]" /> Areas for Improvement
          </h4>
          <ul className="space-y-2.5">
            {improvementsList.map((gap: string, i: number) => (
              <li key={i} className="text-sm text-[#0f172a] flex items-start gap-2.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] mt-2 flex-shrink-0" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chart Question Scores */}
      <div className="glass-card rounded-2xl p-5 border border-[#e2e8f0] bg-white shadow-sm">
        <h4 className="text-sm font-bold text-[#0f172a] flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#2563eb]" /> Question-by-Question Progression
        </h4>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: '#0f172a',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              />
              <Bar dataKey="Score" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40}>
                <LabelList dataKey="Score" position="top" fill="#0f172a" fontSize={10} formatter={(val: any) => `${val}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Question breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#64748b]" /> Detailed Question Breakdown
        </h3>

        <div className="space-y-3">
          {questions.map((question: Question, index: number) => {
            const resp = responses.find((r: Response) => r.questionId === question.id);
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={question.id}
                className="glass-card rounded-xl overflow-hidden border border-[#e2e8f0] bg-white shadow-xs"
              >
                {/* Header */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                  className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all select-none"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-[#64748b] flex items-center justify-center font-bold text-xs">
                      Q{question.order}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#0f172a] truncate max-w-sm md:max-w-xl">
                        {question.question}
                      </p>
                      <span className="text-[10px] text-[#64748b] font-medium">{question.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    {resp && (
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded bg-slate-100 ${getScoreColor((resp.score || 0) * 10)}`}>
                        {resp.score !== null ? `${resp.score.toFixed(1)}/10` : 'N/A'}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#64748b]" /> : <ChevronDown className="w-4 h-4 text-[#64748b]" />}
                  </div>
                </div>

                {/* Body Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[#e2e8f0] pt-4 space-y-4 animate-fade-in text-sm leading-relaxed">
                    {/* User Transcript */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider block">Your Transcript</span>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-[#e2e8f0] text-[#0f172a] font-medium">
                        {resp?.response || '(No response recorded)'}
                      </div>
                    </div>

                    {/* Feedback */}
                    {(() => {
                      let displayFeedback = resp?.feedback || '';
                      let modelAnswerText = '';
                      
                      if (displayFeedback.includes('**Ideal Model Response:**')) {
                        const parts = displayFeedback.split('**Ideal Model Response:**');
                        displayFeedback = parts[0].trim();
                        modelAnswerText = parts[1].trim();
                      }
                      
                      return (
                        <>
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-[#2563eb] font-bold uppercase tracking-wider block">AI Evaluator Feedback</span>
                            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-[#0f172a] font-medium">
                              {displayFeedback || 'Gemini score pending.'}
                            </div>
                          </div>

                          {modelAnswerText && (
                            <div className="space-y-2">
                              <span className="text-[10px] text-[#7c3aed] font-bold uppercase tracking-wider block flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-[#7c3aed]/30" /> Recommended Ideal Response
                              </span>
                              <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 text-[#0f172a] text-xs whitespace-pre-wrap leading-relaxed font-mono font-medium">
                                {modelAnswerText}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center pt-4">
        <button onClick={onBack} className="btn-neon btn-neon-primary !py-3 !px-10 text-sm font-semibold cursor-pointer shadow-md">
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
