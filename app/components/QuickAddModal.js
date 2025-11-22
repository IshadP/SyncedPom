import React, { useState, useEffect, useRef } from 'react';
import { Clock, CornerDownLeft } from 'lucide-react';

const QuickAddModal = ({ isOpen, onClose, onAdd }) => {
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState(0);
  const inputRef = useRef(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Parse input for "ns" pattern (e.g., "2s", "10s")
  useEffect(() => {
    const sessionMatch = input.match(/(?:^|\s)(\d+)s(?:\s|$)/);
    if (sessionMatch) {
      setSessions(parseInt(sessionMatch[1], 10));
    } else {
      setSessions(0);
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Clean title by removing the session command (optional, keeps title clean)
    const cleanTitle = input.replace(/(?:^|\s)(\d+)s(?:\s|$)/, ' ').trim();
    
    onAdd({
      title: cleanTitle || input, // Fallback to raw input if cleaning removes everything
      sessions: sessions
    });
    
    setInput('');
    setSessions(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]">
      <div className="bg-[#1e1e1e] w-full max-w-xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 border border-white/10">
        <form onSubmit={handleSubmit} className="p-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Task name (e.g. 'Read Chapter 1 2s')"
            className="w-full bg-transparent text-white text-lg placeholder:text-gray-500 focus:outline-none mb-4"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Session Badge */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                sessions > 0 
                  ? 'bg-blue-500/20 text-blue-300' 
                  : 'bg-white/5 text-gray-500'
              }`}>
                <Clock className="w-3 h-3" />
                <span>{sessions > 0 ? `${sessions} Sessions needed` : 'Sessions'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-3 py-1.5 text-sm text-gray-400 hover:bg-white/5 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!input.trim()}
                className="px-4 py-1.5 bg-[#ba4949] hover:bg-[#a13e3e] text-white text-sm font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                Add task
                <CornerDownLeft className="w-3 h-3 opacity-70" />
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Click backdrop to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default QuickAddModal;