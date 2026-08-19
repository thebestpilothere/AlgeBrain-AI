import React from 'react';
import { Link } from 'wouter';
import { useGame } from '../context/GameContext';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ChevronLeft, Target, Trophy, Clock, Brain, CheckCircle2, XCircle, Bot } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function Progress() {
  const { globalStats } = useGame();

  // Prepare data for charts
  const historyData = globalStats.history.slice(-14).map(entry => ({
    date: format(new Date(entry.date), 'MMM dd'),
    score: entry.score,
    accuracy: entry.accuracy,
    difficultyNum: entry.difficulty === 'easy' ? 1 : entry.difficulty === 'medium' ? 2 : entry.difficulty === 'hard' ? 3 : 4
  }));

  // Fill in missing days if history is short
  if (historyData.length < 5 && historyData.length > 0) {
    const lastDate = new Date(globalStats.history[0].date);
    for (let i = 1; i <= 5 - historyData.length; i++) {
      historyData.unshift({
        date: format(subDays(lastDate, i), 'MMM dd'),
        score: 0,
        accuracy: 0,
        difficultyNum: 1
      });
    }
  }

  const topicsData = Object.entries(globalStats.topicPerformance).map(([topic, data]) => ({
    topic: topic.replace(/-/g, ' '),
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    total: data.total
  }));

  const globalAccuracy = globalStats.totalQuestionsAnswered > 0 
    ? Math.round((globalStats.totalCorrect / globalStats.totalQuestionsAnswered) * 100) 
    : 0;

  // AI Insights
  let strongest = topicsData[0];
  let weakest = topicsData[0];

  topicsData.forEach(t => {
    if (t.accuracy > strongest.accuracy && t.total >= 5) strongest = t;
    if (t.accuracy < weakest.accuracy && t.total >= 5) weakest = t;
  });

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto flex flex-col gap-6">
      <header className="flex items-center mb-4 relative">
        <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold font-display absolute left-1/2 -translate-x-1/2 text-white">Performance Data</h1>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium"><Target size={16}/> Total Questions</div>
          <div className="text-3xl font-bold">{globalStats.totalQuestionsAnswered}</div>
        </div>
        <div className="bg-card border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium"><CheckCircle2 size={16} className="text-green-500"/> Overall Accuracy</div>
          <div className="text-3xl font-bold text-green-400">{globalAccuracy}%</div>
        </div>
        <div className="bg-card border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium"><Trophy size={16} className="text-yellow-500"/> Best Score</div>
          <div className="text-3xl font-bold text-yellow-400">{globalStats.bestScore}</div>
        </div>
        <div className="bg-card border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium"><Brain size={16} className="text-primary"/> Level Reached</div>
          <div className="text-3xl font-bold text-primary uppercase text-sm tracking-widest mt-2">{globalStats.currentDifficulty}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Charts Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-card border border-white/5 rounded-2xl p-6 h-[350px]">
            <h3 className="text-lg font-bold mb-6 font-display">Score History</h3>
            {historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Play some games to see your history!</div>
            )}
          </div>

          <div className="bg-card border border-white/5 rounded-2xl p-6 h-[350px]">
            <h3 className="text-lg font-bold mb-6 font-display">Topic Accuracy (%)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicsData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.5)" />
                <YAxis dataKey="topic" type="category" stroke="rgba(255,255,255,0.8)" width={120} tick={{fill: 'rgba(255,255,255,0.8)', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                  {topicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.accuracy > 70 ? 'hsl(142 72% 50%)' : entry.accuracy > 40 ? 'hsl(38 92% 50%)' : 'hsl(0 72% 51%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-6 violet-glow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Bot size={100} />
            </div>
            <h3 className="text-xl font-bold mb-4 font-display flex items-center gap-2 text-secondary-foreground"><Bot size={24}/> AI Insights</h3>
            
            {globalStats.totalQuestionsAnswered < 10 ? (
              <p className="text-white/80 leading-relaxed relative z-10">
                I need more data to analyze your learning patterns. Play at least 10 questions to unlock personalized insights!
              </p>
            ) : (
              <div className="flex flex-col gap-6 relative z-10">
                <div>
                  <div className="text-sm text-secondary-foreground/80 mb-1 uppercase tracking-wider font-bold">Strongest Area</div>
                  <div className="bg-green-500/20 text-green-400 border border-green-500/30 p-3 rounded-xl flex items-center justify-between">
                    <span className="font-bold capitalize">{strongest.topic}</span>
                    <span className="font-mono">{strongest.accuracy}%</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-secondary-foreground/80 mb-1 uppercase tracking-wider font-bold">Needs Practice</div>
                  <div className="bg-red-500/20 text-red-400 border border-red-500/30 p-3 rounded-xl flex items-center justify-between">
                    <span className="font-bold capitalize">{weakest.topic}</span>
                    <span className="font-mono">{weakest.accuracy}%</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-secondary/20">
                  <div className="text-sm text-secondary-foreground/80 mb-2 uppercase tracking-wider font-bold">AI Recommendation</div>
                  <p className="text-white/90 leading-relaxed text-sm">
                    {weakest.accuracy < 50 
                      ? `Focus your next session on "${weakest.topic}". Check the AI Tutor tab for specific guidance on your recent mistakes.`
                      : `You're showing solid understanding across the board. Try pushing to ${globalStats.currentDifficulty === 'expert' ? 'maintain' : 'the next'} difficulty level.`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
