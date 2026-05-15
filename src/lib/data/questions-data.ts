/**
 * Local Questions Data Layer
 * Loads questions from the bundled leetcode-questions.json
 * Works independently of database connection
 */

import questionsRaw from './leetcode-questions.json';

export interface LocalQuestion {
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
  leetcodeNumber?: number;
}

// Generate stable IDs from slug
function generateId(slug: string, index: number): string {
  // Create a deterministic UUID-like ID from slug
  const hex = Array.from(slug + index.toString())
    .reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
    }, 0);
  const positive = Math.abs(hex);
  return `lc-${slug}-${positive.toString(16).padStart(8, '0')}`;
}

// Clean up constraint strings (remove LeetCode page artifacts)
function cleanConstraints(constraints: string[]): string[] {
  return constraints.filter(c => {
    const lower = c.toLowerCase();
    const trimmed = c.trim();
    return !lower.includes('leetcode') &&
      !lower.includes('probl…') &&
      !lower.includes('submit 0') &&
      !lower.includes('https://') &&
      !trimmed.match(/^\d+\.\d+K\s+\d+$/) &&
      !trimmed.match(/^\d+\/\d+\/\d+/) &&
      !trimmed.match(/^\d+[KM]?\s+\d+$/) &&
      !trimmed.match(/^\d+\.\d+[KM]\s/) &&
      trimmed.length > 3;
  });
}

// Clean up examples (remove LeetCode page artifacts)
function cleanExamples(examples: string[]): string[] {
  return examples.filter(e => {
    const lower = e.toLowerCase();
    return !lower.includes('leetcode') &&
      !lower.includes('probl…') &&
      !lower.includes('submit 0') &&
      !lower.includes('https://') &&
      !lower.match(/^\d+\.\d+K\s+\d+$/) &&
      e.trim().length > 10;
  });
}

// Process raw data into typed questions
const processedQuestions: LocalQuestion[] = (questionsRaw as any[]).map((q, i) => ({
  id: generateId(q.slug, i),
  title: q.title,
  slug: q.slug,
  difficulty: q.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
  description: q.description || '',
  examples: cleanExamples(q.examples || []),
  constraints: cleanConstraints(q.constraints || []),
  tags: q.tags || [],
  timeLimit: q.timeLimit || 2000,
  memoryLimit: q.memoryLimit || 256,
  leetcodeNumber: q.leetcodeNumber,
}));

/**
 * Get paginated, filtered questions
 */
export function getQuestions(options?: {
  page?: number;
  limit?: number;
  difficulty?: string;
  search?: string;
  tags?: string[];
}): { questions: LocalQuestion[]; pagination: { page: number; limit: number; total: number; pages: number } } {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  
  let filtered = [...processedQuestions];

  // Filter by difficulty
  if (options?.difficulty && options.difficulty !== 'all') {
    filtered = filtered.filter(q => q.difficulty === options.difficulty);
  }

  // Filter by search
  if (options?.search) {
    const s = options.search.toLowerCase();
    filtered = filtered.filter(q =>
      q.title.toLowerCase().includes(s) ||
      q.description.toLowerCase().includes(s) ||
      q.tags.some(t => t.toLowerCase().includes(s))
    );
  }

  // Filter by tags
  if (options?.tags && options.tags.length > 0) {
    filtered = filtered.filter(q =>
      options.tags!.some(t => q.tags.map(tag => tag.toLowerCase()).includes(t.toLowerCase()))
    );
  }

  const total = filtered.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const questions = filtered.slice(start, start + limit);

  return {
    questions,
    pagination: { page, limit, total, pages },
  };
}

/**
 * Get a single question by ID
 */
export function getQuestionById(id: string): LocalQuestion | undefined {
  return processedQuestions.find(q => q.id === id);
}

/**
 * Get question stats by difficulty
 */
export function getQuestionStats(): { EASY: number; MEDIUM: number; HARD: number; total: number } {
  const stats = { EASY: 0, MEDIUM: 0, HARD: 0, total: processedQuestions.length };
  for (const q of processedQuestions) {
    stats[q.difficulty]++;
  }
  return stats;
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  for (const q of processedQuestions) {
    q.tags.forEach(t => tagSet.add(t));
  }
  return Array.from(tagSet).sort();
}

/**
 * Get all questions (for exports)
 */
export function getAllQuestions(): LocalQuestion[] {
  return processedQuestions;
}
