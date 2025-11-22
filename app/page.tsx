'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseSession } from './hooks/useSupabaseSession';
import { useTimer } from './hooks/useTimer';
import Header from './components/Header';
import TimerDisplay from './components/TimerDisplay';
import TaskList from './components/TaskList';
import JoinModal from './components/JoinModal';
import FocusMode from './components/FocusMode';
import SettingsModal from './components/SettingsModal';

// Initial fallback for theme colors (times now come from useTimer)
const THEME_COLORS: Record<string, { color: string; buttonColor: string }> = {
  pomodoro: { color: 'bg-[#ba4949]', buttonColor: 'text-[#ba4949]' },
  short: { color: 'bg-[#38858a]', buttonColor: 'text-[#38858a]' },
  long: { color: 'bg-[#397097]', buttonColor: 'text-[#397097]' },
};

export default function PomoSyncPage() {
  const backend = useSupabaseSession();
  
  const [stats, setStats] = useState({ solo: 0, group: 0 });
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

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

  // useTimer now manages the mode settings internally
  const timer = useTimer(backend, onTimerComplete);
  
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  
  const currentTheme = THEME_COLORS[timer.mode] || THEME_COLORS.pomodoro;

  const handleCreate = async () => {
    // Pass current local settings to the new session
    await backend.createSession('pomodoro', timer.modes.pomodoro.time, timer.modes);
  };

  const handleJoin = async (code: string) => {
    const success = await backend.joinSession(code);
    if (success) {
      setIsJoining(false);
      setJoinCode('');
    } else {
      alert("Session not found! Please check the code and try again.");
    }
  };

  const handleEnterFocusMode = () => {
    const savedTasks = localStorage.getItem('pomo_tasks');
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
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
        onOpenSettings={() => setIsSettingsOpen(true)} // Added here
      />

      <main className="flex-1 flex flex-col items-center p-4 w-full">
        <TimerDisplay 
          theme={currentTheme}
          mode={timer.mode}
          modes={timer.modes} // Pass dynamic modes
          time={timer.timeLeft}
          isRunning={timer.isRunning}
          onToggle={timer.toggle}
          onModeChange={timer.changeMode}
          onEnterFocusMode={handleEnterFocusMode}
          // onOpenSettings removed from here
        />
        
        <TaskList activeColor={currentTheme.color} stats={stats} />

        {backend.error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{backend.error}</span>
          </div>
        )}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={timer.modes}
        onSave={timer.updateSettings}
        isHost={backend.isHost}
        isSolo={!backend.sessionId}
      />

      <FocusMode 
        isOpen={isFocusMode}
        onClose={() => setIsFocusMode(false)}
        timeLeft={timer.timeLeft}
        isRunning={timer.isRunning}
        onToggleTimer={timer.toggle}
        currentTask={currentTask}
        modeLabel={timer.modes[timer.mode].label}
      />

      <JoinModal 
        isOpen={isJoining}
        onClose={() => setIsJoining(false)}
        onJoin={handleJoin}
      />

      <audio 
        ref={timer.audioRef} 
        src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" 
      />
    </div>
  );
}