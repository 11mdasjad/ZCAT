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

  // Mirror inputText inside a ref to ensure timers can access the latest state
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

    // Natural pacing parameters
    utterance.rate = 0.90; // Slightly slower, crisp, premium cadence
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Google') || v.name.includes('Samantha'))) ||
      voices.find((v) => v.lang.startsWith('en'));
    
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Speak when question changes
  useEffect(() => {
    speakQuestion(currentQuestion.question);
    
    // Reset voice typing states on next question
    setInputText('');
    setWpm(0);
    setFillerCounts({ um: 0, uh: 0, like: 0, so: 0, basically: 0 });

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestion]);

  // Handle Speech-to-Text Recognition Setup
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

  // Analyze filler words and WPM in real-time
  const analyzeSpeechMetrics = (text: string) => {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Estimate WPM based on elapsed question timer
    if (secondsElapsed > 2) {
      const minutes = secondsElapsed / 60;
      setWpm(Math.round(wordCount / minutes));
    }

    // Count filler word frequencies
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
  };

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

  // Webcam stream handlers
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

  // Bind the camera stream to the video element ref after it mounts in the DOM
  const videoCallbackRef = (node: HTMLVideoElement | null) => {
    if (node && mediaStreamRef.current) {
      node.srcObject = mediaStreamRef.current;
    }
  };

  // Cleanup media resources on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Unified Answer Submission Handler
  const submitAnswer = async (answerText: string) => {
    if (isEvaluating) return;

    // Stop speaking and listening immediately
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
        // Complete the session and route to the report page
        onFinish(sessionId);
      }
    } catch (err) {
      alert('Error submitting response: ' + (err as Error).message);
    } finally {
      setIsEvaluating(false);
    }
  };

  // User clicked "Submit Answer" manually
  const handleSubmit = () => {
    submitAnswer(inputText.trim());
  };

  // Triggered automatically when 2-minute countdown timer runs out
  const triggerAutoSubmit = () => {
    const finalAnswer = inputTextRef.current.trim() || '*(No verbal response recorded within 2-minute time limit)*';
    submitAnswer(finalAnswer);
  };

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
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] text-center relative overflow-hidden border border-[#21262d]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#a855f7]/5 rounded-full filter blur-2xl" />

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
                isAiSpeaking ? 'border-[#ec4899] w-32 h-32' : 'border-[#00d4ff]/40 w-28 h-28 mx-auto my-auto'
              }`}
            />

            {/* Speaking / Pulsing waves */}
            {isAiSpeaking && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                  className="absolute w-24 h-24 bg-[#a855f7]/10 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 0.6 }}
                  className="absolute w-24 h-24 bg-[#ec4899]/10 rounded-full"
                />
              </>
            )}

            {/* Center Core */}
            <motion.div
              animate={isAiSpeaking ? { scale: [0.9, 1.05, 0.9] } : { scale: 1 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className={`w-16 h-16 rounded-full bg-gradient-to-tr flex items-center justify-center relative z-10 ${
                isEvaluating
                  ? 'from-[#e4e8f1]/30 to-[#8b949e]/30'
                  : isListening
                  ? 'from-[#10b981] to-[#06b6d4]'
                  : 'from-[#0066ff] to-[#7c3aed]'
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
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {isEvaluating ? 'Evaluating Response...' : isAiSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'AI Interviewer'}
            </h4>
            <p className="text-xs text-[#8b949e]">
              {isEvaluating ? 'Gemini is running diagnostic metrics' : isListening ? 'Speak naturally when ready' : 'Ready for your input'}
            </p>
          </div>
        </div>

        {/* Optional Webcam Preview */}
        <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[160px] border border-[#21262d]">
          {cameraActive ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0d1117]">
              <video ref={videoCallbackRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              <button
                onClick={toggleCamera}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-red-400 hover:text-white transition-colors"
                title="Mute Camera"
              >
                <VideoOff className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#161b22] flex items-center justify-center mx-auto text-[#8b949e]">
                <VideoOff className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Camera Offline</p>
                <span className="text-[10px] text-[#8b949e]">Simulate proctoring feeds</span>
              </div>
              <button
                onClick={toggleCamera}
                className="btn-neon btn-neon-secondary !py-1 !px-3 text-[10px] flex items-center gap-1.5 mx-auto"
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
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border border-[#21262d]">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-[#8b949e] font-semibold uppercase tracking-wider block">Question Progress</span>
              <p className="text-sm font-extrabold text-[#00d4ff]">Question {currentQuestion.order} of 5</p>
            </div>
            <div className="pl-4 border-l border-[#21262d]">
              <span className="text-[10px] text-[#8b949e] font-semibold uppercase tracking-wider block">Topic</span>
              <p className="text-sm font-semibold text-white">{currentQuestion.category}</p>
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
              className={`p-2 rounded-lg border transition-all ${
                !isMuted ? 'border-[#00d4ff]/20 text-[#00d4ff] bg-[#00d4ff]/10' : 'border-[#21262d] text-[#8b949e]'
              }`}
              title="Toggle Audio Feedback"
            >
              {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Countdown Time HUD */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs transition-all ${
              timeLeft < 20
                ? 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444] animate-pulse font-bold'
                : 'bg-[#161b22] border border-[#21262d] text-[#00d4ff]'
            }`}>
              <Timer className={`w-3.5 h-3.5 ${timeLeft < 20 ? 'text-[#ef4444]' : 'text-[#00d4ff]'}`} />
              <span>Time Left: {formatTimer(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* The Question Box */}
        <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-[#0d1117] to-[#1c2333]/30 border border-[#21262d] relative">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff] flex-shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="space-y-3">
              <span className="text-[10px] text-[#00d4ff] font-extrabold uppercase tracking-wider">AI Interviewer Prompt</span>
              <h3 className="text-base md:text-lg font-semibold text-white leading-relaxed">{currentQuestion.question}</h3>
            </div>
          </div>

          {/* Quick Speak trigger button */}
          {!isMuted && !isAiSpeaking && (
            <button
              onClick={() => speakQuestion(currentQuestion.question)}
              className="absolute right-4 bottom-4 text-xs font-semibold text-[#8b949e] hover:text-[#00d4ff] flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" /> Replay Voice
            </button>
          )}
        </div>

        {/* Answer Transcription Box */}
        <div className="glass-card rounded-2xl p-5 border border-[#21262d] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Your Answer Transcript</span>
            
            {/* Live voice typing stats */}
            <div className="flex items-center gap-4 text-xs text-[#8b949e]">
              <span className="flex items-center gap-1.5">
                <BarChart className="w-3.5 h-3.5" />
                {wpm} WPM Pacing
              </span>
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
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
            className="w-full min-h-[140px] bg-[#0d1117]/60 border border-[#21262d] rounded-xl p-4 text-sm text-white placeholder:text-[#484f58] focus:border-[#00d4ff]/30 focus:outline-none transition-all resize-y leading-relaxed"
          />

          {/* Live transcript filler-words HUD */}
          {totalFillers > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] p-2 bg-[#ef4444]/5 border border-[#ef4444]/10 rounded-lg text-[#ef4444]/90">
              <span className="font-bold uppercase tracking-wider mr-1">Filler Analysis:</span>
              {Object.entries(fillerCounts).map(([w, c]) => c > 0 && (
                <span key={w} className="px-2 py-0.5 bg-[#ef4444]/10 rounded font-semibold">
                  "{w}": {c}x
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {/* Speech recognition trigger button */}
            <button
              onClick={toggleListening}
              disabled={isEvaluating}
              className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all border ${
                isListening
                  ? 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444] animate-pulse'
                  : 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981]/20'
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

            {/* Submit Response */}
            <button
              onClick={handleSubmit}
              disabled={isEvaluating || !inputText.trim()}
              className="btn-neon btn-neon-primary flex items-center justify-center gap-2 px-6 !py-3 text-sm flex-shrink-0"
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
