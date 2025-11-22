'use client';

import React, { useState } from 'react';
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
  const timer = useTimer(backend);
  
  // 2. Local UI State
  const [isJoining, setIsJoining] = useState(false);
  
  // 3. Derived State
  // Fallback to pomodoro theme if mode is undefined during loading/transitions
  const currentTheme = MODES[timer.mode] || MODES.pomodoro;

  // 4. Handlers
  const handleCreate = async () => {
    // Initial creation defaults to Pomodoro mode
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
        
        <TaskList activeColor={currentTheme.color} />

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