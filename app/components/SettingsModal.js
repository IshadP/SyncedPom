import React, { useState, useEffect } from 'react';

const SettingsModal = ({ isOpen, onClose, currentSettings, onSave, isHost, isSolo }) => {
  const [localSettings, setLocalSettings] = useState(currentSettings);

  // Update local state when prop changes
  useEffect(() => {
    if (isOpen) {
        setLocalSettings(currentSettings);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleChange = (modeKey, e) => {
    const minutes = parseInt(e.target.value) || 0;
    setLocalSettings(prev => ({
      ...prev,
      [modeKey]: {
        ...prev[modeKey],
        time: minutes * 60 // convert back to seconds
      }
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(localSettings);
    onClose();
  };

  // Permission check: Can edit if Solo OR if Host of group
  const canEdit = isSolo || isHost;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] w-full max-w-sm rounded-xl shadow-2xl border border-white/10 p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined">settings</span>
          Timer Settings
        </h3>
        
        {!canEdit && (
            <div className="mb-4 p-3 bg-yellow-500/10 text-yellow-200 text-sm rounded border border-yellow-500/20">
                Only the host can change session timer settings.
            </div>
        )}

        <form onSubmit={handleSave}>
          <div className="space-y-4 mb-6">
            {Object.entries(localSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-gray-300 capitalize font-medium">{value.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    disabled={!canEdit}
                    value={Math.floor(value.time / 60)}
                    onChange={(e) => handleChange(key, e)}
                    className="w-20 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-right focus:outline-none focus:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-gray-500 text-sm w-8">min</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-2 text-gray-400 hover:text-white font-medium hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            {canEdit && (
                <button 
                type="submit" 
                className="flex-1 py-2 bg-[#ba4949] hover:bg-[#a13e3e] text-white font-bold rounded-lg transition-colors"
                >
                Save Changes
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;