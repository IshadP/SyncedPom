import { useState, useEffect, useRef, useCallback } from 'react';

const MODES = {
  pomodoro: { label: 'Pomodoro', time: 25 * 60 },
  short: { label: 'Short Break', time: 5 * 60 },
  long: { label: 'Long Break', time: 15 * 60 },
};

/**
 * Handles Timer Logic.
 * Agnostic of UI, purely handles time calculations and state management.
 */
export const useTimer = (backend, onComplete) => {
  const [localMode, setLocalMode] = useState('pomodoro');
  const [localTime, setLocalTime] = useState(MODES.pomodoro.time);
  const [localIsRunning, setLocalIsRunning] = useState(false);
  const audioRef = useRef(null);

  // Determine source of truth (Remote vs Local)
  const isSynced = !!backend.sessionId;
  // If synced, trust the session mode, otherwise use local
  const mode = backend.sessionData?.mode || localMode;

  // Calculate current time based on backend state or local state
  const calculateTimeLeft = useCallback(() => {
    if (isSynced && backend.sessionData) {
      const data = backend.sessionData;
      // If the timer is running remotely, calculate remaining time based on the target end_time
      if (data.status === 'running' && data.end_time) {
        const end = new Date(data.end_time).getTime();
        const now = new Date().getTime();
        return Math.max(0, Math.floor((end - now) / 1000));
      }
      // Otherwise, just show the stored remaining time
      return data.remaining;
    }
    return localTime;
  }, [isSynced, backend.sessionData, localTime]);

  const [displayTime, setDisplayTime] = useState(calculateTimeLeft());
  
  const isRunning = isSynced 
    ? backend.sessionData?.status === 'running' 
    : localIsRunning;

  // --- EFFECT 1: SYNC STATE ---
  // Only update displayTime when the calculated source changes (e.g. mode change, backend update)
  useEffect(() => {
    setDisplayTime(calculateTimeLeft());
  }, [calculateTimeLeft]);

  // --- EFFECT 2: TIMER TICK ---
  // Handles the countdown interval separately to avoid infinite loops
  useEffect(() => {
    let interval;
    if (isRunning && displayTime > 0) {
      interval = setInterval(() => {
        setDisplayTime((prev) => {
          if (prev <= 1) {
            // Timer Finished
            if (audioRef.current) audioRef.current.play().catch(() => {});
            
            // Trigger completion callback
            if (onComplete) onComplete(isSynced);
            
            if (isSynced) {
              // Pause session and reset to 0
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
       // Safety stop if we hit 0
       if (!isSynced) setLocalIsRunning(false);
    }

    // Update localTime reference while running so if we disconnect/leave, 
    // we don't jump back to the time before we joined.
    // We check for > 1 second difference to avoid unnecessary state updates on every tick
    if (displayTime > 0 && Math.abs(displayTime - localTime) > 1) {
       setLocalTime(displayTime);
    }

    return () => clearInterval(interval);
  }, [isRunning, displayTime, isSynced, backend, onComplete, localTime]);

  // User Actions
  const toggle = () => {
    if (isSynced) {
      if (isRunning) {
        // Pause: Save current remaining time
        backend.updateSession({
          status: 'paused',
          remaining: displayTime,
          end_time: null
        });
      } else {
        // Start: Calculate end time
        const endTime = new Date(Date.now() + displayTime * 1000).toISOString();
        backend.updateSession({
          status: 'running',
          end_time: endTime
        });
      }
    } else {
      setLocalIsRunning(!localIsRunning);
    }
  };

  const changeMode = (newMode) => {
    const newTime = MODES[newMode].time;
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

  return {
    mode,
    timeLeft: displayTime,
    isRunning,
    toggle,
    changeMode,
    audioRef
  };
};