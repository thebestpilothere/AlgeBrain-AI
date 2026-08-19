import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Trophy, Target, Flame, Bot, Home, RotateCcw } from 'lucide-react';

export default function Results() {
  const { globalStats } = useGame();
  
  const stats = globalStats.lastSessionStats;

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Bot size={64} className="text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold font-display text-white mb-2">No Session Data</h1>
        <p className="text-muted-foreground mb-8">It looks like you haven't played a game recently.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors neon-glow">
          Return to Hub
        </Link>
      </div>
    );
  }

  const accuracy = stats.questionsAnswered > 0 
    ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) 
    : 0;
  
  const timeSpentMs = stats.responseTimes.reduce((a, b) => a + b, 0);
  const timeSpentSec = Math.round(timeSpentMs / 1000);
  const mins = Math.floor(timeSpentSec / 60);
  const secs = timeSpentSec % 60;
  const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`;

  const isPerfect = stats.questionsAnswered >= 10 && stats.correctAnswers === stats.questionsAnswered;

  let feedback = "";
  if (accuracy >= 90) feedback = "Outstanding performance! Your algebraic circuits are highly optimized.";
  else if (accuracy >= 70) feedback = "Solid work. A few minor errors, but your fundamentals are strong.";
  else if (accuracy >= 50) feedback = "Good effort. Review your mistakes in the AI Tutor panel to improve.";
  else feedback = "This was a challenging session. Don't worry—check the AI Tutor and try a lower difficulty next time.";

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <motion.div 
        className="w-full max-w-2xl bg-card border border-white/10 rounded-3xl p-8 relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        {isPerfect && (
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-transparent to-transparent pointer-events-none" />
        )}
        
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="w-24 h-24 bg-card border-4 border-primary rounded-full flex items-center justify-center mb-6 violet-glow shadow-[0_0_50px_rgba(217,145,255,0.4)]">
            <Trophy size={48} className="text-primary" />
          </div>
          <h1 className="text-4xl font-black font-display text-white mb-2">Session Complete</h1>
          <p className="text-lg text-muted-foreground">{feedback}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="text-muted-foreground mb-1 text-sm font-medium">Score</div>
            <div className="text-3xl font-mono font-bold text-yellow-400">{stats.score}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="text-muted-foreground mb-1 text-sm font-medium">Accuracy</div>
            <div className={`text-3xl font-mono font-bold ${accuracy >= 70 ? 'text-green-400' : accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {accuracy}%
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="text-muted-foreground mb-1 text-sm font-medium">Best Streak</div>
            <div className="text-3xl font-mono font-bold text-orange-400 flex items-center gap-1">
              {stats.longestStreak} <Flame size={24} />
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="text-muted-foreground mb-1 text-sm font-medium">Time Spent</div>
            <div className="text-2xl font-mono font-bold text-white">
              {formattedTime}
            </div>
          </div>
        </div>

        <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <Bot size={32} className="text-secondary mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-white mb-1">AI Analysis</h3>
            <p className="text-sm text-secondary-foreground/90 leading-relaxed">
              You answered {stats.correctAnswers} out of {stats.questionsAnswered} correctly. 
              {stats.wrongAnswers > 0 && " Review the Tutor tab for a breakdown of your mistakes."}
              {stats.score > globalStats.bestScore && " Congratulations on setting a new personal best score!"}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <Link href="/play" className="flex-1 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors neon-glow group">
            <RotateCcw size={20} className="group-hover:-rotate-180 transition-transform duration-500" /> Play Again
          </Link>
          <Link href="/" className="flex-1 py-4 rounded-xl bg-card border border-white/10 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
            <Home size={20} /> Back to Hub
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
