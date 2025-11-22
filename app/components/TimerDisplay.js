import React from 'react';
import { Pause, Maximize2 } from 'lucide-react';

// duplicating basic mode info for UI labels
const MODES = {
  pomodoro: { label: 'Pomodoro' },
  short: { label: 'Short Break' },
  long: { label: 'Long Break' },
};

const TimerDisplay = ({ mode, time, isRunning, onToggle, onModeChange, theme, onEnterFocusMode }) => {
  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sc = Math.floor(s % 60);
    return `${m < 10 ? '0'+m : m}:${sc < 10 ? '0'+sc : sc}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md w-full max-w-md rounded-3xl p-8 shadow-xl mb-4 relative group">
      
      {/* Focus Mode Trigger */}
      <button 
        onClick={onEnterFocusMode}
        className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        title="Enter Focus Mode"
      >
        <Maximize2 className="w-5 h-5" />
      </button>

      <div className="flex justify-center gap-2 mb-8">
        {Object.keys(MODES).map(m => (
          <button 
            key={m} 
            onClick={() => onModeChange(m)}
            className={`px-4 py-1 rounded-full text-sm font-bold transition-all ${mode === m ? 'bg-black/20' : 'hover:bg-black/10'}`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>
      
      <div className="text-[6.5rem] font-bold text-center leading-none tracking-tight font-mono mb-8 tabular-nums">
        {fmt(time)}
      </div>

      <div className="flex justify-center items-center gap-4">
        <button 
          onClick={onToggle}
          className={`h-16 px-8 bg-white rounded-2xl text-2xl font-bold uppercase tracking-widest shadow-lg transform active:scale-95 transition-all ${theme.buttonColor} flex items-center gap-2`}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        {isRunning && (
          <button onClick={onToggle} className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors">
            <Pause className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TimerDisplay;