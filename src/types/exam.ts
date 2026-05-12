export type ExamType = 'coding' | 'aptitude' | 'mixed' | 'interview';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'c' | 'cpp' | 'java' | 'python' | 'javascript';
export type SubmissionStatus = 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'tle' | 'runtime_error';

export interface Exam {
  id: string;
  title: string;
  description: string;
  type: ExamType;
  difficulty: Difficulty;
  duration: number; // minutes
  totalQuestions: number;
  totalMarks: number;
  startTime?: string;
  endTime?: string;
  isLive: boolean;
  createdBy: string;
  tags: string[];
}

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  hiddenTestCases: number;
  timeLimit: number; // seconds
  memoryLimit: number; // MB
  languages: Language[];
  tags: string[];
  successRate: number;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Submission {
  id: string;
  questionId: string;
  userId: string;
  language: Language;
  code: string;
  status: SubmissionStatus;
  runtime?: number;
  memory?: number;
  score: number;
  submittedAt: string;
  testCasesPassed: number;
  totalTestCases: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  userId: string;
  score: number;
  totalScore: number;
  percentage: number;
  rank?: number;
  completedAt: string;
  timeTaken: number; // minutes
  violations: number;
}
