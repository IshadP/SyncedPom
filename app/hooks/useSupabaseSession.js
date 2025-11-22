import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Default settings to use if none provided
const DEFAULT_SETTINGS = {
  pomodoro: { label: 'Pomodoro', time: 25 * 60 },
  short: { label: 'Short Break', time: 5 * 60 },
  long: { label: 'Long Break', time: 15 * 60 },
};

export const useSupabaseSession = () => {
  const [sessionId, setSessionId] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);
  const [userId] = useState(() => 'user-' + Math.random().toString(36).substr(2, 9));

  // Subscribe to changes
  useEffect(() => {
    if (!sessionId || !supabase) return;

    const fetchSession = async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId);
      
      if (error) setError(error.message);
      else if (data && data.length > 0) setSessionData(data[0]);
    };

    fetchSession();

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          setSessionData(payload.new);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('Connected to Supabase Realtime');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Actions

  // Now accepts a settings object
  const createSession = async (initialMode, initialTime, settings = DEFAULT_SETTINGS) => {
    const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newSession = {
      id: newId,
      host_id: userId,
      mode: initialMode,
      status: 'paused',
      remaining: initialTime,
      end_time: null,
      settings: settings, // Store the custom settings in the DB
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('sessions').insert([newSession]);
    
    if (error) {
      setError(error.message);
      return null;
    }
    
    setSessionId(newId);
    setSessionData(newSession);
    return newId;
  };

  const joinSession = async (code) => {
    const cleanId = code.trim().toUpperCase();
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', cleanId);

    if (error || !data || data.length === 0) {
      return false;
    }

    setSessionId(cleanId);
    setSessionData(data[0]);
    return true;
  };

  const updateSession = async (updates) => {
    if (!sessionId) return;
    await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId);
  };

  const leaveSession = () => {
    setSessionId(null);
    setSessionData(null);
  };

  return {
    userId,
    sessionId,
    sessionData,
    error,
    createSession,
    joinSession,
    updateSession,
    leaveSession,
    isHost: sessionData?.host_id === userId // Helper to check permissions
  };
};