export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type Topic = 'one-step' | 'two-step' | 'distributive' | 'variables-both-sides';

export interface Question {
  id: string;
  text: string;
  answer: number;
  topic: Topic;
  difficulty: Difficulty;
}

export interface SessionStats {
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  currentStreak: number;
  longestStreak: number;
  score: number;
  startTime: number;
  responseTimes: number[];
  topicHistory: { topic: Topic; correct: boolean; questionId?: string }[];
  usedIds: string[];
}

export interface HistoryEntry {
  date: string;
  score: number;
  accuracy: number;
  difficulty: Difficulty;
  questionsAnswered: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface GlobalStats {
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  bestScore: number;
  longestStreak: number;
  history: HistoryEntry[];
  achievements: Achievement[];
  topicPerformance: Record<Topic, { correct: number; total: number }>;
  currentDifficulty: Difficulty;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  soundEnabled: boolean;
  lastSessionStats?: SessionStats;
}
