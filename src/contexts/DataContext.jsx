import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const DataContext = createContext(null);

const STORAGE_KEY = 'pixel-tennis-data-v1';
const SYNC_QUEUE_KEY = 'pixel-tennis-sync-queue';

function migrateData(data) {
  if (data.logs) {
    data.logs = data.logs.map(log => {
      if (!log.id) {
        return { ...log, id: crypto.randomUUID() };
      }
      return log;
    });
  }
  if (!data.profileName) {
    data.profileName = '';
  }
  if (data.onboardingComplete === undefined) {
    data.onboardingComplete = false;
  }
  return data;
}

function getDefaultData() {
  return {
    level: 1,
    exp: 0,
    stats: { forehand: 1, backhand: 1, serve: 1, volley: 1, footwork: 1, mental: 1 },
    logs: [],
    gearColor: '#2a9d8f',
    profileName: '',
    onboardingComplete: false,
  };
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return migrateData(JSON.parse(saved));
  }
  return getDefaultData();
}

export function DataProvider({ children }) {
  const { user, profile } = useAuth();
  const [data, setData] = useState(loadFromLocalStorage);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncQueueRef = useRef([]);
  const maxExp = 100;

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      flushSyncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load sync queue from localStorage
  useEffect(() => {
    try {
      const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
      syncQueueRef.current = queue;
    } catch {
      syncQueueRef.current = [];
    }
  }, []);

  // Persist data to localStorage
  useEffect(() => {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, json);
      const usageMB = new Blob([json]).size / (1024 * 1024);
      setStorageWarning(usageMB > 4);
    } catch {
      setStorageWarning(true);
    }
  }, [data]);

  // Sync profile data from Supabase when user is logged in
  useEffect(() => {
    if (user && profile) {
      setData(prev => ({
        ...prev,
        profileName: profile.profile_name || prev.profileName,
        gearColor: profile.gear_color || prev.gearColor,
      }));
    }
  }, [user, profile]);

  // Background sync: fetch logs from Supabase when user logs in
  useEffect(() => {
    if (!user) return;

    const fetchRemoteLogs = async () => {
      try {
        const { data: remoteLogs, error } = await supabase
          .from('training_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) {
          console.error('Fetch remote logs error:', error);
          return;
        }

        if (remoteLogs && remoteLogs.length > 0) {
          const transformedLogs = remoteLogs.map(rl => ({
            id: rl.id,
            date: rl.date,
            type: rl.type,
            duration: rl.duration,
            satisfaction: rl.satisfaction || 0,
            note: rl.note || '',
            photo: rl.photo_url || null,
            gainedStats: rl.gained_stats || {},
            details: rl.details || {},
          }));

          setData(prev => {
            // Merge: remote logs take priority (by ID)
            const localLogMap = new Map(prev.logs.map(l => [l.id, l]));
            transformedLogs.forEach(rl => localLogMap.set(rl.id, rl));
            const mergedLogs = [...localLogMap.values()].sort(
              (a, b) => b.date.localeCompare(a.date)
            );
            return { ...prev, logs: mergedLogs };
          });
        }
      } catch (err) {
        console.error('Fetch remote logs exception:', err);
      }
    };

    fetchRemoteLogs();
  }, [user]);

  // Add operation to sync queue
  const addToSyncQueue = useCallback((operation) => {
    syncQueueRef.current.push(operation);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueueRef.current));
  }, []);

  // Flush sync queue to Supabase
  const flushSyncQueue = useCallback(async () => {
    if (!user || syncQueueRef.current.length === 0) return;
    setIsSyncing(true);

    const queue = [...syncQueueRef.current];
    const failed = [];

    for (const op of queue) {
      try {
        if (op.type === 'INSERT_LOG' || op.type === 'UPDATE_LOG') {
          const { error } = await supabase
            .from('training_logs')
            .upsert({
              id: op.data.id,
              user_id: user.id,
              date: op.data.date,
              type: op.data.type,
              duration: op.data.duration,
              satisfaction: op.data.satisfaction || 0,
              note: op.data.note || '',
              photo_url: op.data.photo_url || null,
              gained_stats: op.data.gainedStats || {},
              details: op.data.details || {},
              updated_at: new Date().toISOString(),
            });
          if (error) {
            console.error('Sync upsert error:', error);
            failed.push(op);
          }
        } else if (op.type === 'DELETE_LOG') {
          const { error } = await supabase
            .from('training_logs')
            .delete()
            .eq('id', op.data.id)
            .eq('user_id', user.id);
          if (error) {
            console.error('Sync delete error:', error);
            failed.push(op);
          }
        } else if (op.type === 'UPDATE_PROFILE') {
          const { error } = await supabase
            .from('profiles')
            .update({ ...op.data, updated_at: new Date().toISOString() })
            .eq('id', user.id);
          if (error) {
            console.error('Sync profile update error:', error);
            failed.push(op);
          }
        }
      } catch {
        failed.push(op);
      }
    }

    syncQueueRef.current = failed;
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(failed));
    setIsSyncing(false);
  }, [user]);

  // Sync a log to Supabase (immediate, background)
  const syncLogToSupabase = useCallback(async (logData, action = 'INSERT_LOG') => {
    if (!user) return;

    if (!isOnline) {
      addToSyncQueue({ type: action, data: logData });
      return;
    }

    try {
      if (action === 'DELETE_LOG') {
        const { error } = await supabase
          .from('training_logs')
          .delete()
          .eq('id', logData.id)
          .eq('user_id', user.id);
        if (error) {
          addToSyncQueue({ type: action, data: logData });
        }
      } else {
        const { error } = await supabase
          .from('training_logs')
          .upsert({
            id: logData.id,
            user_id: user.id,
            date: logData.date,
            type: logData.type,
            duration: logData.duration,
            satisfaction: logData.satisfaction || 0,
            note: logData.note || '',
            photo_url: logData.photo || null,
            gained_stats: logData.gainedStats || {},
            details: logData.details || {},
            updated_at: new Date().toISOString(),
          });
        if (error) {
          addToSyncQueue({ type: action, data: logData });
        }
      }
    } catch {
      addToSyncQueue({ type: action, data: logData });
    }
  }, [user, isOnline, addToSyncQueue]);

  const { level, exp, stats, logs, gearColor, profileName, onboardingComplete } = data;

  const setGearColor = useCallback((val) => {
    const newColor = typeof val === 'function' ? val(data.gearColor) : val;
    setData(prev => ({ ...prev, gearColor: newColor }));

    if (user) {
      addToSyncQueue({ type: 'UPDATE_PROFILE', data: { gear_color: newColor } });
      if (isOnline) flushSyncQueue();
    }
  }, [user, isOnline, addToSyncQueue, flushSyncQueue, data.gearColor]);

  const handleSaveLog = useCallback((logData, gainedStats) => {
    setData(prev => {
      let newLogs;
      const existingIndex = prev.logs.findIndex(l => l.id === logData.id);
      if (existingIndex >= 0) {
        const oldLog = prev.logs[existingIndex];
        const oldGained = oldLog.gainedStats || { forehand: 0, backhand: 0, serve: 0, volley: 0, footwork: 0, mental: 0 };
        newLogs = [...prev.logs];
        newLogs[existingIndex] = logData;

        const newStats = { ...prev.stats };
        Object.keys(newStats).forEach(key => {
          newStats[key] = newStats[key] - (oldGained[key] || 0) + (gainedStats[key] || 0);
        });

        return { ...prev, logs: newLogs, stats: newStats };
      }

      newLogs = [logData, ...prev.logs];

      const newStats = {
        forehand: prev.stats.forehand + gainedStats.forehand,
        backhand: prev.stats.backhand + gainedStats.backhand,
        serve: prev.stats.serve + gainedStats.serve,
        volley: prev.stats.volley + gainedStats.volley,
        footwork: prev.stats.footwork + gainedStats.footwork,
        mental: prev.stats.mental + gainedStats.mental,
      };

      const gainedExp = Math.floor(logData.duration / 2);
      let newExp = prev.exp + gainedExp;
      let newLevel = prev.level;

      while (newExp >= maxExp) {
        newExp -= maxExp;
        newLevel += 1;
      }

      if (newLevel > prev.level) {
        setTimeout(() => setShowLevelUp(true), 300);
      }

      return {
        ...prev,
        logs: newLogs,
        stats: newStats,
        exp: newExp,
        level: newLevel,
      };
    });

    // Sync to Supabase in background
    syncLogToSupabase(logData, 'INSERT_LOG');
    setEditingLog(null);
  }, [syncLogToSupabase]);

  const handleDeleteLog = useCallback((logId) => {
    setData(prev => {
      const log = prev.logs.find(l => l.id === logId);
      if (!log) return prev;

      const gained = log.gainedStats || { forehand: 0, backhand: 0, serve: 0, volley: 0, footwork: 0, mental: 0 };
      const newStats = { ...prev.stats };
      Object.keys(newStats).forEach(key => {
        newStats[key] = Math.max(1, newStats[key] - (gained[key] || 0));
      });

      return {
        ...prev,
        logs: prev.logs.filter(l => l.id !== logId),
        stats: newStats,
      };
    });

    // Sync deletion to Supabase
    syncLogToSupabase({ id: logId }, 'DELETE_LOG');
  }, [syncLogToSupabase]);

  const handleEditLog = useCallback((log) => {
    setEditingLog(log);
  }, []);

  const handleOnboardingComplete = useCallback((name, color) => {
    setData(prev => ({
      ...prev,
      profileName: name,
      gearColor: color,
      onboardingComplete: true,
    }));

    if (user) {
      addToSyncQueue({
        type: 'UPDATE_PROFILE',
        data: {
          profile_name: name,
          gear_color: color,
          onboarding_complete: true,
        },
      });
      if (isOnline) flushSyncQueue();
    }
  }, [user, isOnline, addToSyncQueue, flushSyncQueue]);

  const handleUpdateProfile = useCallback((name) => {
    setData(prev => ({ ...prev, profileName: name }));

    if (user) {
      addToSyncQueue({ type: 'UPDATE_PROFILE', data: { profile_name: name } });
      if (isOnline) flushSyncQueue();
    }
  }, [user, isOnline, addToSyncQueue, flushSyncQueue]);

  const handleImportData = useCallback((imported) => {
    setData(migrateData(imported));
  }, []);

  const handleResetData = useCallback(() => {
    setData(getDefaultData());
  }, []);

  const value = {
    data,
    level,
    exp,
    maxExp,
    stats,
    logs,
    gearColor,
    profileName,
    onboardingComplete,
    showLevelUp,
    setShowLevelUp,
    editingLog,
    setEditingLog,
    storageWarning,
    isOnline,
    isSyncing,
    setGearColor,
    handleSaveLog,
    handleDeleteLog,
    handleEditLog,
    handleOnboardingComplete,
    handleUpdateProfile,
    handleImportData,
    handleResetData,
    flushSyncQueue,
    syncLogToSupabase,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export default DataContext;
