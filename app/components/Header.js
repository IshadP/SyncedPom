import React, { useState } from 'react';
import { CheckCircle, Users, Plus, Copy, LogOut } from 'lucide-react';

const Header = ({ sessionCode, onCreate, onJoin, onLeave }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    // 1. Try modern clipboard API first (requires HTTPS)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sessionCode)
        .then(triggerCopySuccess)
        .catch(fallbackCopy);
    } else {
      // 2. Fallback for http://localhost or restricted environments
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = sessionCode;
      
      // Place it in the DOM but make it invisible
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      if (successful) triggerCopySuccess();
      
      document.body.removeChild(textArea);
    } catch (err) {
      console.error('Unable to copy', err);
    }
  };

  const triggerCopySuccess = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="w-full max-w-2xl mx-auto p-4 flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4" />
        </div>
        <h1 className="text-xl font-bold">PomoSync</h1>
      </div>

      <div className="flex gap-2">
        {sessionCode ? (
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg animate-in fade-in">
            <span className="text-sm font-mono font-bold tracking-wider">{sessionCode}</span>
            <button onClick={copyCode} className="p-1 hover:bg-white/20 rounded relative">
              <Copy className="w-4 h-4" />
              {copied && <div className="absolute top-full right-0 mt-2 bg-black text-white text-xs py-1 px-2 rounded">Copied</div>}
            </button>
            <button onClick={onLeave} className="p-1 hover:bg-white/20 rounded text-red-200 hover:text-red-100">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <button onClick={onJoin} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors">
              <Users className="w-4 h-4" /> Join
            </button>
            <button onClick={onCreate} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Party
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;