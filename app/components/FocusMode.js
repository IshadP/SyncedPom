import React, { useEffect } from 'react';
import { Minimize2, Pause, Play } from 'lucide-react';

const FocusMode = ({ 
  isOpen, 
  onClose, 
  timeLeft, 
  isRunning, 
  onToggleTimer, 
  currentTask,
  modeLabel
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
      {/* Exit Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
        title="Exit Focus Mode (Esc)"
      >
        <Minimize2 className="w-8 h-8" />
      </button>

      {/* Current Task */}
      <div className="mb-12 text-center px-4 max-w-4xl">
        <span className="text-white/40 uppercase tracking-[0.2em] text-sm font-bold mb-4 block">
          {modeLabel}
        </span>
        <h1 className="text-3xl md:text-5xl font-medium text-white/90 leading-tight">
          {currentTask ? currentTask.title : "Focus"}
        </h1>
      </div>

      {/* Massive Timer */}
      <div className="font-mono font-bold text-[15vw] leading-none tracking-tighter tabular-nums mb-12 select-none">
        {formatTime(timeLeft)}
      </div>

      {/* Minimal Controls */}
      <button 
        onClick={onToggleTimer}
        className="group p-6 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
      >
        {isRunning ? (
          <Pause className="w-12 h-12 fill-current text-white" />
        ) : (
          <Play className="w-12 h-12 fill-current text-white ml-1" />
        )}
      </button>

      <div className="absolute bottom-8 text-white/20 text-sm font-medium">
        Press ESC to exit
      </div>
    </div>
  );
};

export default FocusMode;