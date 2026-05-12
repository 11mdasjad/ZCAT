import { SkillData, TrendData, TopicData, FunnelData } from '@/types/analytics';

export const mockSkillData: SkillData[] = [
  { subject: 'Algorithms', score: 85, fullMark: 100 },
  { subject: 'Data Structures', score: 78, fullMark: 100 },
  { subject: 'System Design', score: 65, fullMark: 100 },
  { subject: 'Databases', score: 72, fullMark: 100 },
  { subject: 'Web Dev', score: 90, fullMark: 100 },
  { subject: 'DevOps', score: 55, fullMark: 100 },
];

export const mockTrendData: TrendData[] = [
  { date: 'Jan', score: 62, average: 55 },
  { date: 'Feb', score: 68, average: 57 },
  { date: 'Mar', score: 71, average: 58 },
  { date: 'Apr', score: 75, average: 60 },
  { date: 'May', score: 82, average: 62 },
  { date: 'Jun', score: 78, average: 61 },
  { date: 'Jul', score: 85, average: 63 },
  { date: 'Aug', score: 88, average: 65 },
  { date: 'Sep', score: 84, average: 64 },
  { date: 'Oct', score: 90, average: 66 },
  { date: 'Nov', score: 92, average: 67 },
  { date: 'Dec', score: 95, average: 68 },
];

export const mockTopicData: TopicData[] = [
  { topic: 'Arrays', correct: 45, incorrect: 5, total: 50 },
  { topic: 'Strings', correct: 38, incorrect: 12, total: 50 },
  { topic: 'Trees', correct: 30, incorrect: 20, total: 50 },
  { topic: 'Graphs', correct: 22, incorrect: 28, total: 50 },
  { topic: 'DP', correct: 18, incorrect: 32, total: 50 },
  { topic: 'Math', correct: 40, incorrect: 10, total: 50 },
  { topic: 'Sorting', correct: 42, incorrect: 8, total: 50 },
  { topic: 'Linked Lists', correct: 35, incorrect: 15, total: 50 },
];

export const mockFunnelData: FunnelData[] = [
  { stage: 'Applied', count: 5000, color: '#00d4ff' },
  { stage: 'Screening', count: 3200, color: '#a855f7' },
  { stage: 'Assessment', count: 1800, color: '#ec4899' },
  { stage: 'Interview', count: 800, color: '#10b981' },
  { stage: 'Offer', count: 320, color: '#f59e0b' },
  { stage: 'Hired', count: 250, color: '#06b6d4' },
];

export const mockTestHistory = [
  { id: '1', title: 'Full Stack Developer Assessment', date: '2026-05-10', score: 420, total: 500, percentage: 84, status: 'completed' as const },
  { id: '2', title: 'Python Data Science Challenge', date: '2026-05-08', score: 340, total: 400, percentage: 85, status: 'completed' as const },
  { id: '3', title: 'JavaScript Mastery Test', date: '2026-05-05', score: 250, total: 300, percentage: 83, status: 'completed' as const },
  { id: '4', title: 'Campus Hiring - Aptitude', date: '2026-05-01', score: 175, total: 200, percentage: 87.5, status: 'completed' as const },
  { id: '5', title: 'System Design Interview', date: '2026-04-28', score: 72, total: 100, percentage: 72, status: 'completed' as const },
  { id: '6', title: 'React Advanced Concepts', date: '2026-04-25', score: 280, total: 300, percentage: 93, status: 'completed' as const },
];

export const mockRecentActivity = [
  { id: '1', action: 'Completed "Two Sum" challenge', time: '2 hours ago', type: 'coding' as const },
  { id: '2', action: 'Scored 85% in Aptitude Test', time: '5 hours ago', type: 'test' as const },
  { id: '3', action: 'Earned "Algorithm Master" certificate', time: '1 day ago', type: 'achievement' as const },
  { id: '4', action: 'Ranked #3 in Weekly Contest', time: '2 days ago', type: 'contest' as const },
  { id: '5', action: 'Submitted solution for "Merge K Lists"', time: '3 days ago', type: 'coding' as const },
];
