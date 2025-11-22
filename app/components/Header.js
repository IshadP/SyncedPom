import React, { useState } from 'react';

const Header = ({ sessionCode, onCreate, onJoin, onLeave, onOpenSettings }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sessionCode)
        .then(triggerCopySuccess)
        .catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = sessionCode;
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
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-lg">check_circle</span>
        </div>
        <h1 className="text-xl font-bold">PomoSync</h1>
      </div>

      <div className="flex gap-2 items-center">
        {/* Settings Button - Always visible in header now */}
        <button 
            onClick={onOpenSettings}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg flex items-center justify-center transition-colors mr-1"
            title="Settings"
        >
            <span className="material-symbols-outlined text-white text-xl">settings</span>
        </button>

        {sessionCode ? (
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg animate-in fade-in">
            <span className="text-sm font-mono font-bold tracking-wider">{sessionCode}</span>
            <button onClick={copyCode} className="p-1 hover:bg-white/20 rounded relative flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">content_copy</span>
              {copied && <div className="absolute top-full right-0 mt-2 bg-black text-white text-xs py-1 px-2 rounded z-10">Copied</div>}
            </button>
            <button onClick={onLeave} className="p-1 hover:bg-white/20 rounded text-red-200 hover:text-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        ) : (
          <>
            <button onClick={onJoin} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-sm">group</span> 
              <span>Join</span>
            </button>
            <button onClick={onCreate} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Party</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;