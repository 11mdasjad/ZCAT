import { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Asjad Ahmed',
    email: 'asjad@zcat.dev',
    role: 'candidate',
    avatar: '',
    skills: ['React', 'TypeScript', 'Python', 'Node.js', 'MongoDB'],
    bio: 'Full-stack developer passionate about building scalable applications.',
    joinedAt: '2026-01-15',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@techcorp.com',
    role: 'recruiter',
    company: 'TechCorp Inc.',
    avatar: '',
    joinedAt: '2026-02-20',
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@zcat.dev',
    role: 'admin',
    avatar: '',
    joinedAt: '2025-12-01',
  },
];

export const mockCandidates = [
  { id: '1', name: 'Rahul Kumar', email: 'rahul@email.com', score: 92, rank: 1, status: 'active' as const, college: 'IIT Delhi', skills: ['Python', 'ML', 'React'], testsCompleted: 12, avgScore: 88.5 },
  { id: '2', name: 'Ananya Patel', email: 'ananya@email.com', score: 89, rank: 2, status: 'active' as const, college: 'NIT Trichy', skills: ['Java', 'Spring', 'AWS'], testsCompleted: 10, avgScore: 85.2 },
  { id: '3', name: 'Mohammed Ali', email: 'mali@email.com', score: 87, rank: 3, status: 'active' as const, college: 'BITS Pilani', skills: ['C++', 'Algorithms', 'System Design'], testsCompleted: 15, avgScore: 82.1 },
  { id: '4', name: 'Sneha Reddy', email: 'sneha@email.com', score: 85, rank: 4, status: 'active' as const, college: 'IIIT Hyderabad', skills: ['JavaScript', 'React', 'Node.js'], testsCompleted: 8, avgScore: 79.8 },
  { id: '5', name: 'Vikram Singh', email: 'vikram@email.com', score: 83, rank: 5, status: 'suspended' as const, college: 'DTU', skills: ['Python', 'Django', 'PostgreSQL'], testsCompleted: 11, avgScore: 77.3 },
  { id: '6', name: 'Kavitha Nair', email: 'kavitha@email.com', score: 80, rank: 6, status: 'active' as const, college: 'VIT Vellore', skills: ['Java', 'Kotlin', 'Android'], testsCompleted: 9, avgScore: 75.6 },
  { id: '7', name: 'Arjun Mehta', email: 'arjun@email.com', score: 78, rank: 7, status: 'active' as const, college: 'NSIT', skills: ['C', 'Embedded', 'IoT'], testsCompleted: 7, avgScore: 73.9 },
  { id: '8', name: 'Deepa Gupta', email: 'deepa@email.com', score: 76, rank: 8, status: 'active' as const, college: 'Jadavpur University', skills: ['Python', 'Data Science', 'TensorFlow'], testsCompleted: 14, avgScore: 71.4 },
];

export const mockLeaderboard = mockCandidates.map((c, i) => ({
  rank: i + 1,
  name: c.name,
  score: c.score * 10,
  college: c.college,
  change: i < 3 ? 'up' as const : i < 5 ? 'same' as const : 'down' as const,
  problemsSolved: Math.floor(Math.random() * 100) + 50,
}));
