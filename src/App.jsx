import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { MemoryRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Calendar as CalendarIcon, PieChart, MoreHorizontal, PlusCircle } from 'lucide-react';

import Home from './pages/Home';
import Log from './pages/Log';
import Onboarding from './pages/Onboarding';
import LevelUpModal from './components/LevelUpModal';
import { hapticsMedium } from './utils/haptics';

const Stats = lazy(() => import('./pages/Stats'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Settings = lazy(() => import('./pages/Settings'));

const STORAGE_KEY = 'pixel-tennis-data-v1';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const BottomNav = ({ accentColor }) => {
  const location = useLocation();
  const menu = [
    { name: '홈', path: '/', icon: <HomeIcon size={20} /> },
    { name: '달력', path: '/calendar', icon: <CalendarIcon size={20} /> },
    { name: '기록', path: '/log', icon: <PlusCircle size={36} className="drop-shadow-md" style={{ color: accentColor }} /> },
    { name: '분석', path: '/stats', icon: <PieChart size={20} /> },
    { name: '더보기', path: '/settings', icon: <MoreHorizontal size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-md shadow-[0_-1px_4px_rgba(0,0,0,0.04)] flex justify-around py-3 pb-safe z-50">
      {menu.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`flex flex-col items-center text-[10px] transition-colors ${location.pathname === item.path ? 'font-bold' : 'text-[#B0B8C1]'}`}
          style={{ color: location.pathname === item.path ? accentColor : undefined }}
        >
          {item.icon}
          <span className="mt-1">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
};

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

export default function App() {
  const loadInitialData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return migrateData(JSON.parse(saved));
    }
    return {
      level: 1,
      exp: 0,
      stats: { forehand: 1, backhand: 1, serve: 1, volley: 1, footwork: 1, mental: 1 },
      logs: [],
      gearColor: '#2a9d8f',
      profileName: '',
      onboardingComplete: false,
    };
  };

  const [data, setData] = useState(loadInitialData);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const maxExp = 100;

  useEffect(() => {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, json);
      const usageMB = new Blob([json]).size / (1024 * 1024);
      setStorageWarning(usageMB > 4);
    } catch (e) {
      setStorageWarning(true);
    }
  }, [data]);

  const { level, exp, stats, logs, gearColor, profileName, onboardingComplete } = data;

  const setGearColor = useCallback((val) => {
    setData(prev => ({ ...prev, gearColor: typeof val === 'function' ? val(prev.gearColor) : val }));
    hapticsMedium();
  }, []);

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
        level: newLevel
      };
    });
    setEditingLog(null);
  }, []);

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
        stats: newStats
      };
    });
  }, []);

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
  }, []);

  const handleUpdateProfile = useCallback((name) => {
    setData(prev => ({ ...prev, profileName: name }));
  }, []);

  const handleImportData = useCallback((imported) => {
    setData(migrateData(imported));
  }, []);

  const handleResetData = useCallback(() => {
    setData({
      level: 1,
      exp: 0,
      stats: { forehand: 1, backhand: 1, serve: 1, volley: 1, footwork: 1, mental: 1 },
      logs: [],
      gearColor: '#2a9d8f',
      profileName: '',
      onboardingComplete: false,
    });
  }, []);

  if (!onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <MemoryRouter>
      <div className="min-h-screen bg-[#F4F4F4] font-sans text-[#191F28]">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={
              <Home level={level} exp={exp} maxExp={maxExp} stats={stats} gearColor={gearColor} profileName={profileName} logs={logs} storageWarning={storageWarning} />
            } />
            <Route path="/stats" element={<Stats stats={stats} logs={logs} gearColor={gearColor} />} />
            <Route path="/log" element={
              <Log
                onSave={handleSaveLog}
                editingLog={editingLog}
              />
            } />
            <Route path="/calendar" element={
              <Calendar
                logs={logs}
                onDeleteLog={handleDeleteLog}
                onEditLog={handleEditLog}
              />
            } />
            <Route path="/settings" element={
              <Settings
                data={data}
                onUpdateProfile={handleUpdateProfile}
                onImportData={handleImportData}
                onResetData={handleResetData}
                gearColor={gearColor}
                setGearColor={setGearColor}
                level={level}
                logs={logs}
                stats={stats}
              />
            } />
          </Routes>
        </Suspense>
        <BottomNav accentColor={gearColor} />
        {showLevelUp && <LevelUpModal level={level} onClose={() => setShowLevelUp(false)} />}
      </div>
    </MemoryRouter>
  );
}
