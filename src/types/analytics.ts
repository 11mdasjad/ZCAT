export interface SkillData {
  subject: string;
  score: number;
  fullMark: number;
}

export interface TrendData {
  date: string;
  score: number;
  average?: number;
}

export interface TopicData {
  topic: string;
  correct: number;
  incorrect: number;
  total: number;
}

export interface FunnelData {
  stage: string;
  count: number;
  color: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface DashboardStats {
  totalCandidates: number;
  activeExams: number;
  violationsDetected: number;
  topPerformers: number;
  passRate: number;
  averageScore: number;
}
