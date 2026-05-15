'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Play, Send, RotateCcw, ChevronDown, Clock, CheckCircle, XCircle,
  AlertTriangle, ArrowLeft, Copy, Terminal, Zap, FileText, Info,
  FlaskConical, ListChecks,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ZCATLoader from '@/components/shared/ZCATLoader';
import { getQuestionById, type LocalQuestion } from '@/lib/data/questions-data';
import { parseTestCases, generateStub, formatInputAsStdin, normalizeOutput, type TestCase, type TestResult } from '@/lib/utils/test-case-parser';
import toast from 'react-hot-toast';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const languageMap: Record<string, string> = { python: 'python', javascript: 'javascript', java: 'java', cpp: 'cpp', c: 'c' };
const SUPPORTED_LANGUAGES = ['python', 'javascript'];

async function executeCode(language: string, code: string, stdin: string): Promise<{ stdout: string; stderr: string; exitCode: number; executionTime: number; timedOut: boolean }> {
  try {
    const res = await fetch('/api/v1/execute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language, code, stdin }) });
    const data = await res.json();
    return data.success ? data.data : { stdout: '', stderr: data.error || 'Execution failed', exitCode: 1, executionTime: 0, timedOut: false };
  } catch (err) {
    return { stdout: '', stderr: `Network error: ${(err as Error).message}`, exitCode: 1, executionTime: 0, timedOut: false };
  }
}

export default function CodingExamPage() {
  const params = useParams();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<LocalQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7200);
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'submissions'>('description');
  const [activeBottomTab, setActiveBottomTab] = useState<'testcases' | 'result'>('testcases');
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [overallResult, setOverallResult] = useState<{ passed: number; total: number; time: number } | null>(null);

  const testCases = useMemo(() => question ? parseTestCases(question.examples) : [], [question]);

  // Set initial code when question or language changes
  useEffect(() => {
    if (question && testCases.length > 0) {
      setCode(generateStub(language, question.title, testCases));
    } else if (question) {
      const defaults: Record<string, string> = {
        python: `# Write your solution here\ndef solution():\n    pass\n`,
        javascript: `// Write your solution here\nfunction solution() {\n\n}\n`,
      };
      setCode(defaults[language] || `// Write your ${language} solution here\n`);
    }
  }, [question, language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch question
  useEffect(() => {
    async function fetchQuestion() {
      try {
        setIsLoading(true);
        const localQ = getQuestionById(questionId);
        if (localQ) { setQuestion(localQ); setError(null); return; }
        try {
          const response = await fetch(`/api/v1/questions/${questionId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              setQuestion({ id: data.data.id, title: data.data.title, slug: data.data.slug, difficulty: data.data.difficulty, description: data.data.description, examples: data.data.examples || [], constraints: data.data.constraints || [], tags: data.data.tags || [], timeLimit: data.data.timeLimit || 2000, memoryLimit: data.data.memoryLimit || 256 });
              setError(null); return;
            }
          }
        } catch { /* API failed */ }
        setError('Question not found');
      } finally { setIsLoading(false); }
    }
    if (questionId) fetchQuestion();
  }, [questionId]);

  // Timer
  useEffect(() => { const t = setInterval(() => setTimeLeft(v => Math.max(0, v - 1)), 1000); return () => clearInterval(t); }, []);
  const formatTime = (s: number) => { const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); const sec = s%60; return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`; };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setOutput(''); setTestResults([]); setOverallResult(null);
  };

  // Run Code = execute against the selected test case
  const handleRun = useCallback(async () => {
    if (isRunning || isSubmitting) return;
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      setOutput(`⚠ ${language.toUpperCase()} is not supported.\n\nSupported: Python, JavaScript`);
      setActiveBottomTab('result'); return;
    }
    setIsRunning(true); setOutput(''); setTestResults([]); setOverallResult(null);
    setActiveBottomTab('result');

    const tc = testCases[selectedTestCase];
    if (!tc) {
      // No test cases — just run raw
      const result = await executeCode(language, code, '');
      let txt = `$ Executing ${language}...\n✓ Runtime: ${result.executionTime}ms\n`;
      if (result.stdout) txt += `\n━━ Output ━━━━━━━━━━━━━━━━\n${result.stdout}\n`;
      if (result.stderr) txt += `\n━━ Errors ━━━━━━━━━━━━━━━━\n${result.stderr}\n`;
      if (!result.stdout && !result.stderr) txt += `\n(No output)\n`;
      setOutput(txt); setIsRunning(false); return;
    }

    const stdin = formatInputAsStdin(tc.input);
    const result = await executeCode(language, code, stdin);
    const actual = result.stdout.trim();
    const passed = normalizeOutput(actual) === normalizeOutput(tc.expected);

    const tr: TestResult = { testCase: tc, passed, actual, executionTime: result.executionTime, error: result.stderr || undefined };
    setTestResults([tr]);

    let txt = `$ Running Test Case ${tc.id}...\n✓ Runtime: ${result.executionTime}ms\n\n`;
    txt += passed ? `✅ PASSED\n` : `❌ FAILED\n`;
    txt += `\n  Input:    ${tc.input}\n  Expected: ${tc.expected}\n  Actual:   ${actual || '(empty)'}\n`;
    if (result.stderr) txt += `\n━━ Errors ━━━━━━━━━━━━━━━━\n${result.stderr}\n`;
    setOutput(txt); setIsRunning(false);
  }, [code, language, isRunning, isSubmitting, testCases, selectedTestCase]);

  // Submit = run ALL test cases
  const handleSubmit = useCallback(async () => {
    if (isRunning || isSubmitting) return;
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      toast.error(`${language} execution not supported`); return;
    }
    if (testCases.length === 0) { toast.error('No test cases available'); return; }

    setIsSubmitting(true); setTestResults([]); setOverallResult(null); setOutput('');
    setActiveBottomTab('result');

    const results: TestResult[] = [];
    let totalTime = 0;

    for (const tc of testCases) {
      const stdin = formatInputAsStdin(tc.input);
      const result = await executeCode(language, code, stdin);
      const actual = result.stdout.trim();
      const passed = normalizeOutput(actual) === normalizeOutput(tc.expected);
      totalTime += result.executionTime;
      results.push({ testCase: tc, passed, actual, executionTime: result.executionTime, error: result.stderr || undefined });
    }

    setTestResults(results);
    const passedCount = results.filter(r => r.passed).length;
    setOverallResult({ passed: passedCount, total: results.length, time: totalTime });

    let txt = `━━━ Submission Results ━━━━━━━━━━━━━━━━\n\n`;
    txt += passedCount === results.length
      ? `🎉 ALL TEST CASES PASSED! (${passedCount}/${results.length})\n`
      : `❌ ${passedCount}/${results.length} test cases passed\n`;
    txt += `⏱ Total runtime: ${totalTime}ms\n\n`;

    for (const r of results) {
      txt += `${r.passed ? '✅' : '❌'} Test ${r.testCase.id}: ${r.passed ? 'PASSED' : 'FAILED'} (${r.executionTime}ms)\n`;
      if (!r.passed) {
        txt += `   Input:    ${r.testCase.input}\n`;
        txt += `   Expected: ${r.testCase.expected}\n`;
        txt += `   Actual:   ${r.actual || '(empty)'}\n`;
        if (r.error) txt += `   Error:    ${r.error}\n`;
      }
    }

    if (passedCount === results.length) toast.success('All test cases passed! 🎉');
    else toast.error(`${passedCount}/${results.length} test cases passed`);

    setIsSubmitting(false);
  }, [code, language, isRunning, isSubmitting, testCases]);

  const timeColor = timeLeft < 300 ? 'text-[#ef4444]' : timeLeft < 600 ? 'text-[#f59e0b]' : 'text-[#10b981]';

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#06080f]"><ZCATLoader message="Loading question..." /></div>;
  if (error || !question) return (
    <div className="h-screen flex items-center justify-center bg-[#06080f]"><div className="text-center">
      <AlertTriangle className="w-12 h-12 text-[#ef4444] mx-auto mb-3" />
      <h2 className="text-lg font-bold text-white mb-2">Failed to Load Question</h2>
      <p className="text-sm text-[#8b949e] mb-4">{error || 'Question not found'}</p>
      <Link href="/candidate/challenges" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0066ff] text-white text-sm font-medium hover:bg-[#0052cc] transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Challenges</Link>
    </div></div>
  );

  const difficultyColor = question.difficulty === 'EASY' ? 'bg-[#10b981]/10 text-[#10b981]' : question.difficulty === 'MEDIUM' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-[#ef4444]/10 text-[#ef4444]';

  return (
    <div className="h-screen flex flex-col bg-[#06080f]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262d] bg-[#0d1117]/90 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/candidate/challenges" className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/[0.06] transition-all"><ArrowLeft className="w-4 h-4" /></Link>
          <div className="w-px h-6 bg-[#21262d]" />
          <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-[#00d4ff]" /><span className="text-sm font-semibold text-white">{question.title}</span></div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor}`}>{question.difficulty.toLowerCase()}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#21262d] font-mono text-sm ${timeColor}`}><Clock className="w-3.5 h-3.5" /> {formatTime(timeLeft)}</div>
          {!SUPPORTED_LANGUAGES.includes(language) && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20"><Info className="w-3.5 h-3.5 text-[#f59e0b]" /><span className="text-xs text-[#f59e0b]">No live execution</span></div>
          )}
          <button onClick={handleRun} disabled={isRunning || isSubmitting} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50">
            {isRunning ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          <button onClick={handleSubmit} disabled={isRunning || isSubmitting} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#0066ff] to-[#7c3aed] text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(0,102,255,0.3)] transition-all disabled:opacity-50">
            {isSubmitting ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {isSubmitting ? 'Judging...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — Description + Test Cases */}
        <div className="w-[420px] flex-shrink-0 border-r border-[#21262d] flex flex-col">
          <div className="flex border-b border-[#21262d] sticky top-0 bg-[#0d1117] z-10">
            <button onClick={() => setActiveLeftTab('description')} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeLeftTab === 'description' ? 'text-[#00d4ff] border-[#00d4ff]' : 'text-[#8b949e] border-transparent hover:text-white'}`}><FileText className="w-3.5 h-3.5" /> Description</button>
            <button onClick={() => setActiveLeftTab('submissions')} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeLeftTab === 'submissions' ? 'text-[#00d4ff] border-[#00d4ff]' : 'text-[#8b949e] border-transparent hover:text-white'}`}><CheckCircle className="w-3.5 h-3.5" /> Submissions</button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {activeLeftTab === 'description' ? (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-white mb-3">{question.title}</h2>
                  <div className="text-sm text-[#8b949e] leading-relaxed whitespace-pre-wrap">{question.description}</div>
                </div>
                {question.examples.length > 0 && (
                  <div className="space-y-3">
                    {question.examples.map((ex, i) => (
                      <div key={i} className="bg-[#161b22] rounded-xl p-4 border border-[#21262d]">
                        <p className="text-xs font-semibold text-white mb-2">Example {i + 1}:</p>
                        <pre className="font-mono text-xs text-[#8b949e] whitespace-pre-wrap">{ex}</pre>
                      </div>
                    ))}
                  </div>
                )}
                {question.constraints.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">Constraints:</h3>
                    <ul className="space-y-1">{question.constraints.map((c, i) => (<li key={i} className="text-xs text-[#8b949e] font-mono flex items-start gap-2"><span className="text-[#484f58]">•</span> {c}</li>))}</ul>
                  </div>
                )}
                {question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">{question.tags.map(tag => (<span key={tag} className="text-xs px-2 py-0.5 rounded bg-[#161b22] border border-[#21262d] text-[#8b949e]">{tag}</span>))}</div>
                )}
              </div>
            ) : (
              <div className="text-center py-12"><p className="text-sm text-[#484f58]">No submissions yet</p></div>
            )}
          </div>
        </div>

        {/* Right Panel — Editor + Bottom Panel */}
        <div className="flex-1 flex flex-col">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262d] bg-[#0d1117]/80 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select value={language} onChange={(e) => handleLanguageChange(e.target.value)} className="appearance-none bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-1.5 text-xs text-[#8b949e] pr-7 outline-none focus:border-[#00d4ff]/50 cursor-pointer">
                  <option value="python">Python</option><option value="javascript">JavaScript</option><option value="java">Java</option><option value="cpp">C++</option><option value="c">C</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#484f58] pointer-events-none" />
              </div>
              {SUPPORTED_LANGUAGES.includes(language) && <span className="text-xs text-[#10b981] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Live execution</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { if (question && testCases.length > 0) setCode(generateStub(language, question.title, testCases)); setOutput(''); setTestResults([]); setOverallResult(null); }} className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/[0.06] transition-all" title="Reset Code"><RotateCcw className="w-3.5 h-3.5" /></button>
              <button onClick={() => navigator.clipboard.writeText(code).then(() => toast.success('Code copied!'))} className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/[0.06] transition-all" title="Copy Code"><Copy className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <MonacoEditor height="100%" language={languageMap[language] || 'python'} value={code} onChange={(v) => setCode(v || '')} theme="vs-dark"
              options={{ fontSize: 14, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 16 }, lineNumbers: 'on', renderLineHighlight: 'line', cursorBlinking: 'smooth', smoothScrolling: true, tabSize: 4, automaticLayout: true }} />
          </div>

          {/* Bottom Panel — Test Cases + Result */}
          <div className="border-t border-[#21262d] flex-shrink-0 h-52 flex flex-col">
            <div className="flex items-center gap-1 px-4 py-1.5 border-b border-[#21262d] bg-[#0d1117]/80">
              <button onClick={() => setActiveBottomTab('testcases')} className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeBottomTab === 'testcases' ? 'text-[#00d4ff] bg-[#00d4ff]/10' : 'text-[#8b949e] hover:text-white'}`}>
                <FlaskConical className="w-3 h-3" /> Test Cases
                {testCases.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#21262d] text-[#8b949e]">{testCases.length}</span>}
              </button>
              <button onClick={() => setActiveBottomTab('result')} className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeBottomTab === 'result' ? 'text-[#00d4ff] bg-[#00d4ff]/10' : 'text-[#8b949e] hover:text-white'}`}>
                <Terminal className="w-3 h-3" /> Result
                {overallResult && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${overallResult.passed === overallResult.total ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#ef4444]/20 text-[#ef4444]'}`}>
                    {overallResult.passed}/{overallResult.total}
                  </span>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeBottomTab === 'testcases' ? (
                <div className="p-3">
                  {testCases.length > 0 ? (
                    <div>
                      <div className="flex gap-2 mb-3">
                        {testCases.map((tc, i) => {
                          const result = testResults.find(r => r.testCase.id === tc.id);
                          return (
                            <button key={tc.id} onClick={() => setSelectedTestCase(i)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all border ${selectedTestCase === i ? 'border-[#00d4ff]/40 bg-[#00d4ff]/10 text-[#00d4ff]' : 'border-[#21262d] text-[#8b949e] hover:text-white hover:border-[#484f58]'}`}>
                              {result ? (result.passed ? <CheckCircle className="w-3 h-3 text-[#10b981]" /> : <XCircle className="w-3 h-3 text-[#ef4444]" />) : null}
                              Case {tc.id}
                            </button>
                          );
                        })}
                      </div>
                      <div className="space-y-2 font-mono text-xs">
                        <div><span className="text-[#484f58]">Input:</span> <span className="text-white">{testCases[selectedTestCase]?.input}</span></div>
                        <div><span className="text-[#484f58]">Expected:</span> <span className="text-[#10b981]">{testCases[selectedTestCase]?.expected}</span></div>
                        {testResults.find(r => r.testCase.id === testCases[selectedTestCase]?.id) && (
                          <div><span className="text-[#484f58]">Actual:</span> <span className={testResults.find(r => r.testCase.id === testCases[selectedTestCase]?.id)?.passed ? 'text-[#10b981]' : 'text-[#ef4444]'}>{testResults.find(r => r.testCase.id === testCases[selectedTestCase]?.id)?.actual || '(empty)'}</span></div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#484f58] py-4 text-center">No test cases parsed for this question. Use "Run Code" for raw execution.</p>
                  )}
                </div>
              ) : (
                <div className="p-3 font-mono text-sm overflow-y-auto">
                  {isRunning || isSubmitting ? (
                    <div className="flex items-center gap-2 text-[#f59e0b]">
                      <div className="w-3 h-3 border-2 border-[#f59e0b]/30 border-t-[#f59e0b] rounded-full animate-spin" />
                      {isSubmitting ? `Judging ${testCases.length} test cases...` : `Executing ${language}...`}
                    </div>
                  ) : output ? (
                    <pre className="whitespace-pre-wrap text-xs text-[#c9d1d9]">{output}</pre>
                  ) : (
                    <p className="text-xs text-[#484f58]">Click "Run Code" to test against the selected case, or "Submit" to judge all test cases.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
