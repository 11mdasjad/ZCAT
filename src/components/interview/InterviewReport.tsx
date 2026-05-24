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
        <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
        <p className="text-sm text-[#8b949e]">Compiling Gemini diagnostic report...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#ef4444] mx-auto" />
        <h3 className="text-xl font-bold text-white">Error Loading Report</h3>
        <p className="text-sm text-[#8b949e]">{error || 'Could not locate session details.'}</p>
        <button onClick={onBack} className="btn-neon btn-neon-secondary !py-2 !px-6 text-xs">
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
      Score: resp ? Math.round((resp.score || 0) * 10) : 0, // scale out of 100
      topic: q.category,
    };
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#10b981]';
    if (score >= 70) return 'text-[#00d4ff]';
    if (score >= 50) return 'text-[#f59e0b]';
    return 'text-[#ef4444]';
  };

  const strengthsList = parsedFeedback?.strengths || ['Strong conceptual understanding'];
  const improvementsList = parsedFeedback?.improvementAreas || ['Include code complexity details in answers'];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back to Dashboard link */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-[#8b949e] hover:text-[#00d4ff] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-xs font-semibold text-[#8b949e] hover:text-white transition-colors"
        >
          <Printer className="w-4 h-4" /> Save PDF / Print
        </button>
      </div>

      {/* Main Scorecard Banner */}
      <div className="glass-card rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center border border-[#21262d]">
        <div className="flex flex-col items-center justify-center text-center space-y-3 md:border-r md:border-[#21262d] md:pr-6">
          {/* Radial score orb */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG circle track */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#161b22"
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
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-white">{overallScore || 0}%</span>
              <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">Overall Score</p>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-white text-base">{title}</h3>
            <span className="text-xs text-[#8b949e]">
              Completed on {new Date(startedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Diagnostic Assessment Summary Text */}
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] text-[#00d4ff] font-extrabold uppercase tracking-wider block">Diagnostic Summary</span>
            <h4 className="text-lg font-bold text-white">Gemini Performance Analysis</h4>
          </div>
          <p className="text-sm text-[#8b949e] leading-relaxed">
            {parsedFeedback?.summary || 'You successfully concluded the placement mock interview round. You demonstrated strong critical thinking, although structured answers in coding principles could be improved.'}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/20 rounded-full text-[#10b981] font-semibold">
              Ready: Medium
            </span>
            <span className="text-xs px-3 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full text-[#00d4ff] font-semibold">
              Placement Prep Complete
            </span>
          </div>
        </div>
      </div>

      {/* Strengths and Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="glass-card rounded-2xl p-5 border border-[#21262d] bg-gradient-to-br from-[#0d1117] to-[#10b981]/5">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-[#10b981]" /> Key Strengths
          </h4>
          <ul className="space-y-2.5">
            {strengthsList.map((strength: string, i: number) => (
              <li key={i} className="text-sm text-[#e4e8f1] flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mt-2 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvement Areas */}
        <div className="glass-card rounded-2xl p-5 border border-[#21262d] bg-gradient-to-br from-[#0d1117] to-[#f59e0b]/5">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-[#f59e0b]" /> Areas for Improvement
          </h4>
          <ul className="space-y-2.5">
            {improvementsList.map((gap: string, i: number) => (
              <li key={i} className="text-sm text-[#e4e8f1] flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] mt-2 flex-shrink-0" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chart Question Scores */}
      <div className="glass-card rounded-2xl p-5 border border-[#21262d]">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#8b949e]" /> Question-by-Question Progression
        </h4>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="name" stroke="#8b949e" fontSize={11} />
              <YAxis stroke="#8b949e" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161b22',
                  border: '1px solid #21262d',
                  borderRadius: '8px',
                  color: '#e4e8f1',
                }}
              />
              <Bar dataKey="Score" fill="#00d4ff" radius={[4, 4, 0, 0]} barSize={40}>
                <LabelList dataKey="Score" position="top" fill="#e4e8f1" fontSize={10} formatter={(val: any) => `${val}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Question breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#8b949e]" /> Detailed Question Breakdown
        </h3>

        <div className="space-y-3">
          {questions.map((question: Question, index: number) => {
            const resp = responses.find((r: Response) => r.questionId === question.id);
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={question.id}
                className="glass-card rounded-xl overflow-hidden border border-[#21262d]"
              >
                {/* Header */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                  className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-[#161b22]/30 transition-all select-none"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-7 h-7 rounded-lg bg-[#161b22] text-[#8b949e] flex items-center justify-center font-bold text-xs">
                      Q{question.order}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white truncate max-w-sm md:max-w-xl">
                        {question.question}
                      </p>
                      <span className="text-[10px] text-[#8b949e] font-medium">{question.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    {resp && (
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded bg-[#161b22] ${getScoreColor((resp.score || 0) * 10)}`}>
                        {resp.score !== null ? `${resp.score.toFixed(1)}/10` : 'N/A'}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#8b949e]" /> : <ChevronDown className="w-4 h-4 text-[#8b949e]" />}
                  </div>
                </div>

                {/* Body Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[#21262d]/50 pt-4 space-y-4 animate-fade-in text-sm leading-relaxed">
                    {/* User Transcript */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-[#8b949e] font-bold uppercase tracking-wider block">Your Transcript</span>
                      <div className="p-3.5 bg-[#0d1117] rounded-xl border border-[#21262d] text-white">
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
                            <span className="text-[10px] text-[#00d4ff] font-bold uppercase tracking-wider block">AI Evaluator Feedback</span>
                            <div className="p-3.5 bg-[#0066ff]/5 rounded-xl border border-[#0066ff]/10 text-white">
                              {displayFeedback || 'Gemini score pending.'}
                            </div>
                          </div>

                          {modelAnswerText && (
                            <div className="space-y-2">
                              <span className="text-[10px] text-[#a855f7] font-bold uppercase tracking-wider block flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-[#a855f7]/30" /> Recommended Ideal Response
                              </span>
                              <div className="p-3.5 bg-[#a855f7]/5 rounded-xl border border-[#a855f7]/10 text-white text-xs whitespace-pre-wrap leading-relaxed font-mono">
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
        <button onClick={onBack} className="btn-neon btn-neon-primary !py-3 !px-10 text-sm">
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
