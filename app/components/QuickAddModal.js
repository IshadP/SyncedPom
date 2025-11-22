import React, { useState, useEffect, useRef } from 'react';

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

    const cleanTitle = input.replace(/(?:^|\s)(\d+)s(?:\s|$)/, ' ').trim();
    
    onAdd({
      title: cleanTitle || input,
      sessions: sessions
    });
    
    setInput('');
    setSessions(0);
    onClose();
  };

  // Helper to render highlighted text
  const renderHighlightedInput = () => {
    const parts = input.split(/(\d+s)/g);
    
    return parts.map((part, index) => {
      if (/^\d+s$/.test(part)) {
        return <span key={index} className="text-[#ba4949] font-bold">{part}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]">
      <div className="bg-[#1e1e1e] w-full max-w-xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 border border-white/10">
        <form onSubmit={handleSubmit} className="p-4">
          
          {/* Highlighting Container */}
          <div className="relative w-full mb-4">
            <div 
              className="absolute inset-0 pointer-events-none whitespace-pre-wrap text-lg font-medium"
              aria-hidden="true"
            >
              <div className="text-white opacity-100">
                 {renderHighlightedInput()}
              </div>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Task name (e.g. 'Read Chapter 1 3s')"
              className="w-full bg-transparent text-transparent caret-white text-lg font-medium placeholder:text-gray-600 focus:outline-none relative z-10"
              spellCheck="false"
              autoComplete="off"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                sessions > 0 
                  ? 'bg-[#ba4949]/20 text-[#ba4949]' 
                  : 'bg-white/5 text-gray-500'
              }`}>
                <span className="material-symbols-outlined text-xs">schedule</span>
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
                <span className="material-symbols-outlined text-sm opacity-70">keyboard_return</span>
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default QuickAddModal;