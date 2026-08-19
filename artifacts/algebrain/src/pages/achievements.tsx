import React from 'react';
import { Link } from 'wouter';
import { useGame } from '../context/GameContext';
import { ChevronLeft, Trophy, CheckCircle2, Zap, Flame, Brain, Bot, Star, Lock } from 'lucide-react';
import { format } from 'date-fns';

const ICONS: Record<string, React.ElementType> = {
  CheckCircle2,
  Zap,
  Flame,
  Brain,
  Star,
  Bot,
  Trophy,
};

export default function Achievements() {
  const { globalStats } = useGame();

  const unlockedCount = globalStats.achievements.filter(a => a.unlocked).length;
  const totalCount = globalStats.achievements.length;

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto flex flex-col gap-6">
      <header className="flex items-center mb-4 relative">
        <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold font-display absolute left-1/2 -translate-x-1/2 text-white flex items-center gap-2">
          <Trophy className="text-yellow-500" /> Badges
        </h1>
      </header>

      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-black font-display text-white">Your Collection</h2>
          <p className="text-muted-foreground mt-2">Unlock badges by mastering algebraic concepts and maintaining streaks.</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black font-mono text-primary">{unlockedCount} / {totalCount}</div>
          <div className="text-sm text-primary/80 uppercase tracking-wider font-bold">Unlocked</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {globalStats.achievements.map((ach) => {
          const Icon = ICONS[ach.icon] || Trophy;
          
          return (
            <div 
              key={ach.id} 
              className={`relative overflow-hidden rounded-2xl border p-6 flex flex-col items-center text-center transition-all duration-500 ${
                ach.unlocked 
                  ? 'bg-card border-primary/30 neon-glow' 
                  : 'bg-card/50 border-white/5 opacity-60 grayscale-[0.8]'
              }`}
            >
              {ach.unlocked && (
                <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
              )}
              
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 border-4 ${
                ach.unlocked ? 'bg-primary/20 border-primary text-primary' : 'bg-muted border-muted-foreground/30 text-muted-foreground'
              }`}>
                {ach.unlocked ? <Icon size={40} /> : <Lock size={32} />}
              </div>
              
              <h3 className={`text-xl font-bold font-display mb-2 ${ach.unlocked ? 'text-white' : 'text-muted-foreground'}`}>
                {ach.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                {ach.description}
              </p>
              
              {ach.unlocked && ach.unlockedAt ? (
                <div className="text-xs font-mono text-primary/80 bg-primary/10 px-3 py-1 rounded-full">
                  Unlocked: {format(new Date(ach.unlockedAt), 'MMM dd, yyyy')}
                </div>
              ) : (
                <div className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  Locked
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
