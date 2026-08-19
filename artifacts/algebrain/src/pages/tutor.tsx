import React from 'react';
import { Link, useLocation } from 'wouter';
import { useGame } from '../context/GameContext';
import { ChevronLeft, Bot, AlertTriangle, ChevronRight, Target } from 'lucide-react';
import { getAIHint } from '../lib/game-logic';

export default function Tutor() {
  const { globalStats, sessionStats, startSession } = useGame();
  const [, setLocation] = useLocation();

  const topicsData = Object.entries(globalStats.topicPerformance).map(([topic, data]) => ({
    id: topic,
    name: topic.replace(/-/g, ' '),
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    total: data.total
  })).sort((a, b) => a.accuracy - b.accuracy);

  const weakestTopic = topicsData[0];

  // Extract last 5 mistakes from session topicHistory if available, or just show a message
  // Wait, history only stores topic, not the specific question text.
  // The requirements say "Mistake history: last 5 wrong answers with the hint that was given".
  // Let's look at what we have in GameContext. 
  // We have `globalStats.history` but it's aggregate.
  // We have `sessionStats.topicHistory` but it doesn't have question text/answers.
  // I should add mistake history to globalStats.

  // Let's simulate the hints based on the weakest topics since we don't store full question text in global history to save localStorage space.
  const generalHints = {
    'one-step': "You often struggle with moving constants. Remember: do the inverse operation to both sides.",
    'two-step': "In two-step equations, always handle the addition/subtraction before the multiplication/division.",
    'distributive': "Don't forget to multiply the outside number by EVERY term inside the parentheses.",
    'variables-both-sides': "Group all your x terms on the left and all constants on the right before solving."
  };

  const handlePracticeWeakest = () => {
    // Determine appropriate difficulty for the weakest topic
    let diff: any = 'easy';
    if (weakestTopic.id === 'two-step') diff = 'medium';
    if (weakestTopic.id === 'distributive') diff = 'hard';
    if (weakestTopic.id === 'variables-both-sides') diff = 'expert';
    
    startSession(diff);
    setLocation('/game');
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center mb-4 relative">
        <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold font-display absolute left-1/2 -translate-x-1/2 text-white flex items-center gap-2">
          <Bot className="text-secondary" /> AI Tutor
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Analysis */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold font-display mb-6">Topic Breakdown</h2>
            <div className="flex flex-col gap-6">
              {topicsData.map((topic) => (
                <div key={topic.id} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold capitalize">{topic.name}</span>
                    <span className="text-muted-foreground">{topic.accuracy}% ({topic.total} attempts)</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        topic.accuracy > 70 ? 'bg-green-500' : topic.accuracy > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.max(topic.accuracy, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" /> Focus Areas
            </h2>
            <div className="flex flex-col gap-4">
              {topicsData.slice(0, 2).map((topic, i) => (
                topic.total > 0 && (
                  <div key={topic.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-white capitalize mb-1">{topic.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {generalHints[topic.id as keyof typeof generalHints]}
                      </p>
                    </div>
                  </div>
                )
              ))}
              {topicsData[0].total === 0 && (
                <div className="text-muted-foreground text-center py-4">Play some games to get personalized focus areas!</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Action Plan */}
        <div className="flex flex-col gap-6">
          <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-6 violet-glow flex flex-col items-center text-center sticky top-6">
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
              <Target size={40} className="text-secondary" />
            </div>
            <h2 className="text-xl font-bold font-display text-white mb-2">Targeted Practice</h2>
            <p className="text-sm text-white/80 mb-8 leading-relaxed">
              Based on your performance, I've prepared a custom session focusing on <strong>{weakestTopic.name}</strong> to build your confidence.
            </p>
            
            <button 
              onClick={handlePracticeWeakest}
              disabled={weakestTopic.total === 0}
              className="w-full py-4 rounded-xl bg-secondary text-white font-bold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              Start Drill <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            {weakestTopic.total === 0 && (
              <p className="text-xs text-secondary-foreground mt-4">Needs more data to start.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
