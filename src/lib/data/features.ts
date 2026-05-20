import { Shield, Code2, Eye, BarChart3, Brain, Lock, LucideIcon } from 'lucide-react';

export interface FeatureData {
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
  fullDescription: string;
  howItWorks: { title: string; description: string }[];
  color: string;
  gradient: string;
  keyBenefits: { title: string; description: string }[];
}

export const featuresData: FeatureData[] = [
  {
    slug: 'ai-proctoring',
    icon: Shield,
    title: 'AI Proctoring',
    description: 'Advanced face detection, tab monitoring, and anti-cheating with real-time AI analysis.',
    fullDescription: 'Our state-of-the-art AI Proctoring system ensures the highest level of integrity for all your assessments. By leveraging advanced computer vision and machine learning models, ZCAT continuously monitors candidate behavior in real-time without being overly intrusive. The system generates a comprehensive integrity score and highlights specific moments in the exam timeline for manual review if anomalies are detected.',
    howItWorks: [
      {
        title: 'Advanced Face Detection & Biometrics',
        description: 'The system establishes a baseline face during the ID verification step. Throughout the exam, computer vision models continuously scan the webcam feed to ensure the original candidate is still present. It automatically flags if multiple faces appear in the frame, if the candidate leaves the screen, or if their face is obscured by hands, masks, or low lighting.'
      },
      {
        title: 'Tab & Screen Monitoring',
        description: 'Using browser Visibility APIs, the platform tracks precisely when a candidate leaves the active exam tab. The system logs exact timestamps, the duration of time spent off-screen, and triggers immediate visual warnings. Prolonged or repeated tab switches will automatically terminate the test to prevent cheating via external search engines.'
      },
      {
        title: 'Real-time Anti-cheating AI Analysis',
        description: 'Beyond just checking for faces, our AI analyzes behavioral patterns. It uses advanced eye-tracking approximations to detect if a candidate is consistently looking off-screen at notes or a secondary monitor. Object detection algorithms scan the background for prohibited items like mobile phones, smartwatches, or textbooks, instantly logging a violation if detected.'
      }
    ],
    color: '#00d4ff',
    gradient: 'from-[#00d4ff]/20 to-[#0066ff]/20',
    keyBenefits: [
      { title: 'Identity Verification', description: 'Automated face matching using ID cards and live webcam feeds.' },
      { title: 'Behavioral Analysis', description: 'AI detects suspicious movements, looking away from screen, or talking.' },
      { title: 'Hardware Detection', description: 'Identifies unauthorized secondary monitors, virtual machines, or specific prohibited devices.' }
    ]
  },
  {
    slug: 'coding-assessment',
    icon: Code2,
    title: 'Coding Assessment',
    description: 'Multi-language code editor with auto-evaluation, hidden test cases, and plagiarism detection.',
    fullDescription: 'ZCAT provides a world-class coding environment embedded directly in the browser. It allows candidates to write, compile, and run code in secure isolated execution sandboxes. Assessments are automatically evaluated against a rigorous suite of visible and hidden test cases, ensuring code not only runs, but handles edge cases effectively.',
    howItWorks: [
      {
        title: 'Multi-language Code Editor',
        description: 'Built on top of powerful editor engines (like Monaco), candidates experience an IDE-like interface right in their browser. It supports languages like Python, Java, C++, JavaScript, and Go. It includes syntax highlighting, bracket matching, and customizable themes, allowing candidates to focus purely on logic.'
      },
      {
        title: 'Auto-evaluation & Hidden Test Cases',
        description: 'When a candidate submits their code, it is securely transmitted to isolated Docker containers. The code is compiled (if necessary) and executed against multiple inputs. Visible test cases help candidates debug their logic, while hidden test cases (which candidates cannot see) evaluate edge cases, performance limits, and overall correctness to calculate the final score.'
      },
      {
        title: 'Intelligent Plagiarism Detection',
        description: 'Our system doesn’t just look for copied text. It builds an Abstract Syntax Tree (AST) of the candidate\'s code to understand its structural logic. This means even if a candidate renames variables, changes function names, or adds random comments, the AI will still detect structural similarities against past submissions and known online solutions.'
      }
    ],
    color: '#a855f7',
    gradient: 'from-[#a855f7]/20 to-[#7c3aed]/20',
    keyBenefits: [
      { title: 'Multi-Language Support', description: 'Evaluate candidates in the language they are most comfortable with, or restrict it to stack-specific languages.' },
      { title: 'Secure Sandboxing', description: 'Code execution happens in isolated containers ensuring secure, performant evaluation.' },
      { title: 'Plagiarism Detection', description: 'Advanced AST (Abstract Syntax Tree) comparisons to detect code copying beyond simple text matching.' }
    ]
  },
  {
    slug: 'live-monitoring',
    icon: Eye,
    title: 'Live Monitoring',
    description: 'Real-time candidate monitoring with webcam feeds, violation alerts, and activity tracking.',
    fullDescription: 'For high-stakes examinations, AI is not always enough. Our Live Monitoring dashboard empowers human proctors and recruiters to oversee multiple candidates simultaneously. Proctors can view live feeds and intervene immediately, ensuring a secure testing environment.',
    howItWorks: [
      {
        title: 'Real-time Webcam Feeds',
        description: 'Using secure, encrypted WebRTC protocols, candidate webcam and audio feeds are streamed in low-latency to the proctor dashboard. Proctors can view a grid of multiple candidates simultaneously, and click into any individual feed for a high-resolution, full-screen view.'
      },
      {
        title: 'Instant Violation Alerts',
        description: 'Proctors do not have to watch every screen manually. The AI Proctoring engine acts as an assistant, automatically pushing priority alerts to the dashboard. If the AI detects a missing face or a mobile phone, a red notification pops up on the proctor\'s screen, directing their attention to the specific candidate immediately.'
      },
      {
        title: 'Comprehensive Activity Tracking',
        description: 'Every action a candidate takes is logged chronologically. When they switch a tab, copy text, paste text, or trigger an AI alert, it is recorded with a precise timestamp. Proctors can review this activity feed during or after the exam to make informed decisions about candidate integrity.'
      }
    ],
    color: '#ec4899',
    gradient: 'from-[#ec4899]/20 to-[#db2777]/20',
    keyBenefits: [
      { title: 'Grid View Monitoring', description: 'Watch live feeds of multiple candidates on a single, intuitive dashboard.' },
      { title: 'Real-time Event Stream', description: 'Instantly see tab switches, copy-paste attempts, or AI-flagged behavior as they happen.' },
      { title: 'Proctor Interventions', description: 'Send direct messages, issue warnings, or pause the assessment of any candidate instantly.' }
    ]
  },
  {
    slug: 'real-time-analytics',
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Comprehensive dashboards with skill analysis, performance heatmaps, and hiring insights.',
    fullDescription: 'Stop guessing and start hiring with data. ZCAT’s Real-time Analytics engine aggregates candidate performance across coding challenges, MCQs, and descriptive questions into actionable insights. View dynamic leaderboards and deep metrics that help you identify the best engineering talent.',
    howItWorks: [
      {
        title: 'Granular Skill Analysis',
        description: 'Every question in an assessment is tagged with specific technical skills (e.g., Dynamic Programming, React Hooks, SQL Joins). The analytics engine calculates a weighted proficiency score for each skill tag, allowing recruiters to see exactly where a candidate excels and where they struggle, rather than just a flat overall score.'
      },
      {
        title: 'Performance Heatmaps',
        description: 'Visual heatmaps break down the time spent on every section of the test. Recruiters can see if a candidate blazed through the MCQs but got stuck on a specific algorithm. This visual timeline helps identify how quickly a candidate grasps complex problems versus standard trivia.'
      },
      {
        title: 'Actionable Hiring Insights',
        description: 'The platform generates a normalized "Hireability Score" by comparing a candidate’s performance against historical cohort data and global benchmarks. It balances technical scores with the integrity index, providing a clear, unbiased recommendation on whether the candidate should proceed to the next round.'
      }
    ],
    color: '#10b981',
    gradient: 'from-[#10b981]/20 to-[#059669]/20',
    keyBenefits: [
      { title: 'Skill Heatmaps', description: 'Visualize a candidate’s strengths and weaknesses across different technical domains.' },
      { title: 'Comparative Analytics', description: 'Compare an individual candidate against the cohort average or historical benchmarks.' },
      { title: 'Exportable Reports', description: 'Generate beautifully formatted PDF or CSV reports for hiring committees and stakeholders.' }
    ]
  },
  {
    slug: 'ai-interview',
    icon: Brain,
    title: 'AI Interview',
    description: 'AI-powered technical interviews with voice analysis, behavioral scoring, and instant feedback.',
    fullDescription: 'Scale your technical screening process with our conversational AI Interviewer. ZCAT’s AI can conduct initial screening rounds by asking dynamic, follow-up questions, evaluating both technical correctness and communication skills, saving hundreds of hours of manual screening time.',
    howItWorks: [
      {
        title: 'Voice Analysis & NLP',
        description: 'Candidates speak their answers naturally. The platform uses advanced Speech-to-Text to transcribe responses in real-time. Natural Language Processing (NLP) models then analyze the semantic meaning of the text to evaluate if the technical answer is correct, assessing depth of knowledge rather than just keyword matching.'
      },
      {
        title: 'Behavioral & Cognitive Scoring',
        description: 'Beyond technical correctness, the AI evaluates how the candidate arrived at their answer. It detects pauses, filler words, and sentence structure to generate a confidence and clarity score. It maps responses to behavioral frameworks to assess problem-solving approach and structured thinking.'
      },
      {
        title: 'Instant Feedback & Reporting',
        description: 'The moment the interview concludes, the platform generates a comprehensive recruiter report. It includes a full transcript of the conversation, audio snippets of key answers, and a rubric-based scorecard. This allows human recruiters to quickly review the highlights without sitting through a 45-minute recording.'
      }
    ],
    color: '#f59e0b',
    gradient: 'from-[#f59e0b]/20 to-[#d97706]/20',
    keyBenefits: [
      { title: 'Dynamic Questioning', description: 'The AI adapts its questions in real-time based on the candidate’s previous answers.' },
      { title: 'Behavioral Scoring', description: 'Evaluates communication clarity, confidence, and structured thinking alongside technical skills.' },
      { title: 'Unbiased Evaluation', description: 'Standardizes the first-round interview process, removing human bias from initial screening.' }
    ]
  },
  {
    slug: 'secure-examination',
    icon: Lock,
    title: 'Secure Examination',
    description: 'Browser lockdown, copy-paste prevention, encrypted data, and SOC 2 compliant infrastructure.',
    fullDescription: 'Security is at the core of the ZCAT platform. Our Secure Examination environment goes beyond basic proctoring to create a fortified sandbox that protects your proprietary assessment content and ensures fair testing conditions.',
    howItWorks: [
      {
        title: 'Strict Browser Lockdown',
        description: 'Upon starting a secure test, the browser is forced into a persistent Fullscreen mode. The platform aggressively intercepts attempts to exit fullscreen, open developer tools (F12), or use OS-level shortcuts like Alt+Tab or Cmd+Tab. If the candidate breaches these boundaries, the test is instantly locked.'
      },
      {
        title: 'Copy-Paste & Context Menu Prevention',
        description: 'JavaScript event listeners disable the right-click context menu entirely. Furthermore, `onCopy`, `onCut`, and `onPaste` events are intercepted. If a candidate tries to copy the text of a coding problem to search on ChatGPT, the clipboard is immediately overwritten with an empty string, preventing data leakage.'
      },
      {
        title: 'Encrypted Data & Infrastructure',
        description: 'Candidate PII (Personally Identifiable Information), video feeds, and code submissions are encrypted at rest using AES-256 and in transit via TLS 1.3. Our cloud infrastructure is partitioned to ensure tenant data isolation, meeting strict enterprise compliance standards like SOC 2 Type II and GDPR.'
      }
    ],
    color: '#06b6d4',
    gradient: 'from-[#06b6d4]/20 to-[#0891b2]/20',
    keyBenefits: [
      { title: 'Browser Lockdown', description: 'Forces full-screen mode and prevents exiting the exam window without triggering violations.' },
      { title: 'Clipboard Protection', description: 'Strict copy-paste prevention ensures candidates cannot copy questions to search engines or paste external code.' },
      { title: 'Enterprise Compliance', description: 'Bank-grade encryption and privacy controls ensure your proprietary assessment content and candidate data remain secure.' }
    ]
  }
];
