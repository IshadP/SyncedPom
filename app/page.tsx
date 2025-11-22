'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseSession } from './hooks/useSupabaseSession';
import { useTimer } from './hooks/useTimer';
import Header from './components/Header';
import TimerDisplay from './components/TimerDisplay';
import TaskList from './components/TaskList';
import JoinModal from './components/JoinModal';
import FocusMode from './components/FocusMode';
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
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // We need to lift the current task state up so we can show it in Focus Mode
  // Normally TaskList manages its own state, but for this feature, we'll access local storage directly 
  // or just pass a prop to TaskList to notify us. 
  // A simpler approach for this modular structure: store the *current* active task in a shared state or read from local storage here too.
  // For simplicity/robustness without refactoring everything to Context, we'll read the first uncompleted task from local storage
  // whenever we enter focus mode.
  const [currentTask, setCurrentTask] = useState(null);

  // Load and Reset Stats logic (Runs on Mount)
  useEffect(() => {
    const today = new Date().toDateString();
    const savedData = localStorage.getItem('pomo_stats_daily');
    
    let currentStats = { solo: 0, group: 0, date: today };

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.date === today) {
          currentStats = parsed;
        }
      } catch (e) {
        console.error("Error parsing stats", e);
      }
    }
    
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
      
      const storedData = localStorage.getItem('pomo_stats_daily');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.date !== today) {
           newStats.solo = isGroupSession ? 0 : 1;
           newStats.group = isGroupSession ? 1 : 0;
        }
      }
      
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

  const handleEnterFocusMode = () => {
    // Fetch current active task
    const savedTasks = localStorage.getItem('pomo_tasks');
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      // Find first uncompleted task
      const active = parsed.find((t: any) => !t.completed);
      setCurrentTask(active || null);
    }
    setIsFocusMode(true);
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
          onEnterFocusMode={handleEnterFocusMode}
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

      {/* Focus Mode Overlay */}
      <FocusMode 
        isOpen={isFocusMode}
        onClose={() => setIsFocusMode(false)}
        timeLeft={timer.timeLeft}
        isRunning={timer.isRunning}
        onToggleTimer={timer.toggle}
        currentTask={currentTask}
        modeLabel={currentTheme.label}
      />

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