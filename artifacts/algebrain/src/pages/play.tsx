import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Difficulty } from '../lib/types';

export default function Play() {
  const [, setLocation] = useLocation();
  const { startSession, globalStats } = useGame();

  const handleSelectDifficulty = (difficulty: Difficulty) => {
    startSession(difficulty);
    setLocation('/game');
  };

  const difficulties = [
    {
      id: 'easy' as Difficulty,
      label: 'Easy',
      color: 'bg-green-500',
      glow: 'shadow-[0_0_20px_rgba(34,197,94,0.4)]',
      border: 'border-green-500/30',
      text: 'text-green-400',
      example: 'x + 5 = 12',
      topic: 'one-step' as const,
    },
    {
      id: 'medium' as Difficulty,
      label: 'Medium',
      color: 'bg-yellow-500',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      example: '3x - 4 = 11',
      topic: 'two-step' as const,
    },
    {
      id: 'hard' as Difficulty,
      label: 'Hard',
      color: 'bg-red-500',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
      border: 'border-red-500/30',
      text: 'text-red-400',
      example: '2(3x + 1) = 14',
      topic: 'distributive' as const,
    },
    {
      id: 'expert' as Difficulty,
      label: 'Expert',
      color: 'bg-slate-800',
      glow: 'shadow-[0_0_20px_rgba(255,255,255,0.2)]',
      border: 'border-slate-600',
      text: 'text-slate-300',
      example: '4x - 2 = 2x + 8',
      topic: 'variables-both-sides' as const,
    }
  ];

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-2xl mx-auto">
      <header className="flex items-center mb-8 relative">
        <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold font-display absolute left-1/2 -translate-x-1/2 text-white">Select Protocol</h1>
      </header>

      <motion.div 
        className="flex flex-col gap-4"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        {difficulties.map((d) => {
          const perf = globalStats.topicPerformance[d.topic];
          const accuracy = perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : 0;
          
          return (
            <motion.button
              key={d.id}
              onClick={() => handleSelectDifficulty(d.id)}
              variants={{
                hidden: { opacity: 0, x: -20 },
                show: { opacity: 1, x: 0 }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden flex flex-col text-left p-6 rounded-2xl bg-card border ${d.border} ${d.glow} transition-all`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${d.color} animate-pulse`} />
                  <h2 className={`text-xl font-bold uppercase tracking-wider ${d.text}`}>{d.label}</h2>
                </div>
                {perf.total > 0 && (
                  <div className="text-sm font-medium text-muted-foreground">
                    Accuracy: <span className={accuracy > 70 ? 'text-green-400' : accuracy > 40 ? 'text-yellow-400' : 'text-red-400'}>{accuracy}%</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-mono text-white/90 my-2">{d.example}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {d.topic.replace(/-/g, ' ')}
              </p>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
