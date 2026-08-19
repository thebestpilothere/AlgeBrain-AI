import React, { createContext, useContext, useEffect, useState } from 'react';
import { GlobalStats, SessionStats, Difficulty, Topic } from '../lib/types';
import confetti from 'canvas-confetti';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_ACHIEVEMENTS = [
  { id: 'first-correct', title: 'First Correct Answer', description: 'First correct answer ever', icon: 'CheckCircle2', unlocked: false },
  { id: 'streak-5', title: 'Five in a Row', description: 'currentStreak reaches 5', icon: 'Zap', unlocked: false },
  { id: 'streak-10', title: 'Equation Expert', description: 'currentStreak reaches 10', icon: 'Flame', unlocked: false },
  { id: 'explorer', title: 'Algebra Explorer', description: '25 total questions answered', icon: 'Brain', unlocked: false },
  { id: 'century', title: '100 Questions Solved', description: '100 total questions answered', icon: 'Star', unlocked: false },
  { id: 'ai-genius', title: 'AI Genius', description: 'Reach Expert difficulty', icon: 'Bot', unlocked: false },
  { id: 'perfect', title: 'Perfect Accuracy', description: 'Session ends with 100% accuracy (min 10 questions)', icon: 'Trophy', unlocked: false },
];

const INITIAL_STATS: GlobalStats = {
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  totalWrong: 0,
  bestScore: 0,
  longestStreak: 0,
  history: [],
  achievements: DEFAULT_ACHIEVEMENTS,
  topicPerformance: {
    'one-step': { correct: 0, total: 0 },
    'two-step': { correct: 0, total: 0 },
    'distributive': { correct: 0, total: 0 },
    'variables-both-sides': { correct: 0, total: 0 },
  },
  currentDifficulty: 'easy',
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
  soundEnabled: true,
};

export const INITIAL_SESSION: SessionStats = {
  questionsAnswered: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  currentStreak: 0,
  longestStreak: 0,
  score: 0,
  startTime: Date.now(),
  responseTimes: [],
  topicHistory: [],
  usedIds: [],
};

interface GameContextType {
  globalStats: GlobalStats;
  sessionStats: SessionStats | null;
  startSession: (difficulty: Difficulty) => void;
  endSession: () => void;
  updateGlobalStats: (updates: Partial<GlobalStats>) => void;
  updateSessionStats: (updates: Partial<SessionStats>) => void;
  checkAchievements: () => void;
  resetProgress: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [globalStats, setGlobalStats] = useState<GlobalStats>(() => {
    const saved = localStorage.getItem('algebrain_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure new achievements are merged
        parsed.achievements = DEFAULT_ACHIEVEMENTS.map(def => {
          const existing = parsed.achievements?.find((a: any) => a.id === def.id);
          return existing || def;
        });
        return { ...INITIAL_STATS, ...parsed };
      } catch (e) {
        return INITIAL_STATS;
      }
    }
    return INITIAL_STATS;
  });

  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('algebrain_stats', JSON.stringify(globalStats));
  }, [globalStats]);

  const updateGlobalStats = (updates: Partial<GlobalStats>) => {
    setGlobalStats(prev => ({ ...prev, ...updates }));
  };

  const updateSessionStats = (updates: Partial<SessionStats>) => {
    setSessionStats(prev => prev ? { ...prev, ...updates } : null);
  };

  const startSession = (difficulty: Difficulty) => {
    setSessionStats({ ...INITIAL_SESSION, startTime: Date.now() });
    updateGlobalStats({ currentDifficulty: difficulty });
  };

  const endSession = () => {
    if (sessionStats) {
      // Log history
      const historyEntry = {
        date: new Date().toISOString(),
        score: sessionStats.score,
        accuracy: sessionStats.questionsAnswered > 0 ? (sessionStats.correctAnswers / sessionStats.questionsAnswered) * 100 : 0,
        difficulty: globalStats.currentDifficulty,
        questionsAnswered: sessionStats.questionsAnswered,
      };
      
      const newHistory = [...globalStats.history, historyEntry].slice(-30); // keep last 30 days
      
      const isPerfect = sessionStats.questionsAnswered >= 10 && sessionStats.correctAnswers === sessionStats.questionsAnswered;

      updateGlobalStats({
        lastSessionStats: sessionStats,
        bestScore: Math.max(globalStats.bestScore, sessionStats.score),
        longestStreak: Math.max(globalStats.longestStreak, sessionStats.longestStreak),
        history: newHistory,
      });

      if (isPerfect) {
        unlockAchievement('perfect');
      }

      setSessionStats(null);
    }
  };

  const unlockAchievement = (id: string) => {
    setGlobalStats(prev => {
      const ach = prev.achievements.find(a => a.id === id);
      if (ach && !ach.unlocked) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        toast({
          title: `Achievement Unlocked!`,
          description: ach.title,
          className: "bg-primary text-primary-foreground border-primary neon-glow"
        });
        return {
          ...prev,
          achievements: prev.achievements.map(a => 
            a.id === id ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
          )
        };
      }
      return prev;
    });
  };

  const checkAchievements = () => {
    if (!sessionStats) return;

    if (globalStats.totalCorrect === 1) unlockAchievement('first-correct');
    if (sessionStats.currentStreak >= 5) unlockAchievement('streak-5');
    if (sessionStats.currentStreak >= 10) unlockAchievement('streak-10');
    if (globalStats.totalQuestionsAnswered >= 25) unlockAchievement('explorer');
    if (globalStats.totalQuestionsAnswered >= 100) unlockAchievement('century');
    if (globalStats.currentDifficulty === 'expert') unlockAchievement('ai-genius');
  };

  const resetProgress = () => {
    setGlobalStats(INITIAL_STATS);
    setSessionStats(null);
    localStorage.removeItem('algebrain_stats');
  };

  return (
    <GameContext.Provider value={{
      globalStats,
      sessionStats,
      startSession,
      endSession,
      updateGlobalStats,
      updateSessionStats,
      checkAchievements,
      resetProgress,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
