'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Clock, Award, HelpCircle, ChevronRight, ChevronLeft, Send,
  Trophy, CheckCircle2, XCircle, AlertTriangle, ArrowRight,
  BookOpen, Sparkles, AlertCircle, RefreshCw, FileText,
  Code2, Play, Terminal, Check, ShieldAlert, Laptop, ArrowUpRight, Trash2
} from 'lucide-react';
import ZCATLoader from '@/components/shared/ZCATLoader';
import toast from 'react-hot-toast';

// Dynamically import Monaco Editor to avoid SSR hydration issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  explanation?: string;
}

interface Question {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: 'MCQ' | 'CODING';
  difficulty: string;
  tags: string[];
  options?: string[]; // MCQ options mapped to examples
  marks: number;
  order: number;
  constraints?: string;
  examples?: string[];
  testCases?: TestCase[];
}

interface AssessmentDetails {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  instructions: string;
  questions: Question[];
  allowedLanguages?: string[];
  tags?: string[];
}

interface SubmittedAnswer {
  questionId: string;
  selectedOption?: string; // For MCQ
  isCorrect: boolean;
  correctAnswerActual?: string; // For MCQ
  explanation?: string; // For MCQ
  code?: string; // For Coding
  language?: string; // For Coding
  totalTests?: number; // For Coding
  passedTests?: number; // For Coding
}

interface SubmissionHistoryItem {
  timestamp: string;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED';
  language: string;
  code: string;
  passedTests: number;
  totalTests: number;
}

// Help create code starter templates
const getStarterCode = (language: string, title: string) => {
  const fnName = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  if (language === 'python') {
    return `# Solution for "${title}"\nimport sys\n\ndef ${fnName || 'solve'}():\n    # Read all input from standard input\n    # lines = sys.stdin.read().splitlines()\n    \n    # Write your logic here\n    # print("Your output here")\n    pass\n\nif __name__ == '__main__':\n    ${fnName || 'solve'}()\n`;
  } else if (language === 'javascript') {
    return `// Solution for "${title}"\nconst fs = require('fs');\n\nfunction ${fnName || 'solve'}() {\n    // Read all input from standard input (file descriptor 0)\n    // const input = fs.readFileSync(0, 'utf-8');\n    \n    // Write your logic here\n    // console.log("Your output here");\n}\n\n${fnName || 'solve'}();\n`;
  } else if (language === 'cpp') {
    return `// Solution for "${title}"\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    // Optimize input/output operations\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    // Write your solution here\n    \n    return 0;\n}\n`;
  } else if (language === 'java') {
    return `// Solution for "${title}"\nimport java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Write your solution here\n        \n    }\n}\n`;
  }
  return '';
};

export default function MixedCandidateExamWorkspace() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [assessment, setAssessment] = useState<AssessmentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Exam States
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // In seconds
  
  // MCQ States
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // questionId -> option ('A', 'B'...)
  
  // Global submit status records (Both MCQ and Coding questions)
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, SubmittedAnswer>>({});
  const [submittingIds, setSubmittingIds] = useState<Record<string, boolean>>({});

  // Coding Workspace States
  const [codeAnswers, setCodeAnswers] = useState<Record<string, string>>({}); // questionId -> code
  const [selectedLanguages, setSelectedLanguages] = useState<Record<string, string>>({}); // questionId -> lang
  const [isRunningCode, setIsRunningCode] = useState<Record<string, boolean>>({});
  const [customInput, setCustomInput] = useState<string>('');
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'submissions'>('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcases' | 'customInput' | 'output'>('testcases');
  const [consoleOutput, setConsoleOutput] = useState<any | null>(null);
  const [submissionHistory, setSubmissionHistory] = useState<Record<string, SubmissionHistoryItem[]>>({});
  
  // Dialog / Confirmation Overlays
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);

  // Proctoring States
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(true);

  // Proctoring helper configuration extraction
  const proctorTag = assessment?.tags?.find((t: string) => t.startsWith('PROCTOR:')) || 'PROCTOR:NONE';
  const isProctorStandard = proctorTag === 'PROCTOR:STANDARD' || proctorTag === 'PROCTOR:LOCKDOWN';
  const isProctorLockdown = proctorTag === 'PROCTOR:LOCKDOWN';

  // Request Webcam stream
  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
      setCameraStream(stream);
      toast.success('Webcam monitoring feed active. Keep your face centered! 🎥');
    } catch (err) {
      console.error('Camera access error:', err);
      toast.error('Webcam access is strictly required to proceed with this proctored test!', { duration: 5000 });
    }
  };

  // Request Fullscreen helper
  const requestFullScreen = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if ((docEl as any).webkitRequestFullscreen) {
        await (docEl as any).webkitRequestFullscreen();
      } else if ((docEl as any).mozRequestFullScreen) {
        await (docEl as any).mozRequestFullScreen();
      } else if ((docEl as any).msRequestFullscreen) {
        await (docEl as any).msRequestFullscreen();
      }
    } catch (err) {
      console.error('Error entering full screen:', err);
    }
  };

  // Log Proctoring Violation helper
  const logProctorViolation = async (type: string, description: string, metadata?: any) => {
    try {
      const res = await fetch(`/api/v1/assessments/${assessmentId}/violation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, description, metadata }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.data.integrityScore <= 30) {
          toast.error(`CRITICAL: Your integrity score has dropped to ${data.data.integrityScore}%. The exam may be automatically terminated if violations continue!`, { duration: 8000 });
        } else {
          toast.error(`Proctor Alert: Integrity score decreased to ${data.data.integrityScore}%.`, { duration: 4000 });
        }
      }
    } catch (err) {
      console.error('Error logging proctor violation:', err);
    }
  };

  // Clean up media tracks on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Window visibility & Tab blur listener
  useEffect(() => {
    if (!hasStarted || !isProctorStandard || isCompleted) return;

    let lastViolationTime = 0;

    const handleVisibilityOrBlur = () => {
      const isHidden = document.hidden || document.visibilityState === 'hidden';
      const now = Date.now();
      
      if ((isHidden || !document.hasFocus()) && (now - lastViolationTime > 4000)) {
        lastViolationTime = now;
        toast.error('Proctoring Warning: Tab changes and window blurs are tracked! Violation logged.', { duration: 5000 });
        logProctorViolation('TAB_SWITCH', 'Candidate switched tabs or blurred the exam window.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrBlur);
    window.addEventListener('blur', handleVisibilityOrBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrBlur);
      window.removeEventListener('blur', handleVisibilityOrBlur);
    };
  }, [hasStarted, isProctorStandard, isCompleted]);

  // Screen Fullscreen changes listener
  useEffect(() => {
    if (!hasStarted || !isProctorLockdown || isCompleted) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen) {
        toast.error('WARNING: Lockdown mode violated! Exiting full screen is not permitted.', { duration: 6000 });
        logProctorViolation('SUSPICIOUS_ACTIVITY', 'Candidate exited full screen lockdown mode.');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [hasStarted, isProctorLockdown, isCompleted]);

  // Anti Copy-Paste, inspect keys and context menu lock
  useEffect(() => {
    if (!hasStarted || !isProctorStandard || isCompleted) return;

    const preventDefaultAndWarn = (e: Event, type: 'copy' | 'paste' | 'contextmenu' | 'dragdrop') => {
      e.preventDefault();
      e.stopPropagation();
      
      let msg = '';
      let violationType = 'SUSPICIOUS_ACTIVITY';
      
      if (type === 'copy') {
        msg = 'Copying is strictly prohibited during the assessment!';
        violationType = 'COPY_PASTE';
      } else if (type === 'paste') {
        msg = 'Pasting is strictly prohibited during the assessment!';
        violationType = 'COPY_PASTE';
      } else if (type === 'contextmenu') {
        msg = 'Right-click menu is locked down!';
        violationType = 'SUSPICIOUS_ACTIVITY';
      } else if (type === 'dragdrop') {
        msg = 'Dragging and dropping content is locked down!';
        violationType = 'SUSPICIOUS_ACTIVITY';
      }
      
      toast.error(`Lockdown Alert: ${msg}`, { id: 'lockdown-warn', duration: 4000 });
      logProctorViolation(violationType, `Candidate attempted ${type} operation.`);
    };

    const handleKeydown = (e: KeyboardEvent) => {
      const isF12 = e.key === 'F12';
      const isInspectCmd = (e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j');
      const isInspectCtrl = (e.metaKey || e.ctrlKey) && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S');
      
      if (isF12 || isInspectCmd || isInspectCtrl) {
        e.preventDefault();
        e.stopPropagation();
        toast.error('Developer inspector access is blocked!', { duration: 4000 });
        logProctorViolation('SUSPICIOUS_ACTIVITY', `Candidate attempted developer inspection tools shortcut (${e.key}).`);
      }
    };

    const handleCopy = (e: ClipboardEvent) => preventDefaultAndWarn(e, 'copy');
    const handlePaste = (e: ClipboardEvent) => preventDefaultAndWarn(e, 'paste');
    const handleContextMenu = (e: MouseEvent) => preventDefaultAndWarn(e, 'contextmenu');
    const handleDragStart = (e: DragEvent) => preventDefaultAndWarn(e, 'dragdrop');
    const handleDrop = (e: DragEvent) => preventDefaultAndWarn(e, 'dragdrop');

    window.addEventListener('copy', handleCopy, true);
    window.addEventListener('paste', handlePaste, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('dragstart', handleDragStart, true);
    window.addEventListener('drop', handleDrop, true);
    window.addEventListener('keydown', handleKeydown, true);

    return () => {
      window.removeEventListener('copy', handleCopy, true);
      window.removeEventListener('paste', handlePaste, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('dragstart', handleDragStart, true);
      window.removeEventListener('drop', handleDrop, true);
      window.removeEventListener('keydown', handleKeydown, true);
    };
  }, [hasStarted, isProctorStandard, isCompleted]);

  // Final summary score calculation
  const [finalScore, setFinalScore] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Assessment specifications
  useEffect(() => {
    async function fetchDetails() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/v1/assessments/${assessmentId}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || 'Failed to load assessment specifications.');
        }

        setAssessment(json.data);
        setTimeLeft(json.data.duration * 60);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Unable to fetch assessment specifications.');
      } finally {
        setIsLoading(false);
      }
    }

    if (assessmentId) {
      fetchDetails();
    }
  }, [assessmentId]);

  // 2. Load LocalStorage Backups (so browser refreshes don't wipe student work)
  useEffect(() => {
    if (assessment && assessment.questions) {
      const initialCodeAnswers: Record<string, string> = {};
      const initialLanguages: Record<string, string> = {};
      const initialHistory: Record<string, SubmissionHistoryItem[]> = {};

      assessment.questions.forEach((q) => {
        if (q.type === 'CODING') {
          const allowed = assessment.allowedLanguages || ['python', 'javascript'];
          const defaultLang = allowed[0] || 'python';

          // Try loading from localStorage
          const savedCode = localStorage.getItem(`zcat_draft_${assessmentId}_${q.id}`);
          if (savedCode) {
            initialCodeAnswers[q.id] = savedCode;
          } else {
            initialCodeAnswers[q.id] = getStarterCode(defaultLang, q.title);
          }

          const savedLang = localStorage.getItem(`zcat_lang_${assessmentId}_${q.id}`);
          if (savedLang) {
            initialLanguages[q.id] = savedLang;
          } else {
            initialLanguages[q.id] = defaultLang;
          }

          const savedHistory = localStorage.getItem(`zcat_history_${assessmentId}_${q.id}`);
          if (savedHistory) {
            try {
              initialHistory[q.id] = JSON.parse(savedHistory);
            } catch (_) {}
          }
        }
      });

      setCodeAnswers(initialCodeAnswers);
      setSelectedLanguages(initialLanguages);
      setSubmissionHistory(initialHistory);

      // Check if candidate already has submissions locked in DB
      // We can also restore standard MCQ state if they had already answered
    }
  }, [assessment, assessmentId]);

  // 3. Count-down Timer effect
  useEffect(() => {
    if (hasStarted && !isCompleted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmitOnTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, isCompleted, timeLeft]);

  // Handle timeout
  const handleAutoSubmitOnTimeout = () => {
    toast.error("Time's up! Submitting your answers automatically.", { duration: 5000 });
    finishAssessment();
  };

  const startAssessment = async () => {
    if (isProctorStandard) {
      await requestCamera();
    }
    if (isProctorLockdown) {
      await requestFullScreen();
      setIsFullscreen(true);
    }
    setHasStarted(true);
    toast.success('Assessment started. Live timer initialized! ⏱️');
  };

  // MCQ Selection handlers
  const handleSelectMCQOption = (questionId: string, optionChar: string) => {
    if (submittedAnswers[questionId]) {
      toast.error('You have already locked in an answer for this question.');
      return;
    }
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionChar
    }));
  };

  // MCQ Submissions
  const handleSubmitMCQAnswer = async (question: Question) => {
    const selection = selectedAnswers[question.id];
    if (!selection) {
      toast.error('Please select an option first.');
      return;
    }

    setSubmittingIds((prev) => ({ ...prev, [question.id]: true }));
    const timeTaken = (assessment!.duration * 60) - timeLeft;

    try {
      const res = await fetch(`/api/v1/assessments/${assessmentId}/submit-mcq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          selectedOption: selection,
          timeTaken
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to submit selection');
      }

      setSubmittedAnswers((prev) => ({
        ...prev,
        [question.id]: {
          questionId: question.id,
          selectedOption: selection,
          isCorrect: data.data.isCorrect,
          correctAnswerActual: data.data.correctAnswerActual,
          explanation: data.data.explanation
        }
      }));

      if (data.data.isCorrect) {
        toast.success('Correct! Score updated dynamically (+4 points) 🎉');
      } else {
        toast.error('Incorrect option submitted! Answer saved.');
      }

      // Automatically move to next question if available
      if (currentQuestionIdx < assessment!.questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIdx((v) => v + 1);
        }, 800);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error saving option.');
    } finally {
      setSubmittingIds((prev) => ({ ...prev, [question.id]: false }));
    }
  };

  // Coding handlers
  const handleCodeChange = (questionId: string, val: string) => {
    setCodeAnswers((prev) => ({ ...prev, [questionId]: val }));
    localStorage.setItem(`zcat_draft_${assessmentId}_${questionId}`, val);
  };

  const handleLanguageChange = (questionId: string, lang: string) => {
    const prevLang = selectedLanguages[questionId];
    setSelectedLanguages((prev) => ({ ...prev, [questionId]: lang }));
    localStorage.setItem(`zcat_lang_${assessmentId}_${questionId}`, lang);

    // If current code is identical to previous language template, auto update it
    const currentCode = codeAnswers[questionId] || '';
    const prevTemplate = getStarterCode(prevLang || 'python', assessment!.questions.find(q => q.id === questionId)!.title);
    if (!currentCode || currentCode.trim() === '' || currentCode === prevTemplate) {
      const newTemplate = getStarterCode(lang, assessment!.questions.find(q => q.id === questionId)!.title);
      setCodeAnswers((prev) => ({ ...prev, [questionId]: newTemplate }));
      localStorage.setItem(`zcat_draft_${assessmentId}_${questionId}`, newTemplate);
    }
  };

  const handleResetCode = () => {
    const q = assessment!.questions[currentQuestionIdx];
    const lang = selectedLanguages[q.id] || 'python';
    const template = getStarterCode(lang, q.title);
    handleCodeChange(q.id, template);
    setIsResetConfirmOpen(false);
    toast.success('Boilerplate starter code restored.');
  };

  // Execute Code (Run Code against either Custom Input or all Sample Test Cases)
  const handleRunCode = async () => {
    const q = assessment!.questions[currentQuestionIdx];
    const code = codeAnswers[q.id] || '';
    const language = selectedLanguages[q.id] || 'python';

    if (!code.trim()) {
      toast.error('Write some code before compiling.');
      return;
    }

    setRunningCodeState(q.id, true);
    setConsoleOutput(null);
    setActiveConsoleTab('output');

    try {
      if (activeConsoleTab === 'customInput') {
        // Run with custom user stdin
        const res = await fetch('/api/v1/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language, code, stdin: customInput })
        });
        const json = await res.json();
        
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Execution failed');
        }

        setConsoleOutput({
          type: 'custom',
          stdout: json.data.stdout,
          stderr: json.data.stderr,
          exitCode: json.data.exitCode,
          executionTime: json.data.executionTime,
          timedOut: json.data.timedOut
        });
        toast.success('Code executed successfully! Checked stdout.');
      } else {
        // Run against all sample test cases in parallel
        const testCases = q.testCases || [];
        if (testCases.length === 0) {
          throw new Error('No sample test cases configured for this question.');
        }

        toast.loading('Compiling and running sample test cases...', { id: 'run-code-tc' });
        
        const results = await Promise.all(
          testCases.map(async (tc) => {
            try {
              const res = await fetch('/api/v1/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language, code, stdin: tc.input })
              });
              const json = await res.json();

              if (!res.ok || !json.success) {
                return {
                  id: tc.id,
                  input: tc.input,
                  expected: tc.expectedOutput,
                  actual: '',
                  passed: false,
                  error: json.message || json.error || 'Execution failure',
                  executionTime: 0,
                  timedOut: false
                };
              }

              const actualOut = (json.data.stdout || '').trim();
              const expectedOut = tc.expectedOutput.trim();
              
              // Normalize newlines for comparisons
              const isMatch = actualOut.replace(/\r\n/g, '\n') === expectedOut.replace(/\r\n/g, '\n');

              return {
                id: tc.id,
                input: tc.input,
                expected: tc.expectedOutput,
                actual: json.data.stdout,
                stderr: json.data.stderr,
                exitCode: json.data.exitCode,
                passed: isMatch && json.data.exitCode === 0,
                error: json.data.stderr,
                executionTime: json.data.executionTime,
                timedOut: json.data.timedOut
              };
            } catch (err: any) {
              return {
                id: tc.id,
                input: tc.input,
                expected: tc.expectedOutput,
                actual: '',
                passed: false,
                error: err.message || 'Network error',
                executionTime: 0,
                timedOut: false
              };
            }
          })
        );

        toast.dismiss('run-code-tc');

        const allPassed = results.every(r => r.passed);
        setConsoleOutput({
          type: 'sample',
          results,
          allPassed
        });

        if (allPassed) {
          toast.success('All sample test cases passed! Great job! 🎉');
        } else {
          toast.error('Some sample test cases failed. View the console output.');
        }
      }
    } catch (err: any) {
      toast.dismiss('run-code-tc');
      console.error(err);
      setConsoleOutput({
        type: 'error',
        error: err.message || 'Failed to initiate compilation pipeline'
      });
      toast.error('Execution pipeline returned an error.');
    } finally {
      setRunningCodeState(q.id, false);
    }
  };

  // Submit Code (Runs against sample test cases and locks entry onto leaderboard)
  const handleSubmitCode = async () => {
    const q = assessment!.questions[currentQuestionIdx];
    const code = codeAnswers[q.id] || '';
    const language = selectedLanguages[q.id] || 'python';

    if (!code.trim()) {
      toast.error('Empty editor workspace. Write code first.');
      return;
    }

    setSubmittingIds((prev) => ({ ...prev, [q.id]: true }));
    setActiveConsoleTab('output');
    setConsoleOutput(null);

    const testCases = q.testCases || [];
    const timeTaken = (assessment!.duration * 60) - timeLeft;

    try {
      toast.loading('Executing comprehensive submissions pipeline...', { id: 'submit-code-pipeline' });

      // 1. Evaluate sample test cases to calculate passing criteria
      let passedCount = 0;
      const results = await Promise.all(
        testCases.map(async (tc) => {
          try {
            const res = await fetch('/api/v1/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ language, code, stdin: tc.input })
            });
            const json = await res.json();

            if (res.ok && json.success) {
              const actualOut = (json.data.stdout || '').trim().replace(/\r\n/g, '\n');
              const expectedOut = tc.expectedOutput.trim().replace(/\r\n/g, '\n');
              const isMatch = actualOut === expectedOut && json.data.exitCode === 0;
              if (isMatch) passedCount++;
              return {
                passed: isMatch,
                actual: json.data.stdout,
                stderr: json.data.stderr,
                exitCode: json.data.exitCode,
                executionTime: json.data.executionTime
              };
            }
          } catch (_) {}
          return { passed: false, actual: '', exitCode: 1 };
        })
      );

      const totalTests = testCases.length || 1;
      const allPassed = passedCount === totalTests;

      // 2. Submit solution metadata to leaderboard endpoint
      const res = await fetch(`/api/v1/leaderboards/${assessmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: q.id,
          timeTaken,
          code,
          language,
          totalTests,
          passedTests: passedCount
        })
      });

      const json = await res.json();
      toast.dismiss('submit-code-pipeline');

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Leaderboard sync failed');
      }

      // Record in local active workspace submission memory
      setSubmittedAnswers((prev) => ({
        ...prev,
        [q.id]: {
          questionId: q.id,
          isCorrect: allPassed,
          code,
          language,
          totalTests,
          passedTests: passedCount
        }
      }));

      // Append to submissions log history
      const historyItem: SubmissionHistoryItem = {
        timestamp: new Date().toISOString(),
        status: allPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
        language,
        code,
        passedTests: passedCount,
        totalTests
      };

      const updatedHistory = [historyItem, ...(submissionHistory[q.id] || [])];
      setSubmissionHistory((prev) => ({
        ...prev,
        [q.id]: updatedHistory
      }));
      localStorage.setItem(`zcat_history_${assessmentId}_${q.id}`, JSON.stringify(updatedHistory));

      // Display live feedback details
      setConsoleOutput({
        type: 'submit-success',
        passedCount,
        totalTests,
        allPassed
      });

      if (allPassed) {
        toast.success('Congratulations! Correct answer. Leaderboard updated (+4 points) 🏆');
      } else {
        toast.error(`Solution submitted! Passed ${passedCount}/${totalTests} test cases.`);
      }
    } catch (err: any) {
      toast.dismiss('submit-code-pipeline');
      console.error(err);
      toast.error(err.message || 'Error processing coding submission');
    } finally {
      setSubmittingIds((prev) => ({ ...prev, [q.id]: false }));
    }
  };

  const setRunningCodeState = (questionId: string, val: boolean) => {
    setIsRunningCode((prev) => ({ ...prev, [questionId]: val }));
  };

  // Load a previously submitted code back into editor
  const handleLoadSubmittedCode = (code: string, lang: string) => {
    const q = assessment!.questions[currentQuestionIdx];
    setSelectedLanguages((prev) => ({ ...prev, [q.id]: lang }));
    handleCodeChange(q.id, code);
    setActiveLeftTab('description');
    toast.success('Previous code loaded back into the editor! 💻');
  };

  // Finish exam
  const finishAssessment = () => {
    setIsFinishConfirmOpen(false);
    setIsCompleted(true);

    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }

    // Calculate final scores across submitted answers
    let scoreCalculated = 0;
    Object.values(submittedAnswers).forEach((attempt) => {
      if (attempt.isCorrect) {
        scoreCalculated += 4;
      }
    });

    setFinalScore(scoreCalculated);
    toast.success('Assessment complete! Rankings compiled instantly. 🏆');

    // Wipe local backups to keep things tidy
    if (assessment?.questions) {
      assessment.questions.forEach((q) => {
        localStorage.removeItem(`zcat_draft_${assessmentId}_${q.id}`);
        localStorage.removeItem(`zcat_lang_${assessmentId}_${q.id}`);
      });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#06080f]"><ZCATLoader message="Initializing Unified Workspace..." /></div>;
  if (error || !assessment) return (
    <div className="h-screen flex items-center justify-center bg-[#06080f]"><div className="text-center p-6 glass-card max-w-md border border-[#ef4444]/20 shadow-2xl">
      <AlertTriangle className="w-12 h-12 text-[#ef4444] mx-auto mb-3" />
      <h2 className="text-lg font-bold text-white mb-2">Error Loading Assessment</h2>
      <p className="text-sm text-[#8b949e] mb-4">{error || 'Configuration files mismatch'}</p>
      <button onClick={() => router.push('/candidate/tests')} className="btn-neon btn-neon-secondary px-4 py-2 text-sm w-full">Back to Tests Hub</button>
    </div></div>
  );

  const totalQuestions = assessment.questions?.length || 0;

  if (totalQuestions === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#06080f]">
        <div className="text-center p-6 glass-card max-w-md border border-[#ef4444]/20 shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-[#eab308] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">No Questions Available</h2>
          <p className="text-sm text-[#8b949e] mb-4">This assessment doesn't contain any questions yet. Please contact the administrator.</p>
          <button onClick={() => router.push('/candidate/tests')} className="btn-neon btn-neon-secondary px-4 py-2 text-sm w-full">Back to Tests Hub</button>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIdx];
  if (!currentQuestion) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#06080f]">
        <div className="text-center p-6 glass-card max-w-md border border-[#ef4444]/20 shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-[#eab308] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Question Out Of Bounds</h2>
          <p className="text-sm text-[#8b949e] mb-4">The selected question index is invalid. Total questions: {totalQuestions}.</p>
          <button onClick={() => setCurrentQuestionIdx(0)} className="btn-neon btn-neon-secondary px-4 py-2 text-sm w-full">Reset to Question 1</button>
        </div>
      </div>
    );
  }

  const progressPercent = (Object.keys(submittedAnswers).length / totalQuestions) * 100;
  const isLastQuestion = currentQuestionIdx === totalQuestions - 1;

  // 4. Instructions Page (Intro Modal)
  if (!hasStarted) {
    const codingCount = assessment.questions.filter(q => q.type === 'CODING').length;
    const mcqCount = assessment.questions.filter(q => q.type === 'MCQ').length;

    return (
      <div className="min-h-screen py-12 px-4 md:px-6 max-w-4xl mx-auto flex items-center justify-center bg-[#06080f]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 border border-[#21262d] w-full shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#0d1117]/90 to-[#07090e]/95"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Laptop className="w-48 h-48 text-[#00d4ff]" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff]">
                <Code2 className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">{assessment.title}</h1>
                <p className="text-sm text-[#00d4ff] font-medium font-mono uppercase tracking-wider">Unified GFG-Style Mixed Assessment Room</p>
              </div>
            </div>

            <p className="text-[#c9d1d9] leading-relaxed text-sm">{assessment.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#07090e] border border-[#21262d] text-center">
              <div>
                <p className="text-xs text-[#8b949e]">Duration</p>
                <p className="text-base font-bold text-white flex items-center justify-center gap-1 mt-1">
                  <Clock className="w-4 h-4 text-[#ef4444]" /> {assessment.duration} min
                </p>
              </div>
              <div>
                <p className="text-xs text-[#8b949e]">Question Mix</p>
                <p className="text-sm font-semibold text-white flex flex-col justify-center items-center mt-1">
                  <span className="text-[#00d4ff]">{codingCount} Coding Qs</span>
                  <span className="text-[#10b981]">{mcqCount} MCQ Qs</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#8b949e]">Total Score</p>
                <p className="text-base font-bold text-white flex items-center justify-center gap-1 mt-1">
                  <Award className="w-4 h-4 text-[#10b981]" /> {assessment.totalMarks} Pts
                </p>
              </div>
              <div>
                <p className="text-xs text-[#8b949e]">Passing criteria</p>
                <p className="text-base font-bold text-white flex items-center justify-center gap-1 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-[#f59e0b]" /> {assessment.passingMarks} Pts
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#ef4444]" /> Exam Rules & Guidelines:
              </h3>
              <ul className="space-y-2 text-xs text-[#8b949e] list-disc list-inside">
                <li>Every correctly submitted multiple choice response awards exactly <strong className="text-white">+4 points</strong> instantly to your score.</li>
                <li>Coding questions must be solved inside the interactive Monaco Code Editor. You can run test cases using the compile console.</li>
                <li>Each coding question has associated sample test cases. Submitting a correct answer awards <strong className="text-white">+4 points</strong> to your leaderboard standing.</li>
                <li>Your progress is securely saved client-side. Refreshing the browser will reload your editor work draft securely.</li>
                <li>Once the countdown timer hits 0:00, all answered questions will automatically lock and save.</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-[#21262d] flex items-center justify-between">
              <button
                onClick={() => router.push('/candidate/tests')}
                className="px-5 py-2.5 rounded-lg border border-[#21262d] text-sm text-[#8b949e] hover:text-white hover:bg-white/5 transition-all"
              >
                Exit Portal
              </button>
              <button
                onClick={startAssessment}
                className="btn-neon btn-neon-primary py-2.5 px-6 text-sm flex items-center gap-2 hover:scale-[1.02]"
              >
                Start Assessment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 5. Completion View (Post-Exam screen)
  if (isCompleted) {
    const accuracy = Object.keys(submittedAnswers).length > 0
      ? Math.round((Object.values(submittedAnswers).filter(s => s.isCorrect).length / Object.keys(submittedAnswers).length) * 100)
      : 0;

    const isPassed = finalScore >= assessment.passingMarks;

    return (
      <div className="min-h-screen py-12 px-4 md:px-6 max-w-5xl mx-auto space-y-8 bg-[#06080f]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-8 border border-[#21262d] text-center shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#0d1117] to-[#07090e]"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] opacity-10 rounded-full filter blur-3xl pointer-events-none" />

          <Trophy className="w-16 h-16 text-[#f59e0b] mx-auto mb-4 animate-bounce" />
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-wide">Test Attempt Finished!</h1>
          <p className="text-sm text-[#8b949e] mb-6">Your answers have been evaluated securely on our servers in real time.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-[#21262d]">
              <p className="text-xs text-[#8b949e]">Total Score</p>
              <p className={`text-2xl font-bold mt-1 ${isPassed ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {finalScore} <span className="text-sm text-[#8b949e]">/ {assessment.totalMarks}</span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-[#21262d]">
              <p className="text-xs text-[#8b949e]">Attempt Status</p>
              <p className={`text-sm font-semibold uppercase mt-2 px-2 py-0.5 rounded-full inline-block ${isPassed ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#ef4444]/15 text-[#ef4444]'}`}>
                {isPassed ? 'PASSED' : 'FAILED'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-[#21262d]">
              <p className="text-xs text-[#8b949e]">Accuracy</p>
              <p className="text-2xl font-bold text-white mt-1">{accuracy}%</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-[#21262d]">
              <p className="text-xs text-[#8b949e]">Leaderboard Ranking</p>
              <p className="text-2xl font-bold text-[#00d4ff] mt-1 flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-[#f59e0b]" /> Ranked Live
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push('/candidate/tests')}
              className="glass-button px-6 py-2.5 rounded-lg text-sm text-white hover:bg-white/10 transition-colors border border-[#30363d]"
            >
              Back to Tests Hub
            </button>
            <Link
              href="/candidate/leaderboard"
              className="btn-neon btn-neon-primary px-6 py-2.5 text-sm flex items-center gap-2"
            >
              Go to Leaderboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Detailed Solutions Review */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#00d4ff]" /> Questions & Solutions Review
          </h2>

          <div className="space-y-4">
            {assessment.questions.map((q, idx) => {
              const attempt = submittedAnswers[q.id];
              const isCorrect = attempt?.isCorrect;
              const hasAttempted = !!attempt;

              return (
                <div
                  key={q.id}
                  className="glass-card rounded-xl p-6 border border-[#21262d] space-y-4 overflow-hidden relative bg-[#0d1117]/80"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-[#21262d] pb-3">
                    <div className="space-y-1">
                      <span className="text-xs text-[#8b949e] font-mono">Question {idx + 1} of {totalQuestions} | {q.type}</span>
                      <h3 className="text-base font-semibold text-white">{q.title}</h3>
                    </div>
                    {hasAttempted ? (
                      isCorrect ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-xs font-semibold text-[#10b981]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> +4 Pts (Correct)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 text-xs font-semibold text-[#ef4444]">
                          <XCircle className="w-3.5 h-3.5" /> {q.type === 'CODING' ? `Passed ${attempt.passedTests}/${attempt.totalTests} cases` : '0 Pts (Wrong)'}
                        </span>
                      )
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#8b949e]">
                        Unattempted
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[#c9d1d9] leading-relaxed bg-[#06080f] p-4 rounded-lg border border-[#21262d]/50 font-sans whitespace-pre-wrap">
                    {q.description}
                  </p>

                  {q.type === 'MCQ' && (q.options || q.examples) && (
                    <div className="grid sm:grid-cols-2 gap-3 pt-2">
                      {(q.options || q.examples || []).map((opt, oIdx) => {
                        const char = String.fromCharCode(65 + oIdx); // 'A', 'B', 'C', 'D'
                        const isOptionSelected = attempt?.selectedOption === char;
                        const isOptionCorrect = attempt?.correctAnswerActual === char;

                        let optStyle = 'border-[#21262d] bg-white/[0.01] text-[#8b949e]';
                        if (isOptionCorrect) {
                          optStyle = 'border-[#10b981]/40 bg-[#10b981]/5 text-white';
                        } else if (isOptionSelected && !isOptionCorrect) {
                          optStyle = 'border-[#ef4444]/40 bg-[#ef4444]/5 text-white';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center gap-3 p-3 rounded-lg border text-sm transition-all ${optStyle}`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                              isOptionCorrect
                                ? 'bg-[#10b981]/25 text-[#10b981]'
                                : isOptionSelected
                                ? 'bg-[#ef4444]/25 text-[#ef4444]'
                                : 'bg-white/5 text-[#8b949e]'
                            }`}>
                              {char}
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'CODING' && attempt?.code && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Your Submitted Code ({attempt.language}):</h4>
                      <pre className="text-xs p-4 rounded-lg bg-[#07090e] border border-[#21262d] overflow-x-auto text-[#00d4ff] font-mono leading-relaxed max-h-60 overflow-y-auto">
                        {attempt.code}
                      </pre>
                    </div>
                  )}

                  {attempt?.explanation && (
                    <div className="p-4 rounded-lg bg-[#00d4ff]/5 border border-[#00d4ff]/10 space-y-1.5 mt-2">
                      <p className="text-xs font-bold text-[#00d4ff] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Logical Solution Analysis & Explanation
                      </p>
                      <p className="text-xs text-[#8b949e] leading-relaxed">
                        {attempt.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 6. Active Exam Room Grid Workspace
  const attemptedCount = Object.keys(submittedAnswers).length;
  const isQuestionAnswered = !!submittedAnswers[currentQuestion.id];
  
  // MCQ active answers helper
  const selectedOption = selectedAnswers[currentQuestion.id] || '';

  // Coding active workspace variables
  const currentCode = codeAnswers[currentQuestion.id] || '';
  const currentLanguage = selectedLanguages[currentQuestion.id] || 'python';
  const isRunningActive = isRunningCode[currentQuestion.id] || false;
  const isSubmittingActive = submittingIds[currentQuestion.id] || false;
  const historyForActive = submissionHistory[currentQuestion.id] || [];

  const mcqQuestions = assessment?.questions
    ? assessment.questions.map((q, originalIndex) => ({ q, originalIndex })).filter(item => item.q.type === 'MCQ')
    : [];

  const codingQuestions = assessment?.questions
    ? assessment.questions.map((q, originalIndex) => ({ q, originalIndex })).filter(item => item.q.type === 'CODING')
    : [];

  return (
    <div className="h-screen flex flex-col bg-[#06080f] overflow-hidden text-slate-100 font-sans">
      {/* Top Header Exam bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#21262d] bg-[#0d1117]/85 relative z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping" />
            <span className="text-sm font-semibold text-white tracking-wide">{assessment.title}</span>
          </div>
          <span className="text-xs text-[#00d4ff] bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2 py-0.5 rounded font-mono tracking-wider font-semibold uppercase">
            MIXED TEST WORKSPACE
          </span>
          {currentQuestion.type === 'MCQ' ? (
            <span className="text-xs text-[#e9c46a] bg-[#e9c46a]/10 border border-[#e9c46a]/20 px-2.5 py-0.5 rounded-full font-mono tracking-wider font-semibold uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(233,196,106,0.15)] border-dashed">
              📌 MCQ Mode
            </span>
          ) : (
            <span className="text-xs text-[#a29bfe] bg-[#a29bfe]/10 border border-[#a29bfe]/20 px-2.5 py-0.5 rounded-full font-mono tracking-wider font-semibold uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(162,155,254,0.15)] border-dashed">
              💻 Coding Mode
            </span>
          )}
        </div>

        {/* Live Timer Countdown */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl border bg-[#161b22] font-mono text-sm font-bold ${
            timeLeft < 180 ? 'text-[#ef4444] border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'text-[#10b981] border-[#21262d]'
          }`}>
            <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => setIsFinishConfirmOpen(true)}
            className="px-4 py-1.5 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/5 text-xs text-[#ef4444] font-semibold hover:bg-[#ef4444]/15 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:scale-[1.02]"
          >
            Finish Exam
          </button>
        </div>
      </div>

      {/* Progress slider bar */}
      <div className="h-1 bg-[#161b22] w-full flex-shrink-0">
        <div
          className="h-full bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Dual-Workspace split viewport */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: Collapsible/Responsive Tab Panel (Question Details & History) */}
        <div className="w-[440px] border-r border-[#21262d] bg-[#0d1117]/35 flex flex-col overflow-hidden flex-shrink-0">
          {/* Tab Selection */}
          <div className="flex items-center border-b border-[#21262d] bg-[#0d1117]/60 flex-shrink-0">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeLeftTab === 'description'
                  ? 'border-[#00d4ff] text-white bg-white/[0.02]'
                  : 'border-transparent text-[#8b949e] hover:text-white hover:bg-white/[0.01]'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-[#00d4ff]" /> Problem Info
            </button>
            
            {currentQuestion.type === 'CODING' && (
              <button
                onClick={() => setActiveLeftTab('submissions')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeLeftTab === 'submissions'
                    ? 'border-[#00d4ff] text-white bg-white/[0.02]'
                    : 'border-transparent text-[#8b949e] hover:text-white hover:bg-white/[0.01]'
                }`}
              >
                <RefreshCw className="w-4 h-4 text-[#10b981]" /> Submissions ({historyForActive.length})
              </button>
            )}
          </div>

          {/* Left panel Tab Contents */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <AnimatePresence mode="wait">
              {activeLeftTab === 'description' ? (
                <motion.div
                  key="desc"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  {/* Meta Tags */}
                  <div className="flex items-center justify-between border-b border-[#21262d]/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-[#00d4ff]/10 text-xs font-mono font-bold text-[#00d4ff] uppercase border border-[#00d4ff]/20">
                        {currentQuestion.type}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold border ${
                        currentQuestion.difficulty === 'EASY'
                          ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'
                          : currentQuestion.difficulty === 'MEDIUM'
                          ? 'bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20'
                          : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'
                      }`}>
                        {currentQuestion.difficulty}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#8b949e] font-mono bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-lg">
                      {currentQuestion.marks} Marks
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-white tracking-wide">{currentQuestionIdx + 1}. {currentQuestion.title}</h2>
                    <div className="text-sm text-[#c9d1d9] leading-relaxed whitespace-pre-wrap bg-[#06080f]/40 p-4 rounded-xl border border-[#21262d]/40 font-sans">
                      {currentQuestion.description}
                    </div>
                  </div>

                  {/* Constraints */}
                  {currentQuestion.type === 'CODING' && currentQuestion.constraints && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Constraints:</h4>
                      <pre className="text-xs p-3 rounded-lg bg-[#07090e] border border-[#21262d] text-[#ef4444] font-mono leading-relaxed">
                        {currentQuestion.constraints}
                      </pre>
                    </div>
                  )}

                  {/* Examples (Examples tab, loaded inside coding specs) */}
                  {currentQuestion.type === 'CODING' && currentQuestion.examples && currentQuestion.examples.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sample Examples:</h4>
                      <div className="space-y-3">
                        {currentQuestion.examples.map((ex, exIdx) => (
                          <div key={exIdx} className="p-3 rounded-lg bg-white/[0.01] border border-[#21262d] text-xs space-y-1.5">
                            <p className="font-bold text-white font-mono">Example {exIdx + 1}:</p>
                            <pre className="font-mono text-[#8b949e] whitespace-pre-wrap">{ex}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {currentQuestion.tags && currentQuestion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-[#21262d]/40">
                      {currentQuestion.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono font-medium bg-[#161b22] border border-[#30363d] px-2 py-0.5 rounded text-[#8b949e]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="sub"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#21262d]/40 pb-2">Submissions Archive</h3>
                  
                  {historyForActive.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-[#21262d] rounded-xl text-[#8b949e]">
                      <Terminal className="w-8 h-8 text-[#8b949e]/40 mx-auto mb-2" />
                      <p className="text-xs">No submissions logged in this session yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[550px] overflow-y-auto">
                      {historyForActive.map((item, index) => {
                        const isAcc = item.status === 'ACCEPTED';
                        const date = new Date(item.timestamp);
                        const formatTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                        return (
                          <div
                            key={index}
                            className="p-3.5 rounded-xl bg-white/[0.01] border border-[#21262d] hover:border-[#30363d] transition-all flex flex-col justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                isAcc ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#ef4444]/15 text-[#ef4444]'
                              }`}>
                                {item.status}
                              </span>
                              <span className="text-[10px] text-[#8b949e] font-mono">{formatTime}</span>
                            </div>

                            <div className="flex items-center justify-between text-[#8b949e]">
                              <span>Passed: <strong className="text-white font-mono">{item.passedTests}/{item.totalTests}</strong> cases</span>
                              <span className="uppercase font-mono text-[10px]">{item.language}</span>
                            </div>

                            <button
                              onClick={() => handleLoadSubmittedCode(item.code, item.language)}
                              className="w-full text-center py-1.5 rounded-lg border border-[#21262d] hover:border-[#00d4ff]/40 text-[#8b949e] hover:text-[#00d4ff] hover:bg-[#00d4ff]/5 transition-all font-semibold text-[10px]"
                            >
                              Load Code Into Workspace
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MIDDLE/RIGHT PANEL: MCQ Option Cards OR Monaco Coding Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#07090e]/40 relative">
          
          {currentQuestion.type === 'MCQ' ? (
            // ================== MCQ MODE ==================
            <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col justify-center max-w-3xl mx-auto w-full space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#8b949e] uppercase tracking-wider">Select the correct option:</h3>
                
                <div className="grid gap-4">
                  {(currentQuestion.options || currentQuestion.examples || []).map((option, oIdx) => {
                    const char = String.fromCharCode(65 + oIdx); // 'A', 'B', 'C', 'D'
                    const isSelected = selectedOption === char;
                    const isSaved = isQuestionAnswered;

                    let optCardStyle = 'border-[#21262d] bg-white/[0.01] hover:border-[#30363d] hover:bg-white/[0.02] cursor-pointer';
                    if (isSaved) {
                      const wasCorrect = submittedAnswers[currentQuestion.id]?.selectedOption === char;
                      const wasOptionCorrectActual = submittedAnswers[currentQuestion.id]?.correctAnswerActual === char;
                      
                      optCardStyle = wasOptionCorrectActual
                        ? 'border-[#10b981]/40 bg-[#10b981]/5 text-white pointer-events-none'
                        : wasCorrect && !wasOptionCorrectActual
                        ? 'border-[#ef4444]/40 bg-[#ef4444]/5 text-white pointer-events-none'
                        : 'border-[#21262d] bg-white/[0.01] text-[#8b949e] pointer-events-none';
                    } else if (isSelected) {
                      optCardStyle = 'border-[#00d4ff]/40 bg-[#00d4ff]/5 shadow-[0_0_15px_rgba(0,212,255,0.05)] text-white';
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={isSaved}
                        onClick={() => handleSelectMCQOption(currentQuestion.id, char)}
                        className={`flex items-center gap-4 p-4 rounded-xl border text-left text-sm transition-all group ${optCardStyle}`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-colors ${
                          isSelected 
                            ? 'bg-[#00d4ff]/25 text-[#00d4ff]' 
                            : 'bg-white/5 text-[#8b949e] group-hover:bg-white/10 group-hover:text-white'
                        }`}>
                          {char}
                        </span>
                        <span className="flex-1 font-medium">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action controller footer for MCQ */}
              <div className="pt-6 border-t border-[#21262d]/40 flex items-center justify-between">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((v) => v - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#21262d] text-xs text-[#8b949e] hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Question
                </button>

                {isQuestionAnswered ? (
                  <span className="text-xs text-[#10b981] font-semibold bg-[#10b981]/10 px-4 py-2 rounded-xl border border-[#10b981]/20 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Option Saved & Locked
                  </span>
                ) : (
                  <button
                    disabled={!selectedOption || submittingIds[currentQuestion.id]}
                    onClick={() => handleSubmitMCQAnswer(currentQuestion)}
                    className="btn-neon btn-neon-primary py-2 px-6 text-xs flex items-center gap-1.5 hover:scale-[1.02]"
                  >
                    {submittingIds[currentQuestion.id] ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Lock Answer
                  </button>
                )}

                <button
                  disabled={isLastQuestion}
                  onClick={() => setCurrentQuestionIdx((v) => v + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#21262d] text-xs text-[#8b949e] hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  Next Question <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            // ================== CODING MODE ==================
            <div className="flex-1 flex flex-col overflow-hidden h-full">
              
              {/* Compiler Header Bar */}
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#21262d] bg-[#0d1117]/85 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8b949e] font-mono">Language:</span>
                  <select
                    value={currentLanguage}
                    onChange={(e) => handleLanguageChange(currentQuestion.id, e.target.value)}
                    className="bg-[#06080f] border border-[#21262d] hover:border-[#30363d] px-3 py-1 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#00d4ff]"
                  >
                    {(assessment.allowedLanguages || ['python', 'javascript']).map((lang) => (
                      <option key={lang} value={lang}>
                        {lang === 'python' ? 'Python 3' : lang === 'javascript' ? 'Node.js (Javascript)' : lang === 'cpp' ? 'C++ (g++)' : lang === 'java' ? 'Java (JDK)' : lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg border border-[#ef4444]/20 hover:border-[#ef4444]/40 bg-[#ef4444]/5 hover:bg-[#ef4444]/15 text-xs text-[#ef4444] transition-all font-mono"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Reset Template
                  </button>
                </div>
              </div>

              {/* MONACO CODE EDITOR BOX */}
              <div className="h-[55%] flex-shrink-0 border-b border-[#21262d] relative bg-[#1e1e1e]">
                <MonacoEditor
                  height="100%"
                  language={currentLanguage === 'javascript' ? 'javascript' : 'python'}
                  theme="vs-dark"
                  value={currentCode}
                  onChange={(val) => handleCodeChange(currentQuestion.id, val || '')}
                  options={{
                    fontSize: 13.5,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                    tabSize: 4,
                  }}
                />
              </div>

              {/* COMPILE CONSOLE PANE */}
              <div className="flex-1 flex flex-col bg-[#07090e] overflow-hidden">
                {/* Console tabs triggers */}
                <div className="flex items-center border-b border-[#21262d] bg-[#0d1117]/60 flex-shrink-0 px-4">
                  <button
                    onClick={() => setActiveConsoleTab('testcases')}
                    className={`py-2 px-4 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
                      activeConsoleTab === 'testcases'
                        ? 'border-[#00d4ff] text-white bg-white/5'
                        : 'border-transparent text-[#8b949e] hover:text-white hover:bg-white/[0.01]'
                    }`}
                  >
                    Sample Testcases
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab('customInput')}
                    className={`py-2 px-4 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
                      activeConsoleTab === 'customInput'
                        ? 'border-[#00d4ff] text-white bg-white/5'
                        : 'border-transparent text-[#8b949e] hover:text-white hover:bg-white/[0.01]'
                    }`}
                  >
                    Custom Input
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab('output')}
                    className={`py-2 px-4 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
                      activeConsoleTab === 'output'
                        ? 'border-[#00d4ff] text-white bg-white/5'
                        : 'border-transparent text-[#8b949e] hover:text-white hover:bg-white/[0.01]'
                    }`}
                  >
                    Console Output {isRunningActive && '⏳'}
                  </button>
                </div>

                {/* Console contents */}
                <div className="flex-1 overflow-y-auto p-4">
                  {activeConsoleTab === 'testcases' && (
                    <div className="space-y-4">
                      {currentQuestion.testCases?.map((tc, tcIdx) => (
                        <div key={tc.id} className="p-3.5 rounded-xl bg-white/[0.01] border border-[#21262d] space-y-2 text-xs">
                          <p className="font-mono font-bold text-[#00d4ff]">Sample Case {tcIdx + 1}:</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <p className="text-[10px] text-[#8b949e] uppercase font-mono font-bold">Input:</p>
                              <pre className="p-2 rounded bg-[#07090e] border border-[#21262d]/50 font-mono text-[#c9d1d9] overflow-x-auto">{tc.input}</pre>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-[#8b949e] uppercase font-mono font-bold">Expected Output:</p>
                              <pre className="p-2 rounded bg-[#07090e] border border-[#21262d]/50 font-mono text-[#10b981] overflow-x-auto">{tc.expectedOutput}</pre>
                            </div>
                          </div>
                          {tc.explanation && (
                            <div className="pt-1.5 border-t border-[#21262d]/40 flex gap-1.5 text-[#8b949e] leading-normal text-[11px]">
                              <Sparkles className="w-3.5 h-3.5 text-[#00d4ff] flex-shrink-0 mt-0.5" />
                              <span>{tc.explanation}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeConsoleTab === 'customInput' && (
                    <div className="h-full flex flex-col space-y-2">
                      <p className="text-[10px] text-[#8b949e] uppercase font-mono font-bold">Provide custom standard input (stdin):</p>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter standard input test case data..."
                        className="flex-1 w-full bg-[#06080f] border border-[#21262d] rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-[#00d4ff] resize-none h-[120px]"
                      />
                    </div>
                  )}

                  {activeConsoleTab === 'output' && (
                    <div className="h-full space-y-3">
                      {isRunningActive ? (
                        <div className="h-full flex flex-col justify-center items-center py-8 text-[#8b949e]">
                          <div className="w-8 h-8 border-4 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin mb-3" />
                          <p className="text-xs font-mono">Running secure execution workers...</p>
                        </div>
                      ) : isSubmittingActive ? (
                        <div className="h-full flex flex-col justify-center items-center py-8 text-[#8b949e]">
                          <div className="w-8 h-8 border-4 border-[#10b981]/30 border-t-[#10b981] rounded-full animate-spin mb-3" />
                          <p className="text-xs font-mono">Running all sample test cases on submit worker...</p>
                        </div>
                      ) : !consoleOutput ? (
                        <div className="h-full flex flex-col justify-center items-center py-8 text-[#8b949e]">
                          <Terminal className="w-8 h-8 text-[#8b949e]/40 mx-auto mb-2" />
                          <p className="text-xs font-mono">No execution outputs available. Click Run Code or Submit.</p>
                        </div>
                      ) : consoleOutput.type === 'error' ? (
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 space-y-2">
                          <p className="font-bold flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-red-400" /> Pipeline Execution Error:
                          </p>
                          <pre className="font-mono p-3 bg-black/35 rounded-lg whitespace-pre-wrap overflow-x-auto">{consoleOutput.error}</pre>
                        </div>
                      ) : consoleOutput.type === 'custom' ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-[#21262d]/40 pb-2">
                            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Custom Run Status:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              consoleOutput.exitCode === 0 ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#ef4444]/15 text-[#ef4444]'
                            }`}>
                              {consoleOutput.timedOut ? 'TIMED OUT' : consoleOutput.exitCode === 0 ? 'SUCCESS' : 'RUNTIME ERROR'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs font-mono text-[#8b949e]">
                            <span>Execution Time: <strong className="text-white">{consoleOutput.executionTime} ms</strong></span>
                            <span>Exit Code: <strong className="text-white">{consoleOutput.exitCode ?? 'N/A'}</strong></span>
                          </div>

                          {consoleOutput.stderr && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-[#ef4444] uppercase font-mono font-bold">Standard Error (stderr):</p>
                              <pre className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-xs font-mono text-red-400 overflow-x-auto whitespace-pre-wrap">{consoleOutput.stderr}</pre>
                            </div>
                          )}

                          <div className="space-y-1">
                            <p className="text-[10px] text-[#00d4ff] uppercase font-mono font-bold">Standard Output (stdout):</p>
                            <pre className="p-3 bg-[#06080f] border border-[#21262d] rounded-lg text-xs font-mono text-[#c9d1d9] overflow-x-auto whitespace-pre-wrap">{consoleOutput.stdout || '(Empty Output)'}</pre>
                          </div>
                        </div>
                      ) : consoleOutput.type === 'sample' ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-[#21262d]/40 pb-2">
                            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Sample Cases Run Result:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              consoleOutput.allPassed ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#ef4444]/15 text-[#ef4444]'
                            }`}>
                              {consoleOutput.allPassed ? 'ALL PASSED' : 'WRONG ANSWER'}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {consoleOutput.results.map((res: any, idx: number) => (
                              <div
                                key={idx}
                                className={`p-3.5 rounded-xl border transition-all ${
                                  res.passed 
                                    ? 'border-[#10b981]/25 bg-[#10b981]/5 text-slate-100'
                                    : 'border-[#ef4444]/25 bg-[#ef4444]/5 text-slate-100'
                                }`}
                              >
                                <div className="flex items-center justify-between font-mono mb-2">
                                  <span className="font-bold flex items-center gap-1.5 text-xs">
                                    {res.passed ? (
                                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-[#ef4444]" />
                                    )}
                                    Sample Case {idx + 1}
                                  </span>
                                  <span className="text-[10px] text-[#8b949e]">Time: {res.executionTime} ms</span>
                                </div>

                                {!res.passed && res.error && (
                                  <pre className="p-2 mb-2 rounded bg-black/40 border border-red-500/20 text-[11px] font-mono text-red-400 overflow-x-auto whitespace-pre-wrap">{res.error}</pre>
                                )}

                                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                                  <div className="space-y-1">
                                    <p className="text-[9px] text-[#8b949e] uppercase font-bold">Input:</p>
                                    <pre className="p-1.5 rounded bg-black/20 text-[#8b949e] overflow-x-auto">{res.input}</pre>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[9px] text-[#8b949e] uppercase font-bold">Expected:</p>
                                    <pre className="p-1.5 rounded bg-black/20 text-[#10b981] overflow-x-auto">{res.expected}</pre>
                                  </div>
                                </div>
                                
                                {!res.passed && !res.error && (
                                  <div className="mt-2 text-[11px] font-mono space-y-1">
                                    <p className="text-[9px] text-[#ef4444] uppercase font-bold">Got Output:</p>
                                    <pre className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 overflow-x-auto">{res.actual || '(Empty Output)'}</pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        // Submit status success output
                        <div className="p-5 rounded-xl border border-[#10b981]/20 bg-[#10b981]/5 text-center space-y-4">
                          <CheckCircle2 className="w-12 h-12 text-[#10b981] mx-auto animate-bounce" />
                          <div className="space-y-1">
                            <h4 className="text-base font-extrabold text-white">Code Successfully Submitted!</h4>
                            <p className="text-xs text-[#8b949e]">
                              Passed <strong className="text-white font-mono">{consoleOutput.passedCount}/{consoleOutput.totalTests}</strong> sample test cases.
                            </p>
                          </div>
                          
                          {consoleOutput.allPassed ? (
                            <p className="text-xs text-[#10b981] font-bold bg-[#10b981]/15 px-3 py-1.5 rounded-lg border border-[#10b981]/25 inline-block">
                              +4 Points Added to Standings 🎉
                            </p>
                          ) : (
                            <p className="text-xs text-[#f59e0b] font-medium bg-[#f59e0b]/10 px-3 py-1.5 rounded-lg border border-[#f59e0b]/25 inline-block">
                              Submission recorded. Try matching all cases for +4 standing.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Console action footer button row */}
                <div className="p-4 border-t border-[#21262d] bg-[#0d1117]/85 flex items-center justify-between flex-shrink-0">
                  <div className="flex gap-2">
                    <button
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx((v) => v - 1)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#21262d] text-xs text-[#8b949e] hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    <button
                      disabled={isLastQuestion}
                      onClick={() => setCurrentQuestionIdx((v) => v + 1)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#21262d] text-xs text-[#8b949e] hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      disabled={isRunningActive || isSubmittingActive}
                      onClick={handleRunCode}
                      className="px-4 py-2 rounded-xl border border-[#30363d] bg-[#161b22] text-xs text-[#c9d1d9] font-semibold hover:text-white hover:bg-white/5 hover:border-[#8b949e] transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" /> Run Code
                    </button>

                    <button
                      disabled={isRunningActive || isSubmittingActive}
                      onClick={handleSubmitCode}
                      className="btn-neon btn-neon-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02] shadow-[0_0_12px_rgba(0,212,255,0.25)]"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Code
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* RIGHTMOST NAVIGATION SIDEBAR */}
        <div className="w-[260px] border-l border-[#21262d] bg-[#0c0e14] flex-shrink-0 flex flex-col justify-between overflow-y-auto">
          
          <div className="p-5 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Exam Standings Sync</h3>
              <div className="flex items-center justify-between text-[11px] text-[#8b949e] pt-1">
                <span>Completed: {attemptedCount} / {totalQuestions}</span>
                <span>Accuracy: {progressPercent.toFixed(0)}%</span>
              </div>
            </div>

            {/* Navigator Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Questions:</h3>
              
              {/* MCQ Segment */}
              {mcqQuestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#e9c46a] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#21262d]/50 pb-1">
                    <span>📌 MCQ Questions</span>
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {mcqQuestions.map(({ q, originalIndex }) => {
                      const isActive = currentQuestionIdx === originalIndex;
                      const isSaved = !!submittedAnswers[q.id];

                      let btnStyle = 'border-[#21262d] text-[#8b949e] bg-white/[0.01] hover:border-[#30363d]';
                      if (isActive) {
                        btnStyle = 'border-[#00d4ff] text-white bg-[#00d4ff]/10 shadow-[0_0_10px_rgba(0,212,255,0.15)] font-bold';
                      } else if (isSaved) {
                        const isCorrect = submittedAnswers[q.id].isCorrect;
                        btnStyle = isCorrect 
                          ? 'border-[#10b981]/50 text-white bg-[#10b981]/15 font-semibold'
                          : 'border-[#ef4444]/50 text-white bg-[#ef4444]/15 font-semibold';
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            setCurrentQuestionIdx(originalIndex);
                            setActiveLeftTab('description');
                          }}
                          className={`h-11 rounded-lg border flex flex-col items-center justify-center relative text-xs transition-all ${btnStyle}`}
                        >
                          <span className="font-semibold">{originalIndex + 1}</span>
                          <span className="text-[7px] opacity-70 font-mono tracking-tighter">MCQ</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Coding Segment */}
              {codingQuestions.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-[10px] font-bold text-[#a29bfe] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#21262d]/50 pb-1">
                    <span>💻 Coding Challenges</span>
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {codingQuestions.map(({ q, originalIndex }) => {
                      const isActive = currentQuestionIdx === originalIndex;
                      const isSaved = !!submittedAnswers[q.id];

                      let btnStyle = 'border-[#21262d] text-[#8b949e] bg-white/[0.01] hover:border-[#30363d]';
                      if (isActive) {
                        btnStyle = 'border-[#00d4ff] text-white bg-[#00d4ff]/10 shadow-[0_0_10px_rgba(0,212,255,0.15)] font-bold';
                      } else if (isSaved) {
                        const isCorrect = submittedAnswers[q.id].isCorrect;
                        btnStyle = isCorrect 
                          ? 'border-[#10b981]/50 text-white bg-[#10b981]/15 font-semibold'
                          : 'border-[#ef4444]/50 text-white bg-[#ef4444]/15 font-semibold';
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            setCurrentQuestionIdx(originalIndex);
                            setActiveLeftTab('description');
                          }}
                          className={`h-11 rounded-lg border flex flex-col items-center justify-center relative text-xs transition-all ${btnStyle}`}
                        >
                          <span className="font-semibold">{originalIndex + 1}</span>
                          <span className="text-[7px] opacity-70 font-mono tracking-tighter">CODE</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar quick metadata help */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#8b949e] leading-relaxed flex gap-2">
              <Sparkles className="w-4 h-4 text-[#00d4ff] flex-shrink-0 mt-0.5" />
              <span>Real-time rank updates are active. Once you finished attempting all questions, submit the assessment.</span>
            </div>
          </div>

          <div className="p-5 border-t border-[#21262d] space-y-4">
            <button
              onClick={() => setIsFinishConfirmOpen(true)}
              className="w-full btn-neon btn-neon-secondary text-xs py-2.5 hover:scale-[1.02]"
            >
              Submit & Finish Exam
            </button>
          </div>

        </div>

      </div>

      {/* CONFIRMATION OVERLAYS / MODALS */}
      <AnimatePresence>
        
        {/* Reset Code Modal */}
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-2xl p-6 border border-[#ef4444]/20 shadow-2xl max-w-sm w-full bg-[#0d1117] space-y-4"
            >
              <div className="flex items-center gap-3 text-[#ef4444]">
                <span className="p-2 rounded-lg bg-[#ef4444]/10">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-white">Reset Starter Template?</h3>
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                This will completely overwrite your current code draft and restore the default competitive programming starter boilerplate. <strong>This action cannot be undone.</strong>
              </p>
              <div className="flex gap-3 justify-end pt-2 text-xs">
                <button
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#21262d] text-[#8b949e] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetCode}
                  className="px-4 py-2 rounded-lg bg-[#ef4444] text-white font-semibold hover:bg-red-600 transition-colors"
                >
                  Reset Code
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Finish Exam Modal */}
        {isFinishConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-2xl p-6 border border-[#00d4ff]/20 shadow-2xl max-w-sm w-full bg-[#0d1117] space-y-4"
            >
              <div className="flex items-center gap-3 text-[#00d4ff]">
                <span className="p-2 rounded-lg bg-[#00d4ff]/10">
                  <Trophy className="w-5 h-5 animate-pulse" />
                </span>
                <h3 className="text-base font-bold text-white">Submit Assessment?</h3>
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Are you ready to submit your exam responses? You have attempted <strong>{attemptedCount} of {totalQuestions}</strong> questions in total. This will lock in your final standings score.
              </p>
              <div className="flex gap-3 justify-end pt-2 text-xs">
                <button
                  onClick={() => setIsFinishConfirmOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#21262d] text-[#8b949e] hover:text-white"
                >
                  Return to Exam
                </button>
                <button
                  onClick={finishAssessment}
                  className="px-4 py-2 rounded-lg btn-neon btn-neon-primary text-white font-bold"
                >
                  Yes, Submit Exam
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

      {/* FLOATING WEBCAM MONITORING FEED */}
      {hasStarted && isProctorStandard && !isCompleted && (
        <div className="fixed bottom-6 left-6 z-50 glass-card rounded-xl p-3 border border-[#00d4ff]/30 shadow-[0_0_20px_rgba(0,212,255,0.15)] bg-[#0d1117]/95 max-w-[160px] flex flex-col items-center gap-2 transition-all hover:scale-105">
          <div className="w-full flex items-center justify-between text-[9px] font-bold text-white uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              Proctor Feed
            </span>
            <span className="text-[#00d4ff] font-mono">Live</span>
          </div>
          <div className="w-32 h-24 rounded-lg bg-[#06080f] overflow-hidden border border-[#21262d] relative flex items-center justify-center">
            {cameraStream ? (
              <video
                ref={(video) => {
                  if (video && cameraStream && video.srcObject !== cameraStream) {
                    video.srcObject = cameraStream;
                    video.play().catch(err => console.error(err));
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-[#8b949e] p-2 text-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />
                <span className="text-[8px] font-semibold">Feed offline</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN LOCKDOWN BLOCKING OVERLAY */}
      {hasStarted && isProctorLockdown && !isFullscreen && !isCompleted && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#06080f]/98 backdrop-blur-md p-6 space-y-6">
          <div className="glass-card max-w-md w-full p-8 border border-[#ef4444]/40 bg-[#0d1117]/95 rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.25)] text-center space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center animate-bounce">
              <ShieldAlert className="w-8 h-8 text-[#ef4444]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-wide">Lockdown Enforced!</h2>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                This assessment is set to strict **Full Lockdown Mode**. You are required to stay in full-screen mode at all times. Leaving full-screen is registered as a violation and decreases your integrity score!
              </p>
            </div>
            <button
              onClick={async () => {
                await requestFullScreen();
                setIsFullscreen(true);
              }}
              className="w-full py-3 rounded-xl border border-[#00d4ff]/40 bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 text-white font-bold text-sm tracking-wide transition-all shadow-[0_0_15px_rgba(0,212,255,0.15)] flex items-center justify-center gap-2"
            >
              Re-enter Full Screen
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
