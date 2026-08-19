import React from 'react';
import { Link } from 'wouter';
import { useGame } from '../context/GameContext';
import { ChevronLeft, Settings as SettingsIcon, Volume2, VolumeX, Trash2, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { globalStats, updateGlobalStats, resetProgress } = useGame();

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col gap-6">
      <header className="flex items-center mb-8 relative">
        <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold font-display absolute left-1/2 -translate-x-1/2 text-white flex items-center gap-2">
          <SettingsIcon className="text-muted-foreground" /> Settings
        </h1>
      </header>

      <div className="flex flex-col gap-8">
        
        {/* Preferences */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Preferences</h2>
          <div className="bg-card border border-white/5 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  {globalStats.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </div>
                <div>
                  <Label htmlFor="sound-toggle" className="text-base font-bold text-white">Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">Play sounds on correct/wrong answers</p>
                </div>
              </div>
              <Switch 
                id="sound-toggle" 
                checked={globalStats.soundEnabled} 
                onCheckedChange={(c) => updateGlobalStats({ soundEnabled: c })} 
              />
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Data</h2>
          <div className="bg-card border border-white/5 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
                  <Trash2 size={20} />
                </div>
                <div>
                  <div className="text-base font-bold text-white">Reset Progress</div>
                  <p className="text-sm text-muted-foreground">Permanently delete all stats and badges</p>
                </div>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-bold text-sm hover:bg-destructive/90 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                    Reset Data
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-destructive/50 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      This action cannot be undone. This will permanently delete your scores, history, and all unlocked badges.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={resetProgress} className="bg-destructive text-white hover:bg-destructive/90">
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">About</h2>
          <div className="bg-card border border-white/5 rounded-2xl overflow-hidden flex flex-col p-6">
            <div className="flex items-start gap-4 mb-4">
              <Info className="text-primary mt-1" size={24} />
              <div>
                <h3 className="font-bold text-white mb-2">AlgeBrain AI v1.0</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  An adaptive learning protocol designed to train human neural networks in the art of algebraic manipulation. 
                  All progress is securely encrypted and stored locally on your device.
                </p>
              </div>
            </div>
            <div className="text-center mt-4 pt-4 border-t border-white/5">
              <p className="text-xs font-mono text-muted-foreground">© {new Date().getFullYear()} Replit Agent. No internet required.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
