import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Play, BarChart2, Bot, Trophy, Settings, Flame } from 'lucide-react';

export default function Home() {
  const { globalStats } = useGame();

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Particles / Stars */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        className="relative z-10 w-full max-w-md flex flex-col items-center"
        variants={containerVars}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVars} className="text-center mb-12">
          <div className="inline-block mb-4 p-4 rounded-full bg-card/50 backdrop-blur-md border border-white/10 violet-glow">
            <Bot size={48} className="text-secondary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-primary-foreground to-primary font-display drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-4 tracking-tight">
            AlgeBrain AI
          </h1>
          <p className="text-lg text-muted-foreground font-medium">Master Algebra with Artificial Intelligence</p>
        </motion.div>

        <motion.div variants={itemVars} className="flex gap-4 mb-12">
          <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur border border-white/5 rounded-full shadow-lg">
            <Trophy size={18} className="text-yellow-500" />
            <span className="font-bold text-sm text-foreground/90">Best: {globalStats.bestScore}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur border border-white/5 rounded-full shadow-lg">
            <Flame size={18} className="text-orange-500" />
            <span className="font-bold text-sm text-foreground/90">Streak: {globalStats.longestStreak}</span>
          </div>
        </motion.div>

        <motion.div variants={containerVars} className="flex flex-col w-full gap-4">
          <Link href="/play" className="group relative w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-xl overflow-hidden hover:scale-[1.02] transition-transform neon-glow">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <Play size={24} className="fill-current relative z-10" />
            <span className="relative z-10 font-display">Play Now</span>
          </Link>

          <div className="grid grid-cols-2 gap-4 w-full">
            <Link href="/progress" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-white/10 hover:bg-white/5 transition-colors group">
              <BarChart2 size={24} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground">Progress</span>
            </Link>
            <Link href="/tutor" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-white/10 hover:bg-white/5 transition-colors group">
              <Bot size={24} className="text-secondary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground">AI Tutor</span>
            </Link>
            <Link href="/achievements" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-white/10 hover:bg-white/5 transition-colors group">
              <Trophy size={24} className="text-yellow-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground">Badges</span>
            </Link>
            <Link href="/settings" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-white/10 hover:bg-white/5 transition-colors group">
              <Settings size={24} className="text-muted-foreground group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground">Settings</span>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
