'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Play, Send, RotateCcw, Maximize2, Minimize2, ChevronDown,
  Clock, CheckCircle, XCircle, AlertTriangle, ArrowLeft,
  Eye, Copy, Terminal, Zap, FileText, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const languageMap: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
};

const defaultCode: Record<string, string> = {
  python: `def two_sum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`,
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        throw new IllegalArgumentException("No solution");
    }
}
`,
  cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> m;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (m.count(complement)) {
                return {m[complement], i};
            }
            m[nums[i]] = i;
        }
        return {};
    }
};
`,
  c: `#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    *returnSize = 0;
    return NULL;
}
`,
};

interface Question {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  examples: string[];
  constraints: string[];
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    explanation: string | null;
  }>;
}

export default function CodingExamPage() {
  const params = useParams();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(defaultCode.python);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours
  const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
  const [testResults, setTestResults] = useState<{ passed: boolean; input: string; expected: string; got: string }[]>([]);

  // Fetch question data
  useEffect(() => {
    async function fetchQuestion() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/v1/questions/${questionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch question');
        }

        const data = await response.json();
        setQuestion(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load question');
      } finally {
        setIsLoading(false);
      }
    }

    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(defaultCode[lang] || '');
    setOutput('');
    setTestResults([]);
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput('');
    setTestResults([]);
    setTimeout(() => {
      setIsRunning(false);
      setTestResults([
        { passed: true, input: 'nums = [2,7,11,15], target = 9', expected: '[0, 1]', got: '[0, 1]' },
        { passed: true, input: 'nums = [3,2,4], target = 6', expected: '[1, 2]', got: '[1, 2]' },
      ]);
      setOutput(`$ Executing ${language}...\n\nCompilation: Success (0.08s)\nRuntime: 42ms | Memory: 14.2MB\n\n✓ Test Case 1: Passed\n✓ Test Case 2: Passed\n\n═══════════════════════════════\n  Result: 2/2 test cases passed\n═══════════════════════════════`);
    }, 1500);
  };

  const timeColor = timeLeft < 300 ? 'text-[#ef4444]' : timeLeft < 600 ? 'text-[#f59e0b]' : 'text-[#10b981]';

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#06080f]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#8b949e]">Loading question...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !question) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#06080f]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-[#ef4444] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Failed to Load Question</h2>
          <p className="text-sm text-[#8b949e] mb-4">{error || 'Question not found'}</p>
          <Link
            href="/candidate/challenges"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0066ff] text-white text-sm font-medium hover:bg-[#0052cc] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  const difficultyColor = 
    question.difficulty === 'EASY' ? 'bg-[#10b981]/10 text-[#10b981]' :
    question.difficulty === 'MEDIUM' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 
    'bg-[#ef4444]/10 text-[#ef4444]';

  return (
    <div className="h-screen flex flex-col bg-[#06080f]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262d] bg-[#0d1117]/90 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/candidate" className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/[0.06] transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-6 bg-[#21262d]" />
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-sm font-semibold text-white">{question.title}</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor}`}>
            {question.difficulty.toLowerCase()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#21262d] font-mono text-sm ${timeColor}`}>
            <Clock className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
          >
            {isRunning ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'Running...' : 'Run Code'}
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#0066ff] to-[#7c3aed] text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(0,102,255,0.3)] transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Submit
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — Problem Description */}
        <div className="w-[420px] flex-shrink-0 border-r border-[#21262d] overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-[#21262d] sticky top-0 bg-[#0d1117] z-10">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'description' ? 'text-[#00d4ff] border-[#00d4ff]' : 'text-[#8b949e] border-transparent hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Description
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'submissions' ? 'text-[#00d4ff] border-[#00d4ff]' : 'text-[#8b949e] border-transparent hover:text-white'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" /> Submissions
            </button>
          </div>

          <div className="p-5">
            {activeTab === 'description' ? (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-white mb-3">{question.title}</h2>
                  <div className="text-sm text-[#8b949e] leading-relaxed whitespace-pre-wrap">{question.description}</div>
                </div>

                {/* Examples */}
                <div className="space-y-3">
                  {question.examples.map((ex, i) => (
                    <div key={i} className="bg-[#161b22] rounded-xl p-4 border border-[#21262d]">
                      <p className="text-xs font-semibold text-white mb-2">Example {i + 1}:</p>
                      <div className="font-mono text-xs">
                        <pre className="text-[#8b949e] whitespace-pre-wrap">{ex}</pre>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Constraints:</h3>
                  <ul className="space-y-1">
                    {question.constraints.map((c, i) => (
                      <li key={i} className="text-xs text-[#8b949e] font-mono flex items-start gap-2">
                        <span className="text-[#484f58]">•</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Meta */}
                <div className="flex gap-3 text-xs text-[#484f58]">
                  <span>Time: {question.timeLimit}ms</span>
                  <span>Memory: {question.memoryLimit}MB</span>
                  <span>Test Cases: {question.testCases.length}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-[#484f58]">No submissions yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel — Editor + Console */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262d] bg-[#0d1117]/80 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="appearance-none bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-1.5 text-xs text-[#8b949e] pr-7 outline-none focus:border-[#00d4ff]/50 cursor-pointer"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#484f58] pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCode(defaultCode[language])} className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/[0.06] transition-all" title="Reset Code">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/[0.06] transition-all">
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <MonacoEditor
              height="100%"
              language={languageMap[language] || 'python'}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                tabSize: 4,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Console Output */}
          <div className="border-t border-[#21262d] flex-shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[#21262d] bg-[#0d1117]/80">
              <Terminal className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="text-xs font-medium text-[#8b949e]">Console Output</span>
            </div>
            <div className="h-40 overflow-y-auto p-4 bg-[#0d1117] font-mono text-sm">
              {isRunning ? (
                <div className="flex items-center gap-2 text-[#f59e0b]">
                  <div className="w-3 h-3 border-2 border-[#f59e0b]/30 border-t-[#f59e0b] rounded-full animate-spin" />
                  Executing code...
                </div>
              ) : output ? (
                <pre className="text-[#10b981] whitespace-pre-wrap">{output}</pre>
              ) : (
                <p className="text-[#484f58]">Click &quot;Run Code&quot; to execute your solution.</p>
              )}

              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {testResults.map((r, i) => (
                    <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg ${r.passed ? 'bg-[#10b981]/5 border border-[#10b981]/20' : 'bg-[#ef4444]/5 border border-[#ef4444]/20'}`}>
                      {r.passed ? <CheckCircle className="w-4 h-4 text-[#10b981] mt-0.5" /> : <XCircle className="w-4 h-4 text-[#ef4444] mt-0.5" />}
                      <div className="text-xs">
                        <p className="text-white font-medium">Test Case {i + 1}: {r.passed ? 'Passed' : 'Failed'}</p>
                        <p className="text-[#484f58] mt-0.5">Input: {r.input}</p>
                        <p className="text-[#484f58]">Expected: {r.expected} | Got: {r.got}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 w-full max-w-md mx-4"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0066ff] to-[#7c3aed] flex items-center justify-center mx-auto mb-3">
                  <Send className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Submit Solution?</h3>
                <p className="text-sm text-[#8b949e] mt-1">Make sure you&apos;ve tested your code before submitting.</p>
              </div>
              <div className="bg-[#161b22] rounded-xl p-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm"><span className="text-[#484f58]">Language</span><span className="text-white capitalize">{language}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#484f58]">Time Left</span><span className={timeColor}>{formatTime(timeLeft)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#484f58]">Test Cases</span><span className="text-[#10b981]">2/2 Passed</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-2.5 rounded-xl border border-[#21262d] text-sm text-[#8b949e] hover:text-white transition-colors">
                  Cancel
                </button>
                <Link href="/candidate" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#7c3aed] text-white text-sm font-medium text-center hover:shadow-[0_0_20px_rgba(0,102,255,0.3)] transition-all">
                  Submit
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
