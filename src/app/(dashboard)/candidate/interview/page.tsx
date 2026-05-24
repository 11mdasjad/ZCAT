'use client';

import { useState } from 'react';
import InterviewDashboard from '@/components/interview/InterviewDashboard';
import InterviewWizard from '@/components/interview/InterviewWizard';
import InterviewWorkspace from '@/components/interview/InterviewWorkspace';
import InterviewReport from '@/components/interview/InterviewReport';

type Mode = 'DASHBOARD' | 'WIZARD' | 'WORKSPACE' | 'REPORT';

interface Question {
  id: string;
  question: string;
  category: string;
  order: number;
}

export default function CandidateInterviewPage() {
  const [mode, setMode] = useState<Mode>('DASHBOARD');
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [voiceMode, setVoiceMode] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  const handleStartInterview = async (config: {
    title: string;
    category: 'TECHNICAL' | 'HR' | 'PLACEMENT';
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    voiceMode: boolean;
  }) => {
    try {
      const response = await fetch('/api/v1/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: config.title,
          category: config.category,
          difficulty: config.difficulty,
          duration: 15, // standard duration
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to configure and generate AI mock interview');
      }

      const data = await response.json();
      const session = data.data;

      setActiveSessionId(session.id);
      setActiveQuestion(session.questions[0]);
      setVoiceMode(config.voiceMode);
      setMode('WORKSPACE');
    } catch (err: any) {
      alert('Error launching interview: ' + err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col justify-start">
      {mode === 'DASHBOARD' && (
        <InterviewDashboard
          onStartNew={() => setMode('WIZARD')}
          onViewReport={(id) => {
            setSelectedSessionId(id);
            setMode('REPORT');
          }}
        />
      )}

      {mode === 'WIZARD' && (
        <InterviewWizard
          onBack={() => setMode('DASHBOARD')}
          onStart={handleStartInterview}
        />
      )}

      {mode === 'WORKSPACE' && activeQuestion && (
        <InterviewWorkspace
          sessionId={activeSessionId}
          initialQuestion={activeQuestion}
          voiceMode={voiceMode}
          onFinish={(id) => {
            setSelectedSessionId(id);
            setMode('REPORT');
          }}
        />
      )}

      {mode === 'REPORT' && (
        <InterviewReport
          sessionId={selectedSessionId}
          onBack={() => setMode('DASHBOARD')}
        />
      )}
    </div>
  );
}
