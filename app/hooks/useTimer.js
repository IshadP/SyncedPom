import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_MODES = {
  pomodoro: { label: 'Pomodoro', time: 25 * 60 },
  short: { label: 'Short Break', time: 5 * 60 },
  long: { label: 'Long Break', time: 15 * 60 },
};

export const useTimer = (backend, onComplete) => {
  // 1. Settings State
  // Initialize from localStorage if available, otherwise use defaults
  const [localSettings, setLocalSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomo_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved settings:", e);
        }
      }
    }
    return DEFAULT_MODES;
  });

  const modes = backend.sessionData?.settings || localSettings;

  const [localMode, setLocalMode] = useState('pomodoro');
  // Initialize localTime based on the current mode's time setting
  const [localTime, setLocalTime] = useState(() => modes['pomodoro'].time);
  const [localIsRunning, setLocalIsRunning] = useState(false);
  const audioRef = useRef(null);

  const isSynced = !!backend.sessionId;
  const currentMode = backend.sessionData?.mode || localMode;

  // Calculate Time Left
  const calculateTimeLeft = useCallback(() => {
    if (isSynced && backend.sessionData) {
      const data = backend.sessionData;
      if (data.status === 'running' && data.end_time) {
        const end = new Date(data.end_time).getTime();
        const now = new Date().getTime();
        return Math.max(0, Math.floor((end - now) / 1000));
      }
      return data.remaining;
    }
    return localTime;
  }, [isSynced, backend.sessionData, localTime]);

  // Initialize display time
  const [displayTime, setDisplayTime] = useState(() => {
    if (isSynced && backend.sessionData) {
      // Use the helper logic directly here for initialization if needed, 
      // or rely on the effect to sync it up immediately after.
      // For safer initialization during SSR/hydration, calculateTimeLeft is safer.
      // calculateTimeLeft depends on props/state so we can't call it directly in useState initializer cleanly without wrapper
      // But we can replicate the logic simply or default to localTime.
      return localTime; 
    }
    return localTime;
  });

  const isRunning = isSynced ? backend.sessionData?.status === 'running' : localIsRunning;

  // --- EFFECT 1: SYNC WITH BACKEND ---
  // Only runs when backend data changes.
  useEffect(() => {
    if (isSynced && backend.sessionData) {
      const getRemoteTime = (data) => {
        if (data.status === 'running' && data.end_time) {
          const end = new Date(data.end_time).getTime();
          const now = new Date().getTime();
          return Math.max(0, Math.floor((end - now) / 1000));
        }
        return data.remaining;
      };
      
      const newTime = getRemoteTime(backend.sessionData);
      setDisplayTime(prev => Math.abs(prev - newTime) > 1 ? newTime : prev);
    }
  }, [isSynced, backend.sessionData]);

  // --- EFFECT 2: SYNC WITH LOCAL SETTINGS ---
  // Only runs when NOT synced and local settings/mode change
  useEffect(() => {
    if (!isSynced) {
      if (!localIsRunning) {
         // If the settings for the current mode change, update the time
         // This handles both mode switching and updating the duration in settings
         const targetTime = modes[currentMode].time;
         setLocalTime(targetTime);
         setDisplayTime(targetTime);
      }
    }
  }, [isSynced, currentMode, modes, localIsRunning]);

  // --- EFFECT 3: TIMER TICK & LOCAL BACKUP ---
  useEffect(() => {
    let interval;
    if (isRunning && displayTime > 0) {
      interval = setInterval(() => {
        setDisplayTime((prev) => {
          if (prev <= 1) {
            // Timer Finished
            if (audioRef.current) audioRef.current.play().catch(() => {});
            if (onComplete) onComplete(isSynced);
            
            if (isSynced) {
              backend.updateSession({ status: 'paused', remaining: 0, end_time: null });
            } else {
              setLocalIsRunning(false);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (displayTime === 0 && isRunning) {
       if (!isSynced) setLocalIsRunning(false);
    }

    // Sync displayTime back to localTime for persistence during pauses/navigation
    if (Math.abs(displayTime - localTime) > 0) {
       setLocalTime(displayTime);
    }

    return () => clearInterval(interval);
  }, [isRunning, displayTime, isSynced, backend, onComplete, localTime]);

  // Actions
  const toggle = () => {
    if (isSynced) {
      if (isRunning) {
        backend.updateSession({ status: 'paused', remaining: displayTime, end_time: null });
      } else {
        const endTime = new Date(Date.now() + displayTime * 1000).toISOString();
        backend.updateSession({ status: 'running', end_time: endTime });
      }
    } else {
      setLocalIsRunning(!localIsRunning);
    }
  };

  const changeMode = (newMode) => {
    const newTime = modes[newMode].time;
    if (isSynced) {
      backend.updateSession({
        mode: newMode,
        status: 'paused',
        remaining: newTime,
        end_time: null
      });
    } else {
      setLocalMode(newMode);
      setLocalIsRunning(false);
      setLocalTime(newTime);
      setDisplayTime(newTime);
    }
  };

  const updateSettings = (newSettings) => {
    if (isSynced) {
        const currentModeSettings = newSettings[currentMode];
        backend.updateSession({
            settings: newSettings,
            remaining: currentModeSettings.time,
            status: 'paused',
            end_time: null
        });
    } else {
        setLocalSettings(newSettings);
        // Persist to local storage
        localStorage.setItem('pomo_settings', JSON.stringify(newSettings));
        
        // Reset timer immediately to reflect new settings
        setLocalTime(newSettings[localMode].time);
        setDisplayTime(newSettings[localMode].time);
        setLocalIsRunning(false);
    }
  };

  return {
    mode: currentMode,
    timeLeft: displayTime,
    isRunning,
    toggle,
    changeMode,
    audioRef,
    modes,
    updateSettings
  };
};