'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, FileText, Code2, Clock, Settings, 
  Plus, Trash2, CheckCircle, Sparkles, Brain, Check, ShieldAlert,
  ListTodo, Layers, RefreshCw, Languages, HelpCircle, Search, X, Filter, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const steps = ['Basic Info', 'AI Questions', 'Settings', 'Review'];

interface GeneratedQuestion {
  id?: string;
  title: string;
  type: 'CODING' | 'MCQ';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  description: string;
  // MCQ specific
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  // Coding specific
  constraints?: string[];
  examples?: string[];
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    explanation?: string;
    isHidden: boolean;
    isSample: boolean;
  }>;
}

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Basic Info Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assessmentType, setAssessmentType] = useState<'CODING' | 'APTITUDE' | 'MIXED'>('CODING');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [duration, setDuration] = useState(60);
  const [tags, setTags] = useState('');

  // AI Prompter Form State
  const [aiTopic, setAiTopic] = useState('');
  const [aiType, setAiType] = useState<'CODING' | 'MCQ'>('CODING');

  // Question list that will be saved in assessment
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [activeEditingIndex, setActiveEditingIndex] = useState<number | null>(null);

  // Settings
  const [allowedLanguages, setAllowedLanguages] = useState<string[]>(['python', 'javascript']);
  const [isPublic, setIsPublic] = useState(true);
  const [passPercentage, setPassPercentage] = useState(50);
  const [proctoringSettings, setProctoringSettings] = useState({
    aiProctoring: true,
    antiCopyPaste: true,
    browserLockdown: true,
    randomizeQuestions: false,
    showScoreImmediately: true
  });

  const [loadingMessage, setLoadingMessage] = useState('');

  // Step 1 - Question building tab state
  const [questionTab, setQuestionTab] = useState<'prompt' | 'manual' | 'bulk'>('prompt');

  // Manual Question Creator State
  const [manualTitle, setManualTitle] = useState('');
  const [manualType, setManualType] = useState<'CODING' | 'MCQ'>('CODING');
  const [manualDifficulty, setManualDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [manualDescription, setManualDescription] = useState('');
  const [manualTags, setManualTags] = useState('');
  // MCQ specific
  const [manualOptions, setManualOptions] = useState<string[]>(['', '', '', '']);
  const [manualCorrectAnswer, setManualCorrectAnswer] = useState('A');
  const [manualExplanation, setManualExplanation] = useState('');
  // Coding specific
  const [manualConstraints, setManualConstraints] = useState('');
  const [manualExamples, setManualExamples] = useState('');
  const [manualTestCases, setManualTestCases] = useState<Array<{
    input: string;
    expectedOutput: string;
    explanation?: string;
    isHidden: boolean;
    isSample: boolean;
  }>>([{ input: '', expectedOutput: '', isHidden: false, isSample: true }]);

  // AI Bulk-Paste Parser State
  const [bulkText, setBulkText] = useState('');
  const [isParsingBulk, setIsParsingBulk] = useState(false);

  // Proctoring Settings State
  const [proctoringLevel, setProctoringLevel] = useState<'NONE' | 'STANDARD' | 'LOCKDOWN'>('NONE');

  // Import Drawer State
  const [isImportDrawerOpen, setIsImportDrawerOpen] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [bankSearch, setBankSearch] = useState('');
  const [bankDifficulty, setBankDifficulty] = useState<string>('');
  const [bankType, setBankType] = useState<string>('');
  const [bankPage, setBankPage] = useState(1);
  const [bankTotalPages, setBankTotalPages] = useState(1);
  const [isFetchingBank, setIsFetchingBank] = useState(false);

  const fetchBankQuestions = async (page = 1) => {
    setIsFetchingBank(true);
    try {
      const query = new URLSearchParams();
      query.set('page', page.toString());
      query.set('limit', '6');
      if (bankSearch.trim()) query.set('search', bankSearch.trim());
      if (bankDifficulty) query.set('difficulty', bankDifficulty);
      if (bankType) query.set('type', bankType);

      const res = await fetch(`/api/v1/questions?${query.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setBankQuestions(data.data.questions);
        setBankTotalPages(data.data.pagination.pages || 1);
        setBankPage(page);
      } else {
        toast.error('Failed to load question bank.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching questions.');
    } finally {
      setIsFetchingBank(false);
    }
  };

  const handleImportQuestion = async (simpleQuestion: any) => {
    if (questions.some(q => q.id === simpleQuestion.id)) {
      toast.error('Question is already added to this assessment.');
      return;
    }

    toast.loading('Fetching question details...', { id: 'import-q' });
    try {
      const res = await fetch(`/api/v1/questions/${simpleQuestion.id}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to load details.');
      }

      const q = data.data;
      const imported: GeneratedQuestion = {
        id: q.id,
        title: q.title,
        type: q.type,
        difficulty: q.difficulty,
        tags: q.tags || [],
        description: q.description,
        options: q.type === 'MCQ' ? q.examples : undefined,
        correctAnswer: q.type === 'MCQ' ? q.solution : undefined,
        explanation: q.type === 'MCQ' ? (q.hints?.[0] || '') : undefined,
        constraints: q.type === 'CODING' ? (q.constraints || []) : undefined,
        examples: q.type === 'CODING' ? (q.examples || []) : undefined,
        testCases: q.type === 'CODING' ? q.testCases?.map((tc: any) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          explanation: tc.explanation,
          isHidden: tc.isHidden || false,
          isSample: tc.isSample || false
        })) : []
      };

      setQuestions(prev => [...prev, imported]);
      toast.dismiss('import-q');
      toast.success(`Imported "${q.title}" successfully! 🎉`);
    } catch (err: any) {
      toast.dismiss('import-q');
      toast.error(err.message || 'Failed to import question.');
    }
  };

  const loadingMessages = [
    'Consulting expert competitive programming coach...',
    'Synthesizing rigorous test cases...',
    'Structuring custom technical constraints...',
    'Formulating challenging distractors...',
    'Drafting detailed logical explanations...',
    'Verifying question complexity index...'
  ];

  // Trigger AI generation
  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      toast.error('Please enter a topic or concept title.');
      return;
    }

    setIsGenerating(true);
    let msgIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[msgIndex]);
    }, 2500);

    try {
      const response = await fetch('/api/v1/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: aiTopic,
          type: aiType
        })
      });

      const data = await response.json();
      clearInterval(interval);

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to generate question');
      }

      const generated = data.data;

      // Map to standard form questions structure
      const newQuestion: GeneratedQuestion = {
        title: aiTopic,
        type: aiType,
        difficulty: generated.difficulty || 'MEDIUM',
        tags: generated.tags || ['General'],
        description: generated.description,
        // MCQ Fields
        options: generated.options,
        correctAnswer: generated.correctAnswer,
        explanation: generated.explanation,
        // Coding Fields
        constraints: generated.constraints || [],
        examples: generated.examples || [],
        testCases: generated.testCases?.map((tc: any) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          explanation: tc.explanation,
          isHidden: tc.isHidden || false,
          isSample: tc.isSample || false
        })) || []
      };

      setQuestions([...questions, newQuestion]);
      setActiveEditingIndex(questions.length); // Open edit drawer for newly generated item
      setAiTopic('');
      toast.success('Successfully generated beautiful question structure! 🎉');
    } catch (error: any) {
      clearInterval(interval);
      toast.error(error.message || 'AI Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Add manual question
  const handleAddManualQuestion = () => {
    if (!manualTitle.trim()) {
      toast.error('Question title is required.');
      return;
    }
    if (!manualDescription.trim()) {
      toast.error('Question description is required.');
      return;
    }

    let newQuestion: GeneratedQuestion;
    if (manualType === 'MCQ') {
      if (manualOptions.some(opt => !opt.trim())) {
        toast.error('Please fill in all 4 MCQ options.');
        return;
      }
      newQuestion = {
        title: manualTitle.trim(),
        type: 'MCQ',
        difficulty: manualDifficulty,
        tags: manualTags.split(',').map(t => t.trim()).filter(Boolean),
        description: manualDescription.trim(),
        options: [...manualOptions],
        correctAnswer: manualCorrectAnswer,
        explanation: manualExplanation.trim()
      };
    } else {
      const validTestCases = manualTestCases.filter(tc => tc.input.trim() || tc.expectedOutput.trim());
      if (validTestCases.length === 0) {
        toast.error('Please add at least one test case for the coding question.');
        return;
      }
      newQuestion = {
        title: manualTitle.trim(),
        type: 'CODING',
        difficulty: manualDifficulty,
        tags: manualTags.split(',').map(t => t.trim()).filter(Boolean),
        description: manualDescription.trim(),
        constraints: manualConstraints.split('\n').map(c => c.trim()).filter(Boolean),
        examples: manualExamples.split('\n').map(e => e.trim()).filter(Boolean),
        testCases: validTestCases.map(tc => ({
          input: tc.input.trim(),
          expectedOutput: tc.expectedOutput.trim(),
          isHidden: tc.isHidden,
          isSample: tc.isSample
        }))
      };
    }

    setQuestions([...questions, newQuestion]);
    toast.success('Manual question added successfully! 🎉');
    
    // Reset form
    setManualTitle('');
    setManualDescription('');
    setManualTags('');
    setManualOptions(['', '', '', '']);
    setManualCorrectAnswer('A');
    setManualExplanation('');
    setManualConstraints('');
    setManualExamples('');
    setManualTestCases([{ input: '', expectedOutput: '', isHidden: false, isSample: true }]);
  };

  // AI Bulk-Paste Parser Handler
  const handleParseBulk = async () => {
    if (!bulkText.trim()) {
      toast.error('Please paste some text to parse.');
      return;
    }
    setIsParsingBulk(true);
    toast.loading('Gemini is parsing and structuring your questions...', { id: 'bulk-parse' });
    try {
      const res = await fetch('/api/v1/questions/parse-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bulkText })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to parse questions.');
      }
      
      const parsedQuestions: GeneratedQuestion[] = data.data;
      if (!parsedQuestions || parsedQuestions.length === 0) {
        throw new Error('No questions could be parsed from the provided text.');
      }
      
      setQuestions(prev => [...prev, ...parsedQuestions]);
      toast.dismiss('bulk-parse');
      toast.success(`Successfully parsed and imported ${parsedQuestions.length} questions! 🎉`);
      setBulkText('');
    } catch (err: any) {
      toast.dismiss('bulk-parse');
      toast.error(err.message || 'Error parsing bulk questions.');
    } finally {
      setIsParsingBulk(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, idx) => idx !== index);
    setQuestions(updated);
    if (activeEditingIndex === index) {
      setActiveEditingIndex(null);
    } else if (activeEditingIndex !== null && activeEditingIndex > index) {
      setActiveEditingIndex(activeEditingIndex - 1);
    }
    toast.success('Question removed.');
  };

  // Submit assessment and publish to database
  const handlePublishAssessment = async () => {
    // Client-side validations
    if (!title || title.trim().length < 3) {
      toast.error('Assessment Title must be at least 3 characters long.');
      return;
    }
    if (description.trim().length > 2000) {
      toast.error('Assessment Description must not exceed 2000 characters.');
      return;
    }
    if (duration < 1 || duration > 480) {
      toast.error('Duration must be between 1 and 480 minutes.');
      return;
    }
    if (questions.length === 0) {
      toast.error('Please add at least one question to the assessment.');
      return;
    }
    if (assessmentType !== 'APTITUDE' && allowedLanguages.length === 0) {
      toast.error('Please select at least one allowed programming language.');
      return;
    }

    // Dynamic description fallback if description is less than 10 characters
    let finalDescription = description.trim();
    if (!finalDescription || finalDescription.length < 10) {
      finalDescription = `Comprehensive ${assessmentType.toLowerCase().replace(/_/g, ' ')} evaluation on "${title}" covering core technical concepts and analytical problem-solving exercises. This assessment is calibrated at a ${difficulty.toLowerCase()} difficulty level.`;
    }

    setIsPublishing(true);
    toast.loading('Publishing questions and creating assessment...', { id: 'publish' });

    try {
      const createdQuestionIds: string[] = [];

      // 1. Create questions in the question bank one by one
      for (const q of questions) {
        if (q.id) {
          createdQuestionIds.push(q.id);
          continue;
        }

        // Prepare request body
        const questionPayload: any = {
          title: q.title,
          slug: q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: q.description,
          type: q.type,
          difficulty: q.difficulty,
          tags: q.tags,
          isPublic: true
        };

        if (q.type === 'MCQ') {
          questionPayload.examples = q.options; // Options A, B, C, D
          questionPayload.solution = q.correctAnswer;
          questionPayload.hints = [q.explanation || ''];
        } else {
          questionPayload.constraints = q.constraints;
          questionPayload.examples = q.examples;
          questionPayload.testCases = q.testCases;
        }

        const res = await fetch('/api/v1/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questionPayload)
        });

        const resData = await res.json();
        if (!res.ok || !resData.success) {
          throw new Error(resData.error?.message || 'Failed to save question to bank');
        }

        createdQuestionIds.push(resData.data.id);
      }

      // Calculate totals
      const totalMarks = questions.length * 4; // 4 marks per question
      const passingMarks = Math.ceil((totalMarks * passPercentage) / 100);

      // 2. Save Assessment with linked questions
      const assessmentPayload = {
        title: title.trim(),
        description: finalDescription,
        type: assessmentType,
        difficulty,
        duration,
        totalMarks,
        passingMarks,
        isPublic,
        allowedLanguages: assessmentType === 'APTITUDE' ? undefined : allowedLanguages.map(lang => lang.toUpperCase()),
        tags: [
          ...tags.split(',').map(t => t.trim()).filter(Boolean),
          `PROCTOR:${proctoringLevel}`
        ],
        instructions: `Welcome to the ${title} exam. This is a secure assessment carries ${totalMarks} marks with ${questions.length} questions. Correct answers award 4 points. Good luck!`,
        questions: createdQuestionIds.map((qid, idx) => ({
          questionId: qid,
          order: idx + 1,
          marks: 4
        }))
      };

      const resAssess = await fetch('/api/v1/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentPayload)
      });

      const resAssessData = await resAssess.json();
      if (!resAssess.ok || !resAssessData.success) {
        let errMsg = resAssessData.error?.message || 'Failed to publish assessment';
        if (resAssessData.error?.details && Array.isArray(resAssessData.error.details)) {
          const detailMsgs = resAssessData.error.details
            .map((d: any) => `${d.path.join('.')}: ${d.message}`)
            .join(', ');
          if (detailMsgs) {
            errMsg += ` (${detailMsgs})`;
          }
        }
        throw new Error(errMsg);
      }

      // Connect leaderboard for this assessment immediately
      try {
        await fetch('/api/v1/leaderboards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessmentId: resAssessData.data.id,
            enabled: true
          })
        });
      } catch (err) {
        console.error('Failed to auto-connect leaderboard:', err);
      }

      toast.dismiss('publish');
      toast.success('Assessment created & connected to leaderboard! 🚀');
      
      // Redirect back to admin dashboard assessments
      router.push('/admin/leaderboards');
    } catch (error: any) {
      toast.dismiss('publish');
      toast.error(error.message || 'Failed to publish assessment.');
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Brain className="w-8 h-8 text-[#7c3aed]" />
            AI Assessment Builder
          </h1>
          <p className="text-sm text-[#8b949e] mt-1">
            Build secure Coding & MCQ assessments in seconds powered by custom Gemini LLMs.
          </p>
        </div>
      </div>

      {/* Steps Progress */}
      <div className="flex items-center gap-2 bg-[#0d1117]/80 p-4 rounded-xl border border-[#21262d] backdrop-blur-md">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
              i <= step ? 'bg-gradient-to-r from-[#0066ff] to-[#7c3aed] text-white' : 'bg-[#161b22] text-[#484f58] border border-[#21262d]'
            }`}>{i < step ? <CheckCircle className="w-4 h-4 text-white" /> : i + 1}</div>
            <span className={`text-xs font-medium hidden sm:block ${i <= step ? 'text-white' : 'text-[#484f58]'}`}>{s}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-[#0066ff]' : 'bg-[#21262d]'}`} />}
          </div>
        ))}
      </div>

      {/* Form Content Area */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-xl p-6 relative border border-[#21262d]">
            
            {/* STEP 0: BASIC INFORMATION */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="flex items-center gap-2 border-b border-[#21262d] pb-3 mb-2">
                  <FileText className="w-5 h-5 text-[#00d4ff]" />
                  <h2 className="text-lg font-bold text-white">Assessment Parameters</h2>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#c9d1d9] mb-1.5">Assessment Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Senior Systems Software Engineer Examination" 
                    className="input-neon w-full" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#c9d1d9] mb-1.5">Description</label>
                  <textarea 
                    rows={4} 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the assessment objectives and guidelines..." 
                    className="input-neon w-full resize-none" 
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#c9d1d9] mb-1.5">Assessment Type</label>
                    <select 
                      value={assessmentType} 
                      onChange={(e) => setAssessmentType(e.target.value as any)} 
                      className="input-neon w-full appearance-none cursor-pointer"
                    >
                      <option value="CODING">Coding Assessment</option>
                      <option value="APTITUDE">Technical MCQ Assessment</option>
                      <option value="MIXED">Mixed (Coding & MCQs)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#c9d1d9] mb-1.5">Global Difficulty</label>
                    <select 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(e.target.value as any)} 
                      className="input-neon w-full"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#c9d1d9] mb-1.5">Duration (minutes)</label>
                    <input 
                      type="number" 
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      placeholder="60" 
                      className="input-neon w-full" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#c9d1d9] mb-1.5">Tags (comma-separated)</label>
                    <input 
                      type="text" 
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="react, algorithm, sql, systems" 
                      className="input-neon w-full" 
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 1: AI QUESTION GENERATION WORKSPACE */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#f59e0b] animate-pulse" />
                    <h2 className="text-lg font-bold text-white">AI Question Builder</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsImportDrawerOpen(true);
                        fetchBankQuestions(1);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#0066ff]/10 text-[#0066ff] hover:bg-[#0066ff]/20 border border-[#0066ff]/20 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Import from Bank
                    </button>
                    <span className="text-xs px-2.5 py-1.5 rounded-full bg-[#161b22] border border-[#21262d] text-[#8b949e]">
                      {questions.length} Added
                    </span>
                  </div>
                </div>

                {/* Mode Tabs */}
                <div className="flex gap-2 p-1 bg-[#0d1117] rounded-lg border border-[#21262d]">
                  {[
                    { id: 'prompt', name: 'AI Topic Generator', icon: Sparkles },
                    { id: 'manual', name: 'Manual Question Creator', icon: Plus },
                    { id: 'bulk', name: 'AI Bulk-Paste Parser', icon: ListTodo }
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setQuestionTab(t.id as any)}
                        type="button"
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          questionTab === t.id
                            ? 'bg-gradient-to-r from-[#0066ff] to-[#7c3aed] text-white shadow-md'
                            : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]/50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {t.name}
                      </button>
                    );
                  })}
                </div>

                {/* AI Prompter Tab */}
                {questionTab === 'prompt' && (
                  <div className="bg-[#161b22]/50 p-5 rounded-xl border border-[#30363d] space-y-4">
                    <div className="flex items-center gap-1 text-xs text-[#8b949e] font-semibold">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Enter the specific technical topic or algorithmic puzzle title:
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="e.g. Reverse a LinkedList, SQL Nth Highest Salary, React Closures"
                        className="input-neon flex-1 text-sm"
                        disabled={isGenerating}
                      />
                      <select
                        value={aiType}
                        onChange={(e) => setAiType(e.target.value as any)}
                        className="input-neon bg-[#0d1117] text-xs font-semibold text-white px-3"
                        disabled={isGenerating}
                      >
                        <option value="CODING">Coding Problem</option>
                        <option value="MCQ">Technical MCQ</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleAIGenerate}
                      disabled={isGenerating}
                      type="button"
                      className="w-full btn-neon btn-neon-primary text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-50 cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          {loadingMessage}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-white" />
                          Auto-Generate complete structure with AI
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Manual Question Creator Tab */}
                {questionTab === 'manual' && (
                  <div className="bg-[#161b22]/50 p-5 rounded-xl border border-[#30363d] space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#c9d1d9] mb-1.5">Question Title</label>
                        <input
                          type="text"
                          value={manualTitle}
                          onChange={(e) => setManualTitle(e.target.value)}
                          placeholder="e.g. Implement Queue using Stack"
                          className="input-neon w-full text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#c9d1d9] mb-1.5">Question Type</label>
                          <select
                            value={manualType}
                            onChange={(e) => setManualType(e.target.value as any)}
                            className="input-neon w-full text-xs font-semibold text-white px-2 cursor-pointer"
                          >
                            <option value="CODING">Coding Problem</option>
                            <option value="MCQ">Technical MCQ</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#c9d1d9] mb-1.5">Difficulty</label>
                          <select
                            value={manualDifficulty}
                            onChange={(e) => setManualDifficulty(e.target.value as any)}
                            className="input-neon w-full text-xs font-semibold text-white px-2 cursor-pointer"
                          >
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HARD">Hard</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#c9d1d9] mb-1.5">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={manualTags}
                        onChange={(e) => setManualTags(e.target.value)}
                        placeholder="react, algorithm, recursion"
                        className="input-neon w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#c9d1d9] mb-1.5">Description (Markdown Supported)</label>
                      <textarea
                        rows={4}
                        value={manualDescription}
                        onChange={(e) => setManualDescription(e.target.value)}
                        placeholder="Write a clear statement of the question..."
                        className="input-neon w-full text-xs font-sans resize-none"
                      />
                    </div>

                    {/* MCQ Config */}
                    {manualType === 'MCQ' ? (
                      <div className="space-y-3 pt-2 border-t border-[#21262d]">
                        <label className="block text-xs font-semibold text-[#c9d1d9]">MCQ Options and Correct Answer:</label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {manualOptions.map((opt, oIdx) => {
                            const label = String.fromCharCode(65 + oIdx);
                            return (
                              <div key={oIdx} className="flex items-center gap-2 bg-[#0d1117] p-2 rounded-lg border border-[#21262d]">
                                <span className="font-bold text-[#8b949e] text-xs">{label}</span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const updated = [...manualOptions];
                                    updated[oIdx] = e.target.value;
                                    setManualOptions(updated);
                                  }}
                                  placeholder={`Option ${label}`}
                                  className="bg-transparent border-none text-white text-xs outline-none flex-1"
                                />
                                <input
                                  type="radio"
                                  name="manual-correct"
                                  checked={manualCorrectAnswer === label}
                                  onChange={() => setManualCorrectAnswer(label)}
                                  className="w-3.5 h-3.5 cursor-pointer accent-[#0066ff]"
                                />
                              </div>
                            );
                          })}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#c9d1d9] mb-1.5">Technical Explanation</label>
                          <textarea
                            rows={2}
                            value={manualExplanation}
                            onChange={(e) => setManualExplanation(e.target.value)}
                            placeholder="Why is this option correct?"
                            className="input-neon w-full text-xs resize-none"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Coding Config */
                      <div className="space-y-4 pt-2 border-t border-[#21262d]">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1.5">Constraints (one per line)</label>
                            <textarea
                              rows={3}
                              value={manualConstraints}
                              onChange={(e) => setManualConstraints(e.target.value)}
                              placeholder="e.g. 1 <= N <= 10^5&#10;Time Complexity: O(N)"
                              className="input-neon w-full text-xs font-mono resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1.5">Examples (one per line)</label>
                            <textarea
                              rows={3}
                              value={manualExamples}
                              onChange={(e) => setManualExamples(e.target.value)}
                              placeholder="e.g. Input: nums = [2,7], target = 9 | Output: [0,1]"
                              className="input-neon w-full text-xs font-mono resize-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-[#c9d1d9]">Test Cases ({manualTestCases.length}):</label>
                            <button
                              onClick={() => setManualTestCases([...manualTestCases, { input: '', expectedOutput: '', isHidden: false, isSample: false }])}
                              type="button"
                              className="text-[10px] text-[#58a6ff] border border-[#21262d] px-2 py-0.5 rounded hover:bg-[#21262d] font-semibold cursor-pointer"
                            >
                              + Add Test Case
                            </button>
                          </div>

                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {manualTestCases.map((tc, tcIdx) => (
                              <div key={tcIdx} className="bg-[#0d1117] p-3 rounded-lg border border-[#21262d] space-y-2 relative">
                                {manualTestCases.length > 1 && (
                                  <button
                                    onClick={() => setManualTestCases(manualTestCases.filter((_, tIdx) => tIdx !== tcIdx))}
                                    type="button"
                                    className="absolute top-2 right-2 text-[#8b949e] hover:text-[#ef4444] cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                  <div>
                                    <span className="text-[#8b949e] font-semibold block mb-0.5">Input:</span>
                                    <input
                                      type="text"
                                      value={tc.input}
                                      onChange={(e) => {
                                        const updated = [...manualTestCases];
                                        updated[tcIdx].input = e.target.value;
                                        setManualTestCases(updated);
                                      }}
                                      placeholder="e.g. 5"
                                      className="bg-[#161b22] border border-[#21262d] text-white rounded px-2 py-1 w-full font-mono text-[10px]"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[#8b949e] font-semibold block mb-0.5">Expected Output:</span>
                                    <input
                                      type="text"
                                      value={tc.expectedOutput}
                                      onChange={(e) => {
                                        const updated = [...manualTestCases];
                                        updated[tcIdx].expectedOutput = e.target.value;
                                        setManualTestCases(updated);
                                      }}
                                      placeholder="e.g. 25"
                                      className="bg-[#161b22] border border-[#21262d] text-white rounded px-2 py-1 w-full font-mono text-[10px]"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 pt-1">
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={tc.isSample}
                                      onChange={(e) => {
                                        const updated = [...manualTestCases];
                                        updated[tcIdx].isSample = e.target.checked;
                                        if (e.target.checked) updated[tcIdx].isHidden = false;
                                        setManualTestCases(updated);
                                      }}
                                      className="rounded bg-[#161b22] border-[#21262d]"
                                    />
                                    <span className="text-[10px] text-[#8b949e]">Is Sample Case</span>
                                  </label>
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={tc.isHidden}
                                      onChange={(e) => {
                                        const updated = [...manualTestCases];
                                        updated[tcIdx].isHidden = e.target.checked;
                                        if (e.target.checked) updated[tcIdx].isSample = false;
                                        setManualTestCases(updated);
                                      }}
                                      className="rounded bg-[#161b22] border-[#21262d]"
                                    />
                                    <span className="text-[10px] text-[#8b949e]">Is Hidden Case</span>
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleAddManualQuestion}
                      type="button"
                      className="w-full btn-neon btn-neon-primary text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,102,255,0.4)] cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      Add Manual Question to Assessment
                    </button>
                  </div>
                )}

                {/* AI Bulk-Paste Parser Tab */}
                {questionTab === 'bulk' && (
                  <div className="bg-[#161b22]/50 p-5 rounded-xl border border-[#30363d] space-y-4">
                    <div className="flex items-center gap-1 text-xs text-[#8b949e] font-semibold">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Paste raw, unstructured assessment questions, descriptions, or exam text below. Gemini will parse MCQs and Coding problems automatically:
                    </div>
                    <div>
                      <textarea
                        rows={10}
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder={`e.g.
1. What is the output of console.log(typeof null)?
A. "object"
B. "null"
C. "undefined"
D. "number"
Answer: A

2. Coding problem: Write a function to check if a number is prime.
Input: 7 -> Output: true
Input: 4 -> Output: false
`}
                        className="input-neon w-full text-xs font-mono resize-none leading-relaxed"
                        disabled={isParsingBulk}
                      />
                    </div>
                    <button
                      onClick={handleParseBulk}
                      disabled={isParsingBulk}
                      type="button"
                      className="w-full btn-neon btn-neon-primary text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-50 cursor-pointer"
                    >
                      {isParsingBulk ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          Gemini is parsing your raw text...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-white" />
                          Parse and Import with Gemini AI
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* AI Review Workspace / In-Place Editors */}
                {questions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#c9d1d9] flex items-center gap-1.5">
                      <ListTodo className="w-4 h-4" />
                      Verify and Customize Generated Question Bank:
                    </h3>

                    <div className="divide-y divide-[#21262d] border border-[#21262d] rounded-xl overflow-hidden bg-[#161b22]/20">
                      {questions.map((q, idx) => (
                        <div key={idx} className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] font-mono">#{idx + 1}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                                q.type === 'MCQ' ? 'bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20' : 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20'
                              }`}>{q.type}</span>
                              <h4 className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-md">{q.title}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setActiveEditingIndex(activeEditingIndex === idx ? null : idx)}
                                className="text-xs font-semibold text-[#58a6ff] hover:underline"
                              >
                                {activeEditingIndex === idx ? 'Close Edit' : 'Edit Question'}
                              </button>
                              <button 
                                onClick={() => handleDeleteQuestion(idx)}
                                className="text-[#8b949e] hover:text-[#ef4444] transition-colors p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Interactive Drawer for customization */}
                          {activeEditingIndex === idx && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: 'auto' }}
                              className="border-t border-[#21262d] pt-4 mt-3 space-y-4 text-xs"
                            >
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-[#8b949e] mb-1">Question Title</label>
                                  <input 
                                    type="text" 
                                    value={q.title} 
                                    onChange={(e) => {
                                      const updated = [...questions];
                                      updated[idx].title = e.target.value;
                                      setQuestions(updated);
                                    }}
                                    className="input-neon w-full !text-xs !py-1.5"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-[#8b949e] mb-1">Difficulty</label>
                                  <select 
                                    value={q.difficulty}
                                    onChange={(e) => {
                                      const updated = [...questions];
                                      updated[idx].difficulty = e.target.value as any;
                                      setQuestions(updated);
                                    }}
                                    className="input-neon w-full !text-xs !py-1.5"
                                  >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-[#8b949e] mb-1">Description (Markdown Supported)</label>
                                <textarea 
                                  rows={6}
                                  value={q.description}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    updated[idx].description = e.target.value;
                                    setQuestions(updated);
                                  }}
                                  className="input-neon w-full !text-xs font-mono"
                                />
                              </div>

                              {/* MCQ Options customization */}
                              {q.type === 'MCQ' && q.options && (
                                <div className="space-y-3">
                                  <label className="block text-xs font-semibold text-[#8b949e]">Configure 4 Multiple Choice Options:</label>
                                  <div className="grid sm:grid-cols-2 gap-3">
                                    {q.options.map((opt, oIdx) => {
                                      const label = String.fromCharCode(65 + oIdx); // A, B, C, D
                                      return (
                                        <div key={oIdx} className="flex items-center gap-2 bg-[#0d1117] p-2.5 rounded-lg border border-[#21262d]">
                                          <span className="font-bold text-[#8b949e]">{label}</span>
                                          <input 
                                            type="text" 
                                            value={opt}
                                            onChange={(e) => {
                                              const updated = [...questions];
                                              if (updated[idx].options) {
                                                updated[idx].options![oIdx] = e.target.value;
                                                setQuestions(updated);
                                              }
                                            }}
                                            className="bg-transparent border-none text-white text-xs outline-none flex-1"
                                          />
                                          <input 
                                            type="radio" 
                                            name={`correct-${idx}`}
                                            checked={q.correctAnswer === label}
                                            onChange={() => {
                                              const updated = [...questions];
                                              updated[idx].correctAnswer = label;
                                              setQuestions(updated);
                                              toast.success(`Option ${label} marked as correct!`);
                                            }}
                                            className="w-3.5 h-3.5 cursor-pointer accent-[#0066ff]"
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-[#8b949e] mb-1">Detailed Technical Explanation</label>
                                    <textarea 
                                      rows={3}
                                      value={q.explanation || ''}
                                      onChange={(e) => {
                                        const updated = [...questions];
                                        updated[idx].explanation = e.target.value;
                                        setQuestions(updated);
                                      }}
                                      placeholder="Provide context explaining why correct choice works..."
                                      className="input-neon w-full !text-xs font-mono"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Coding Constraints & Test cases customization */}
                              {q.type === 'CODING' && (
                                <div className="space-y-4 border-t border-[#21262d] pt-3">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <label className="text-xs font-semibold text-[#8b949e]">System Test Cases ({q.testCases?.length}):</label>
                                      <button 
                                        onClick={() => {
                                          const updated = [...questions];
                                          updated[idx].testCases = [
                                            ...(updated[idx].testCases || []),
                                            { input: '', expectedOutput: '', isHidden: false, isSample: false }
                                          ];
                                          setQuestions(updated);
                                        }}
                                        className="text-[10px] text-[#58a6ff] border border-[#21262d] px-2 py-0.5 rounded hover:bg-[#21262d] font-semibold"
                                      >
                                        + Add Test Case
                                      </button>
                                    </div>
                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                      {q.testCases?.map((tc, tcIdx) => (
                                        <div key={tcIdx} className="bg-[#0d1117] p-3 rounded-lg border border-[#21262d] space-y-2 relative">
                                          <button 
                                            onClick={() => {
                                              const updated = [...questions];
                                              updated[idx].testCases = updated[idx].testCases!.filter((_, tIdx) => tIdx !== tcIdx);
                                              setQuestions(updated);
                                            }}
                                            className="absolute top-2 right-2 text-[#8b949e] hover:text-[#ef4444]"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                                            <div>
                                              <span className="text-[#8b949e] font-semibold block mb-0.5">Input:</span>
                                              <input 
                                                type="text" 
                                                value={tc.input} 
                                                onChange={(e) => {
                                                  const updated = [...questions];
                                                  updated[idx].testCases![tcIdx].input = e.target.value;
                                                  setQuestions(updated);
                                                }}
                                                className="bg-[#161b22] border border-[#21262d] text-white rounded px-2 py-1 w-full font-mono"
                                              />
                                            </div>
                                            <div>
                                              <span className="text-[#8b949e] font-semibold block mb-0.5">Expected Output:</span>
                                              <input 
                                                type="text" 
                                                value={tc.expectedOutput} 
                                                onChange={(e) => {
                                                  const updated = [...questions];
                                                  updated[idx].testCases![tcIdx].expectedOutput = e.target.value;
                                                  setQuestions(updated);
                                                }}
                                                className="bg-[#161b22] border border-[#21262d] text-white rounded px-2 py-1 w-full font-mono"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-4 pt-1">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                              <input 
                                                type="checkbox" 
                                                checked={tc.isSample}
                                                onChange={(e) => {
                                                  const updated = [...questions];
                                                  updated[idx].testCases![tcIdx].isSample = e.target.checked;
                                                  if (e.target.checked) updated[idx].testCases![tcIdx].isHidden = false;
                                                  setQuestions(updated);
                                                }}
                                                className="rounded bg-[#161b22] border-[#21262d]"
                                              />
                                              <span className="text-[10px] text-[#8b949e]">Is Sample Case</span>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                              <input 
                                                type="checkbox" 
                                                checked={tc.isHidden}
                                                onChange={(e) => {
                                                  const updated = [...questions];
                                                  updated[idx].testCases![tcIdx].isHidden = e.target.checked;
                                                  if (e.target.checked) updated[idx].testCases![tcIdx].isSample = false;
                                                  setQuestions(updated);
                                                }}
                                                className="rounded bg-[#161b22] border-[#21262d]"
                                              />
                                              <span className="text-[10px] text-[#8b949e]">Is Hidden Case</span>
                                            </label>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: SETTINGS */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="flex items-center gap-2 border-b border-[#21262d] pb-3 mb-2">
                  <Languages className="w-5 h-5 text-[#10b981]" />
                  <h2 className="text-lg font-bold text-white">Allowed Frameworks & Restrictions</h2>
                </div>

                {assessmentType !== 'APTITUDE' && (
                  <div>
                    <label className="block text-sm font-semibold text-[#c9d1d9] mb-2">Allowed Programming Languages</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'python', name: 'Python' },
                        { id: 'javascript', name: 'JavaScript' },
                        { id: 'java', name: 'Java' },
                        { id: 'cpp', name: 'C++' }
                      ].map((lang) => (
                        <label 
                          key={lang.id} 
                          className={`flex items-center justify-between px-4 py-3 rounded-xl bg-[#161b22]/50 border transition-all cursor-pointer ${
                            allowedLanguages.includes(lang.id) ? 'border-[#0066ff] bg-[#0066ff]/5' : 'border-[#21262d] hover:border-[#30363d]'
                          }`}
                        >
                          <span className="text-sm text-white font-medium">{lang.name}</span>
                          <input 
                            type="checkbox" 
                            checked={allowedLanguages.includes(lang.id)}
                            onChange={() => {
                              if (allowedLanguages.includes(lang.id)) {
                                setAllowedLanguages(allowedLanguages.filter(l => l !== lang.id));
                              } else {
                                setAllowedLanguages([...allowedLanguages, lang.id]);
                              }
                            }}
                            className="w-4 h-4 rounded text-[#0066ff] focus:ring-[#0066ff] border-[#21262d]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#c9d1d9] mb-1.5">Pass Percentage Required</label>
                    <input 
                      type="number" 
                      value={passPercentage}
                      onChange={(e) => setPassPercentage(Number(e.target.value))}
                      placeholder="50" 
                      className="input-neon w-full" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#c9d1d9] mb-1.5">Assessment Visibility</label>
                    <select 
                      value={isPublic ? 'public' : 'private'}
                      onChange={(e) => setIsPublic(e.target.value === 'public')}
                      className="input-neon w-full"
                    >
                      <option value="public">Public (Visible to All Candidates)</option>
                      <option value="private">Private (Invite Only via Code)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-3 border-t border-[#21262d]">
                  <div>
                    <label className="block text-sm font-semibold text-[#c9d1d9] mb-1.5">Proctoring Enforcement Level</label>
                    <select 
                      value={proctoringLevel} 
                      onChange={(e) => {
                        const lvl = e.target.value as 'NONE' | 'STANDARD' | 'LOCKDOWN';
                        setProctoringLevel(lvl);
                        if (lvl === 'NONE') {
                          setProctoringSettings({
                            aiProctoring: false,
                            antiCopyPaste: false,
                            browserLockdown: false,
                            randomizeQuestions: proctoringSettings.randomizeQuestions,
                            showScoreImmediately: proctoringSettings.showScoreImmediately
                          });
                        } else if (lvl === 'STANDARD') {
                          setProctoringSettings({
                            aiProctoring: true,
                            antiCopyPaste: true,
                            browserLockdown: false,
                            randomizeQuestions: proctoringSettings.randomizeQuestions,
                            showScoreImmediately: proctoringSettings.showScoreImmediately
                          });
                        } else if (lvl === 'LOCKDOWN') {
                          setProctoringSettings({
                            aiProctoring: true,
                            antiCopyPaste: true,
                            browserLockdown: true,
                            randomizeQuestions: proctoringSettings.randomizeQuestions,
                            showScoreImmediately: proctoringSettings.showScoreImmediately
                          });
                        }
                      }} 
                      className="input-neon w-full appearance-none cursor-pointer text-sm"
                    >
                      <option value="NONE">None (Self-Proctored / Open Environment)</option>
                      <option value="STANDARD">Standard (WebRTC Camera Feed + Copy-Paste Locks)</option>
                      <option value="LOCKDOWN">Lockdown (Camera Feed + Full Copy-Paste Block + Screen Lockdown Modal)</option>
                    </select>
                    <p className="text-xs text-[#8b949e] mt-1.5 leading-relaxed">
                      {proctoringLevel === 'NONE' && "Candidates have standard freedom. Recommended for take-home or low-stakes quizzes."}
                      {proctoringLevel === 'STANDARD' && "Enables live front-facing WebRTC monitoring and intercepts clipboard / copy-paste operations."}
                      {proctoringLevel === 'LOCKDOWN' && "Full screen lockdown is strictly enforced. Attempting to minimize, change tabs, or exit full screen completely locks candidate workspace until full screen is restored, and auto-deducts integrity score."}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-3 border-t border-[#21262d]">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-[#ef4444]" /> Security and AI Proctoring
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'aiProctoring', label: 'Enable Real-time AI Proctoring', desc: 'Monitors candidate camera feed, audio cues, and multi-face detections during attempt.' },
                      { key: 'antiCopyPaste', label: 'Enforce Anti Copy-Paste Restrictions', desc: 'Blocks context-menus, drag drops, clipboard triggers, and keyboard shortcuts inside playgrounds.' },
                      { key: 'browserLockdown', label: 'Browser Lockdown & Tab Switching alerts', desc: 'Auto-logs violations and locks exams if a candidate switches tabs or leaves active window.' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#161b22]/50 border border-[#21262d]">
                        <div>
                          <p className="text-sm text-white font-medium">{setting.label}</p>
                          <p className="text-xs text-[#8b949e]">{setting.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={(proctoringSettings as any)[setting.key]}
                            onChange={(e) => setProctoringSettings({
                              ...proctoringSettings,
                              [setting.key]: e.target.checked
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-[#21262d] peer-checked:bg-[#0066ff] rounded-full peer-focus:ring-2 peer-focus:ring-[#0066ff]/20 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-full" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: REVIEW & PUBLISH */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Assessment is Ready!</h3>
                  <p className="text-sm text-[#8b949e] max-w-md mx-auto">
                    Please review your completed examination details and click publish to launch the assessment instantly.
                  </p>
                </div>

                <div className="bg-[#161b22]/50 p-5 rounded-xl border border-[#21262d] max-w-md mx-auto grid grid-cols-2 gap-4 text-left font-sans">
                  <div>
                    <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">Title</span>
                    <p className="text-sm font-semibold text-white truncate">{title || 'Untitled Assessment'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">Type</span>
                    <p className="text-sm font-semibold text-white capitalize">{assessmentType.toLowerCase()} Test</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">Questions</span>
                    <p className="text-sm font-semibold text-white">{questions.length} Items</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">Duration</span>
                    <p className="text-sm font-semibold text-white">{duration} Minutes</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">Total Marks</span>
                    <p className="text-sm font-semibold text-white">{questions.length * 4} Marks (4 pts each)</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">Pass Criteria</span>
                    <p className="text-sm font-semibold text-white">{passPercentage}% (Passing: {Math.ceil((questions.length * 4 * passPercentage) / 100)} pts)</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider">Proctoring Level</span>
                    <p className="text-sm font-semibold text-white capitalize">{proctoringLevel.toLowerCase()}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-[#21262d]">
              {step > 0 && (
                <button 
                  onClick={() => setStep(step - 1)} 
                  disabled={isPublishing}
                  className="btn-neon btn-neon-secondary flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              {step < 3 ? (
                <button 
                  onClick={() => {
                    if (step === 0 && !title.trim()) {
                      toast.error('Please enter an assessment title.');
                      return;
                    }
                    if (step === 1 && questions.length === 0) {
                      toast.error('Please generate/add at least one question.');
                      return;
                    }
                    setStep(step + 1);
                  }} 
                  className="btn-neon btn-neon-primary flex-1 flex items-center justify-center gap-2 text-sm"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={handlePublishAssessment}
                  disabled={isPublishing}
                  className="btn-neon btn-neon-primary flex-1 flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-[#10b981] to-[#059669] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50"
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish Assessment <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Informative Side Info Card */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-5 border border-[#21262d] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0066ff]" />
              AI Prompt Tips
            </h3>
            <div className="text-xs text-[#8b949e] space-y-3 leading-relaxed">
              <p>For outstanding, rigorous questions, specify concepts precisely:</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li><strong className="text-white">Coding:</strong> &quot;Validate Binary Search Tree&quot;, &quot;Find Nth element from tail&quot;, &quot;Sub-arrays Summing to K&quot;.</li>
                <li><strong className="text-white">MCQs:</strong> &quot;SQL Joins and index optimizations&quot;, &quot;JavaScript closures inside loops&quot;, &quot;Deep Neural Network Loss functions&quot;.</li>
              </ul>
              <div className="bg-[#161b22] p-3 rounded-lg border border-[#21262d] mt-2">
                <span className="text-[10px] text-[#10b981] font-bold block mb-1">PRO-TIP:</span>
                Each auto-generated question is completely structured with realistic sample data, system test cases, and technical explanations automatically.
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 border border-[#21262d] space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ef4444]" />
              Competitive Rules
            </h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Upon publishing the assessment, ZCAT registers it live instantly. When a candidate answers a question correctly:
            </p>
            <div className="text-xs font-semibold text-white bg-[#ef4444]/5 p-3 rounded-lg border border-[#ef4444]/15">
              • Each correct answer yields exactly 4 points.
              <br />
              • Ranks are recalculated dynamically on submissions in real time.
            </div>
          </div>
          </div>
        </div>

      {/* Question Bank Import Drawer */}
      <AnimatePresence>
        {isImportDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImportDrawerOpen(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0d1117]/95 border-l border-[#21262d] shadow-2xl z-50 flex flex-col pointer-events-auto backdrop-blur-lg"
            >
              {/* Header */}
              <div className="p-5 border-b border-[#21262d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#0066ff]" />
                  <h3 className="text-lg font-bold text-white">Import from Question Bank</h3>
                </div>
                <button
                  onClick={() => setIsImportDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#161b22] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filters */}
              <div className="p-5 border-b border-[#21262d] space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8b949e]" />
                  <input
                    type="text"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') fetchBankQuestions(1);
                    }}
                    placeholder="Search by keyword..."
                    className="input-neon w-full pl-9 pr-4 text-sm !py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8b949e] mb-1">Difficulty</label>
                    <select
                      value={bankDifficulty}
                      onChange={(e) => setBankDifficulty(e.target.value)}
                      className="input-neon w-full text-xs font-semibold text-white !py-1.5 !px-2 appearance-none cursor-pointer"
                    >
                      <option value="">All Difficulties</option>
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#8b949e] mb-1">Question Type</label>
                    <select
                      value={bankType}
                      onChange={(e) => setBankType(e.target.value)}
                      className="input-neon w-full text-xs font-semibold text-white !py-1.5 !px-2 appearance-none cursor-pointer"
                    >
                      <option value="">All Types</option>
                      <option value="CODING">Coding</option>
                      <option value="MCQ">Multiple Choice</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => fetchBankQuestions(1)}
                  className="w-full btn-neon btn-neon-primary text-xs flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(0,102,255,0.3)] cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Apply Filters & Search
                </button>
              </div>

              {/* Questions List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {isFetchingBank ? (
                  <div className="flex flex-col items-center justify-center h-48 space-y-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#0066ff]" />
                    <span className="text-xs text-[#8b949e]">Scanning question vault...</span>
                  </div>
                ) : bankQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-[#8b949e] space-y-1">
                    <p className="text-sm font-semibold">No questions found</p>
                    <p className="text-xs">Adjust your search filters and try again.</p>
                  </div>
                ) : (
                  bankQuestions.map((q) => {
                    const isAdded = questions.some((added) => added.id === q.id || added.title === q.title);
                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl bg-[#161b22]/80 border border-[#21262d] hover:border-[#30363d] space-y-3 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                q.type === 'MCQ' ? 'bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20' : 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20'
                              }`}>{q.type}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                q.difficulty === 'EASY' ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' :
                                q.difficulty === 'MEDIUM' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20' :
                                'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20'
                              }`}>{q.difficulty}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white truncate max-w-[300px]">{q.title}</h4>
                            <p className="text-xs text-[#8b949e] line-clamp-2 leading-relaxed">{q.description}</p>
                          </div>
                          <button
                            onClick={() => handleImportQuestion(q)}
                            disabled={isAdded}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isAdded 
                                ? 'bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981] cursor-default'
                                : 'bg-[#0066ff]/10 border-[#0066ff]/20 hover:bg-[#0066ff]/20 text-[#0066ff]'
                            }`}
                            title={isAdded ? "Already Added" : "Add to assessment"}
                          >
                            {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </button>
                        </div>
                        {q.tags && q.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {q.tags.map((t: string) => (
                              <span key={t} className="text-[10px] text-[#8b949e] bg-[#0d1117] px-2 py-0.5 rounded border border-[#21262d]">#{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination Footer */}
              {bankTotalPages > 1 && (
                <div className="p-4 border-t border-[#21262d] flex items-center justify-between bg-[#0d1117]">
                  <button
                    disabled={bankPage <= 1 || isFetchingBank}
                    onClick={() => fetchBankQuestions(bankPage - 1)}
                    className="btn-neon btn-neon-secondary text-xs !py-1 px-3 disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-[#8b949e]">
                    Page {bankPage} of {bankTotalPages}
                  </span>
                  <button
                    disabled={bankPage >= bankTotalPages || isFetchingBank}
                    onClick={() => fetchBankQuestions(bankPage + 1)}
                    className="btn-neon btn-neon-secondary text-xs !py-1 px-3 disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
