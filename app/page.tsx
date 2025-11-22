'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseSession } from './hooks/useSupabaseSession';
import { useTimer } from './hooks/useTimer';
import Header from './components/Header';
import TimerDisplay from './components/TimerDisplay';
import TaskList from './components/TaskList';
import JoinModal from './components/JoinModal';
import { AlertCircle } from 'lucide-react';

// Define modes locally or import from a config file
const MODES: Record<string, { label: string; time: number; color: string; buttonColor: string }> = {
  pomodoro: { label: 'Pomodoro', time: 25 * 60, color: 'bg-[#ba4949]', buttonColor: 'text-[#ba4949]' },
  short: { label: 'Short Break', time: 5 * 60, color: 'bg-[#38858a]', buttonColor: 'text-[#38858a]' },
  long: { label: 'Long Break', time: 15 * 60, color: 'bg-[#397097]', buttonColor: 'text-[#397097]' },
};

export default function PomoSyncPage() {
  // 1. Initialize Hooks
  const backend = useSupabaseSession();
  
  // Stats State
  const [stats, setStats] = useState({ solo: 0, group: 0 });

  // Load and Reset Stats logic (Runs on Mount)
  useEffect(() => {
    const today = new Date().toDateString(); // "Mon Nov 22 2025"
    const savedData = localStorage.getItem('pomo_stats_daily');
    
    let currentStats = { solo: 0, group: 0, date: today };

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // If the stored date matches today, restore the counts
        if (parsed.date === today) {
          currentStats = parsed;
        } else {
          // If dates differ, we implicitly "reset" by keeping the defaults (0,0) 
          // and overwriting the storage with today's date below
          console.log("New day detected, resetting stats.");
        }
      } catch (e) {
        console.error("Error parsing stats", e);
      }
    }
    
    // Sync state and storage
    setStats({ solo: currentStats.solo, group: currentStats.group });
    localStorage.setItem('pomo_stats_daily', JSON.stringify(currentStats));
  }, []);

  // Handler for timer completion
  const onTimerComplete = useCallback((isGroupSession: boolean) => {
    setStats(prev => {
      const today = new Date().toDateString();
      const newStats = {
        solo: isGroupSession ? prev.solo : prev.solo + 1,
        group: isGroupSession ? prev.group + 1 : prev.group,
        date: today
      };
      
      localStorage.setItem('pomo_stats_daily', JSON.stringify(newStats));
      return { solo: newStats.solo, group: newStats.group };
    });
  }, []);

  const timer = useTimer(backend, onTimerComplete);
  
  // 2. Local UI State
  const [isJoining, setIsJoining] = useState(false);
  
  // 3. Derived State
  const currentTheme = MODES[timer.mode] || MODES.pomodoro;

  // 4. Handlers
  const handleCreate = async () => {
    await backend.createSession('pomodoro', MODES.pomodoro.time);
  };

  const handleJoin = async (code: string) => {
    const success = await backend.joinSession(code);
    if (success) {
      setIsJoining(false);
    } else {
      alert("Session not found! Please check the code and try again.");
    }
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 ease-out ${currentTheme.color} text-white font-sans flex flex-col`}
    >
      <Header 
        sessionCode={backend.sessionId}
        onCreate={handleCreate}
        onJoin={() => setIsJoining(true)}
        onLeave={backend.leaveSession}
      />

      <main className="flex-1 flex flex-col items-center p-4 w-full">
        <TimerDisplay 
          theme={currentTheme}
          mode={timer.mode}
          time={timer.timeLeft}
          isRunning={timer.isRunning}
          onToggle={timer.toggle}
          onModeChange={timer.changeMode}
        />
        
        <TaskList activeColor={currentTheme.color} stats={stats} />

        {/* Optional: Error Toast */}
        {backend.error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="w-4 h-4" />
            <span>{backend.error}</span>
          </div>
        )}
      </main>

      {/* Join Session Modal */}
      <JoinModal 
        isOpen={isJoining}
        onClose={() => setIsJoining(false)}
        onJoin={handleJoin}
      />

      {/* Audio Element for Timer Alarm */}
      <audio 
        ref={timer.audioRef} 
        src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" 
      />
    </div>
  );
}