'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, Volume2, VolumeX,
  Send, Sparkles, AlertCircle, Loader2, Play, Pause,
  CornerDownLeft, MessageSquare, Timer, BarChart, Brain
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  category: string;
  order: number;
}

interface WorkspaceProps {
  sessionId: string;
  initialQuestion: Question;
  voiceMode: boolean;
  onFinish: (sessionId: string) => void;
}

export default function InterviewWorkspace({
  sessionId,
  initialQuestion,
  voiceMode,
  onFinish,
}: WorkspaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question>(initialQuestion);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(!voiceMode);
  const [cameraActive, setCameraActive] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [fillerCounts, setFillerCounts] = useState({ um: 0, uh: 0, like: 0, so: 0, basically: 0 });
  const [wpm, setWpm] = useState(0);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const inputTextRef = useRef(inputText);
  useEffect(() => {
    inputTextRef.current = inputText;
  }, [inputText]);

  // Media references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Start general timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Reset countdown to 120s on next question
  useEffect(() => {
    setTimeLeft(120);
  }, [currentQuestion]);

  // Handle 2-minute countdown timer per question
  useEffect(() => {
    if (isEvaluating) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion, isEvaluating]);

  // Handle Text-to-Speech (TTS) for the question
  const speakQuestion = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    utterance.rate = 0.90;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Google') || v.name.includes('Samantha'))) ||
      voices.find((v) => v.lang.startsWith('en'));
    
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    speakQuestion(currentQuestion.question);
    
    setInputText('');
    setWpm(0);
    setFillerCounts({ um: 0, uh: 0, like: 0, so: 0, basically: 0 });

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestion]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let finalTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript + ' ';
          }
        }

        if (finalTrans) {
          setInputText((prev) => {
            const nextText = prev + finalTrans;
            analyzeSpeechMetrics(nextText);
            return nextText;
          });
        }
      };

      rec.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  function analyzeSpeechMetrics(text: string) {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    if (secondsElapsed > 2) {
      const minutes = secondsElapsed / 60;
      setWpm(Math.round(wordCount / minutes));
    }

    const fillers = { um: 0, uh: 0, like: 0, so: 0, basically: 0 };
    words.forEach((w) => {
      const cleanWord = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
      if (cleanWord === 'um') fillers.um++;
      if (cleanWord === 'uh') fillers.uh++;
      if (cleanWord === 'like') fillers.like++;
      if (cleanWord === 'so') fillers.so++;
      if (cleanWord === 'basically') fillers.basically++;
    });
    setFillerCounts(fillers);
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported or permitted in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const toggleCamera = async () => {
    if (cameraActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
        mediaStreamRef.current = stream;
        setCameraActive(true);
      } catch (err) {
        console.error('Webcam permission denied:', err);
        alert('Could not launch camera. Please check browser camera permissions.');
      }
    }
  };

  const videoCallbackRef = (node: HTMLVideoElement | null) => {
    if (node && mediaStreamRef.current) {
      node.srcObject = mediaStreamRef.current;
    }
  };

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  async function submitAnswer(answerText: string) {
    if (isEvaluating) return;

    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsEvaluating(true);

    try {
      const response = await fetch(`/api/v1/interviews/${sessionId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          response: answerText,
        }),
      });

      if (!response.ok) throw new Error('Failed to evaluate response');
      const data = await response.json();
      const { nextQuestion, overallFeedback } = data.data;

      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
      } else if (overallFeedback) {
        onFinish(sessionId);
      }
    } catch (err) {
      alert('Error submitting response: ' + (err as Error).message);
    } finally {
      setIsEvaluating(false);
    }
  }

  const handleSubmit = () => {
    submitAnswer(inputText.trim());
  };

  function triggerAutoSubmit() {
    const finalAnswer = inputTextRef.current.trim() || '*(No verbal response recorded within 2-minute time limit)*';
    submitAnswer(finalAnswer);
  }

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const totalFillers = Object.values(fillerCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Sidebar - Visual Interviewer Panel */}
      <div className="space-y-4">
        {/* SVG Pulse orb */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] text-center relative overflow-hidden border border-[#e2e8f0] bg-white shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#7c3aed]/5 rounded-full filter blur-2xl" />

          {/* Glowing particle wave */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Thinking / Idle Ring */}
            <motion.div
              animate={isAiSpeaking ? { scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] } : { rotate: 360 }}
              transition={
                isAiSpeaking
                  ? { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
                  : { repeat: Infinity, duration: 8, ease: 'linear' }
              }
              className={`absolute inset-0 rounded-full border border-dashed ${
                isAiSpeaking ? 'border-[#db2777] w-32 h-32' : 'border-[#0284c7]/40 w-28 h-28 mx-auto my-auto'
              }`}
            />

            {/* Speaking / Pulsing waves */}
            {isAiSpeaking && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                  className="absolute w-24 h-24 bg-[#7c3aed]/10 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 0.6 }}
                  className="absolute w-24 h-24 bg-[#db2777]/10 rounded-full"
                />
              </>
            )}

            {/* Center Core */}
            <motion.div
              animate={isAiSpeaking ? { scale: [0.9, 1.05, 0.9] } : { scale: 1 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className={`w-16 h-16 rounded-full bg-gradient-to-tr flex items-center justify-center relative z-10 shadow-md ${
                isEvaluating
                  ? 'from-slate-300 to-slate-400'
                  : isListening
                  ? 'from-[#059669] to-[#0891b2]'
                  : 'from-[#2563eb] to-[#7c3aed]'
              }`}
            >
              {isEvaluating ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Brain className="w-6 h-6 text-white animate-pulse" />
              )}
            </motion.div>
          </div>

          <div className="mt-4 space-y-1">
            <h4 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider">
              {isEvaluating ? 'Evaluating Response...' : isAiSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'AI Interviewer'}
            </h4>
            <p className="text-xs text-[#64748b] font-medium">
              {isEvaluating ? 'Gemini is running diagnostic metrics' : isListening ? 'Speak naturally when ready' : 'Ready for your input'}
            </p>
          </div>
        </div>

        {/* Optional Webcam Preview */}
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[160px] border border-[#e2e8f0] bg-white shadow-sm">
          {cameraActive ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0f172a]">
              <video ref={videoCallbackRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              <button
                onClick={toggleCamera}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-red-400 hover:text-white transition-colors cursor-pointer"
                title="Mute Camera"
              >
                <VideoOff className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-[#64748b]">
                <VideoOff className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0f172a]">Camera Offline</p>
                <span className="text-[10px] text-[#64748b]">Simulate proctoring feeds</span>
              </div>
              <button
                onClick={toggleCamera}
                className="btn-neon btn-neon-secondary !py-1 !px-3 text-[10px] flex items-center gap-1.5 mx-auto font-semibold cursor-pointer"
              >
                <Video className="w-3 h-3" /> Turn Camera On
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace - Question and Textarea */}
      <div className="lg:col-span-2 space-y-4">
        {/* Workspace HUD Header */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border border-[#e2e8f0] bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider block">Question Progress</span>
              <p className="text-sm font-extrabold text-[#2563eb]">Question {currentQuestion.order} of 5</p>
            </div>
            <div className="pl-4 border-l border-[#e2e8f0]">
              <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider block">Topic</span>
              <p className="text-sm font-bold text-[#0f172a]">{currentQuestion.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Synthesis toggle */}
            <button
              onClick={() => {
                if (isMuted) {
                  setIsMuted(false);
                  speakQuestion(currentQuestion.question);
                } else {
                  setIsMuted(true);
                  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsAiSpeaking(false);
                }
              }}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                !isMuted ? 'border-[#2563eb]/30 text-[#2563eb] bg-blue-50' : 'border-[#cbd5e1] text-[#64748b]'
              }`}
              title="Toggle Audio Feedback"
            >
              {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Countdown Time HUD */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs transition-all ${
              timeLeft < 20
                ? 'bg-red-50 border-red-300 text-[#dc2626] animate-pulse font-bold'
                : 'bg-slate-50 border border-[#e2e8f0] text-[#2563eb] font-semibold'
            }`}>
              <Timer className={`w-3.5 h-3.5 ${timeLeft < 20 ? 'text-[#dc2626]' : 'text-[#2563eb]'}`} />
              <span>Time Left: {formatTimer(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* The Question Box */}
        <div className="glass-card rounded-2xl p-6 bg-slate-50 border border-[#e2e8f0] relative shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb] flex-shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="space-y-3">
              <span className="text-[10px] text-[#2563eb] font-extrabold uppercase tracking-wider">AI Interviewer Prompt</span>
              <h3 className="text-base md:text-lg font-bold text-[#0f172a] leading-relaxed">{currentQuestion.question}</h3>
            </div>
          </div>

          {!isMuted && !isAiSpeaking && (
            <button
              onClick={() => speakQuestion(currentQuestion.question)}
              className="absolute right-4 bottom-4 text-xs font-semibold text-[#64748b] hover:text-[#2563eb] flex items-center gap-1 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" /> Replay Voice
            </button>
          )}
        </div>

        {/* Answer Transcription Box */}
        <div className="glass-card rounded-2xl p-5 border border-[#e2e8f0] bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Your Answer Transcript</span>
            
            <div className="flex items-center gap-4 text-xs text-[#64748b] font-medium">
              <span className="flex items-center gap-1.5">
                <BarChart className="w-3.5 h-3.5 text-[#2563eb]" />
                {wpm} WPM Pacing
              </span>
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#d97706]" />
                {totalFillers} Filler Words
              </span>
            </div>
          </div>

          <textarea
            disabled={isEvaluating}
            placeholder="Type your response here or enable Voice Mode below to dictate your thoughts..."
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              analyzeSpeechMetrics(e.target.value);
            }}
            className="w-full min-h-[140px] bg-slate-50 border border-[#cbd5e1] rounded-xl p-4 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:outline-none transition-all resize-y leading-relaxed font-medium"
          />

          {/* Live transcript filler-words HUD */}
          {totalFillers > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] p-2 bg-red-50 border border-red-200 rounded-lg text-[#dc2626]">
              <span className="font-bold uppercase tracking-wider mr-1">Filler Analysis:</span>
              {Object.entries(fillerCounts).map(([w, c]) => c > 0 && (
                <span key={w} className="px-2 py-0.5 bg-red-100 rounded font-bold">
                  &quot;{w}&quot;: {c}x
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={toggleListening}
              disabled={isEvaluating}
              className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all border cursor-pointer ${
                isListening
                  ? 'bg-red-50 border-red-300 text-[#dc2626] animate-pulse'
                  : 'bg-emerald-50 border-emerald-300 text-[#059669] hover:bg-emerald-100'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" /> Stop Voice Dictation
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 animate-bounce-slow" /> Start Voice Dictation
                </>
              )}
            </button>

            <button
              onClick={handleSubmit}
              disabled={isEvaluating || !inputText.trim()}
              className="btn-neon btn-neon-primary flex items-center justify-center gap-2 px-6 !py-3 text-sm flex-shrink-0 font-semibold cursor-pointer shadow-md"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                  <span>Evaluating answer...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <Send className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
