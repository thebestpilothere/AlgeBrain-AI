import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { generateQuestion, getAIHint } from '../lib/game-logic';
import { Question, Difficulty } from '../lib/types';
import confetti from 'canvas-confetti';
import { Flame, Brain, XCircle, CheckCircle2, ChevronRight, X, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

export default function Game() {
  const [, setLocation] = useLocation();
  const { globalStats, sessionStats, updateSessionStats, updateGlobalStats, checkAchievements, endSession } = useGame();
  const { toast } = useToast();

  const [question, setQuestion] = useState<Question | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong' | 'summary'>('idle');
  const [hint, setHint] = useState<string>('');
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session if missing
  useEffect(() => {
    if (!sessionStats) {
      setLocation('/play');
      return;
    }
    nextQuestion(globalStats.currentDifficulty);
  }, []);

  // Timer
  useEffect(() => {
    if (status !== 'idle' || !question) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [status, question]);

  useEffect(() => {
    if (timeLeft <= 0 && status === 'idle') {
      handleTimeOut();
    }
  }, [timeLeft, status]);

  // Focus input
  useEffect(() => {
    if (status === 'idle') {
      inputRef.current?.focus();
    }
  }, [status]);

  const handleTimeOut = () => {
    if (!sessionStats || !question) return;
    setStatus('wrong');
    setHint("Time's up! Let's try another one.");
    
    updateSessionStats({
      score: Math.max(0, sessionStats.score - 10),
      wrongAnswers: sessionStats.wrongAnswers + 1,
      questionsAnswered: sessionStats.questionsAnswered + 1,
      currentStreak: 0,
      topicHistory: [...sessionStats.topicHistory, { topic: question.topic, correct: false, questionId: question.id }]
    });

    handleAdaptiveDifficulty(false);

    setTimeout(() => {
      checkSummaryOrNext();
    }, 3000);
  };

  const nextQuestion = (diff: Difficulty) => {
    if (!sessionStats) return;
    const used = new Set(sessionStats.usedIds);
    const q = generateQuestion(diff, used);
    setQuestion(q);
    setTimeLeft(60);
    setInputValue('');
    setStatus('idle');
    setHint('');
    updateSessionStats({ usedIds: [...sessionStats.usedIds, q.id] });
  };

  const handleAdaptiveDifficulty = (correct: boolean) => {
    let consCorrect = correct ? globalStats.consecutiveCorrect + 1 : 0;
    let consWrong = correct ? 0 : globalStats.consecutiveWrong + 1;
    let currentDiff = globalStats.currentDifficulty;

    if (consCorrect >= 5) {
      const idx = DIFFICULTY_ORDER.indexOf(currentDiff);
      if (idx < DIFFICULTY_ORDER.length - 1) {
        currentDiff = DIFFICULTY_ORDER[idx + 1];
        consCorrect = 0;
        confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
        confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
        toast({ title: 'Level Up!', description: `Difficulty increased to ${currentDiff}!`, className: "bg-primary text-white border-primary" });
      }
    } else if (consWrong >= 3) {
      const idx = DIFFICULTY_ORDER.indexOf(currentDiff);
      if (idx > 0) {
        currentDiff = DIFFICULTY_ORDER[idx - 1];
        consWrong = 0;
        toast({ title: "Let's regroup", description: `Difficulty lowered to ${currentDiff}. You got this!`, className: "bg-muted text-white border-border" });
      }
    }

    updateGlobalStats({ consecutiveCorrect: consCorrect, consecutiveWrong: consWrong, currentDifficulty: currentDiff });
  };

  const checkSummaryOrNext = () => {
    if (!sessionStats || !question) return;
    const answered = sessionStats.questionsAnswered + 1; // including current
    
    if (answered === 20) {
      endSession();
      setLocation('/results');
      return;
    }

    if (answered % 10 === 0) {
      setStatus('summary');
    } else {
      nextQuestion(globalStats.currentDifficulty);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || status !== 'idle' || !question || !sessionStats) return;

    const numAnswer = parseInt(inputValue, 10);
    const isCorrect = numAnswer === question.answer;

    const newStreak = isCorrect ? sessionStats.currentStreak + 1 : 0;
    const timeSpent = 60 - timeLeft;
    const scoreEarned = isCorrect ? 10 + (timeLeft > 30 ? 5 : 0) : 0;

    // Update global topic performance
    const perf = globalStats.topicPerformance[question.topic];
    updateGlobalStats({
      totalQuestionsAnswered: globalStats.totalQuestionsAnswered + 1,
      totalCorrect: globalStats.totalCorrect + (isCorrect ? 1 : 0),
      totalWrong: globalStats.totalWrong + (isCorrect ? 0 : 1),
      topicPerformance: {
        ...globalStats.topicPerformance,
        [question.topic]: { correct: perf.correct + (isCorrect ? 1 : 0), total: perf.total + 1 }
      }
    });

    updateSessionStats({
      questionsAnswered: sessionStats.questionsAnswered + 1,
      correctAnswers: sessionStats.correctAnswers + (isCorrect ? 1 : 0),
      wrongAnswers: sessionStats.wrongAnswers + (isCorrect ? 0 : 1),
      currentStreak: newStreak,
      longestStreak: Math.max(sessionStats.longestStreak, newStreak),
      score: sessionStats.score + scoreEarned,
      responseTimes: [...sessionStats.responseTimes, timeSpent * 1000],
      topicHistory: [...sessionStats.topicHistory, { topic: question.topic, correct: isCorrect, questionId: question.id }]
    });

    setStatus(isCorrect ? 'correct' : 'wrong');
    handleAdaptiveDifficulty(isCorrect);
    setTimeout(() => checkAchievements(), 100);

    if (isCorrect) {
      setTimeout(() => {
        checkSummaryOrNext();
      }, 1500);
    } else {
      const hintMsg = getAIHint(question.topic, numAnswer, question.answer);
      setHint(hintMsg);
      setTimeout(() => {
        checkSummaryOrNext();
      }, 4000);
    }
  };

  const handleSkip = () => {
    if (status !== 'idle' || !sessionStats || !question) return;
    updateSessionStats({
      score: Math.max(0, sessionStats.score - 5),
      questionsAnswered: sessionStats.questionsAnswered + 1,
      currentStreak: 0,
      topicHistory: [...sessionStats.topicHistory, { topic: question.topic, correct: false, questionId: question.id }]
    });
    handleAdaptiveDifficulty(false);
    checkSummaryOrNext();
  };

  const handleQuit = () => {
    endSession();
    setLocation('/results');
  };

  if (!sessionStats || !question) return null;

  const timerColor = timeLeft > 30 ? 'bg-primary' : timeLeft > 10 ? 'bg-yellow-500' : 'bg-red-500';
  const accuracy = sessionStats.questionsAnswered > 0 
    ? Math.round((sessionStats.correctAnswers / sessionStats.questionsAnswered) * 100) 
    : 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* HUD */}
      <div className="fixed top-0 left-0 w-full p-4 flex flex-col gap-2 z-50">
        <div className="flex justify-between items-center max-w-4xl mx-auto w-full bg-card/80 backdrop-blur border border-white/10 p-3 rounded-2xl shadow-lg">
          <div className="flex items-center gap-4">
            <button onClick={handleQuit} className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white">
              <X size={20} />
            </button>
            <div className="font-bold text-lg">Q {sessionStats.questionsAnswered + 1}</div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
              <span className="text-sm font-medium">Score:</span>
              <motion.span key={sessionStats.score} initial={{ scale: 1.5, color: '#fff' }} animate={{ scale: 1, color: 'var(--primary)' }} className="font-bold text-primary font-mono">{sessionStats.score}</motion.span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${sessionStats.currentStreak >= 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5'}`}>
              <Flame size={16} className={sessionStats.currentStreak >= 3 ? 'animate-pulse' : 'opacity-50'} />
              <span className="font-bold">{sessionStats.currentStreak}</span>
            </div>
            <div className="text-sm font-medium bg-white/5 px-3 py-1 rounded-full">
              {accuracy}% Acc
            </div>
            <div className="text-xs uppercase tracking-widest font-bold px-2 py-1 rounded bg-primary/20 text-primary border border-primary/30">
              {globalStats.currentDifficulty}
            </div>
          </div>
        </div>
        
        {/* Timer Bar */}
        <div className="max-w-4xl mx-auto w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${timerColor} transition-colors duration-300`}
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 60) * 100}%` }}
            transition={{ ease: "linear", duration: 1 }}
          />
        </div>
      </div>

      {/* Main Game Area */}
      {status !== 'summary' ? (
        <div className="w-full max-w-xl flex flex-col items-center mt-20">
          <motion.div 
            className={`w-full p-10 rounded-3xl bg-card border flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden ${
              status === 'correct' ? 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : 
              status === 'wrong' ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]' : 
              'border-white/10 shadow-2xl'
            }`}
            animate={status === 'wrong' ? { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } } : {}}
          >
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div 
                  key={question.id}
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="text-6xl md:text-7xl font-display font-bold tracking-wider mb-12 text-center text-white drop-shadow-md">
                    {question.text}
                  </div>

                  <form onSubmit={handleSubmit} className="flex gap-4 w-full max-w-sm">
                    <input
                      ref={inputRef}
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-1 bg-input/50 border-2 border-white/20 rounded-xl text-center text-3xl font-mono font-bold text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-white/20"
                      placeholder="x = ?"
                      disabled={status !== 'idle'}
                      autoComplete="off"
                    />
                    <button 
                      type="submit"
                      disabled={!inputValue}
                      className="bg-primary text-primary-foreground px-6 rounded-xl font-bold text-xl hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all neon-glow"
                    >
                      <ChevronRight size={32} />
                    </button>
                  </form>

                  <button 
                    onClick={handleSkip}
                    type="button"
                    className="mt-6 text-sm text-muted-foreground hover:text-white transition-colors"
                  >
                    Skip Question (-5 pts)
                  </button>
                </motion.div>
              )}

              {status === 'correct' && (
                <motion.div 
                  key="correct"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-green-400"
                >
                  <CheckCircle2 size={100} className="mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                  <div className="text-3xl font-bold font-display">Correct!</div>
                  <div className="text-green-400/80 mt-2 text-xl font-mono">x = {question.answer}</div>
                </motion.div>
              )}

              {status === 'wrong' && (
                <motion.div 
                  key="wrong"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col w-full text-center"
                >
                  <div className="flex flex-col items-center text-red-500 mb-8">
                    <XCircle size={80} className="mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                    <div className="text-2xl font-bold font-display">Incorrect</div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-secondary/20 border border-secondary/50 rounded-xl p-6 text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                      <Brain size={64} />
                    </div>
                    <div className="flex items-center gap-2 text-secondary-foreground font-bold mb-2">
                      <Bot size={20} /> AI Tutor Hint
                    </div>
                    <p className="text-lg text-white/90 relative z-10 leading-relaxed">
                      {hint}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : (
        <div className="w-full max-w-xl flex flex-col items-center mt-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-8 rounded-3xl bg-card border border-primary/50 violet-glow flex flex-col items-center text-center"
          >
            <Bot size={64} className="text-secondary mb-4" />
            <h2 className="text-3xl font-display font-bold text-white mb-2">AI Summary</h2>
            <p className="text-muted-foreground mb-8">You've completed {sessionStats.questionsAnswered} questions!</p>
            
            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-sm text-muted-foreground mb-1">Session Accuracy</div>
                <div className="text-2xl font-bold text-primary">{accuracy}%</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-sm text-muted-foreground mb-1">Score</div>
                <div className="text-2xl font-bold text-yellow-500">{sessionStats.score}</div>
              </div>
            </div>

            <button 
              onClick={() => nextQuestion(globalStats.currentDifficulty)}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-xl hover:bg-primary/90 transition-colors neon-glow"
            >
              Continue Learning
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
