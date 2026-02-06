import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Calendar as CalendarIcon, PieChart, Shirt, PlusCircle } from 'lucide-react';

import Home from './pages/Home';
import Stats from './pages/Stats';
import Log from './pages/Log';
import Calendar from './pages/Calendar';
import Locker from './pages/Locker';

// --- 로컬 스토리지 저장 키 ---
const STORAGE_KEY = 'pixel-tennis-data-v1';

// 하단 네비게이션
const BottomNav = ({ accentColor }) => {
  const location = useLocation();
  const menu = [
    { name: '홈', path: '/', icon: <HomeIcon size={20} /> },
    { name: '달력', path: '/calendar', icon: <CalendarIcon size={20} /> },
    { name: '기록', path: '/log', icon: <PlusCircle size={36} className="drop-shadow-md" style={{ color: accentColor }} /> },
    { name: '분석', path: '/stats', icon: <PieChart size={20} /> },
    { name: '락커', path: '/locker', icon: <Shirt size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around py-3 pb-safe z-50">
      {menu.map((item) => (
        <Link 
          key={item.name} 
          to={item.path} 
          className={`flex flex-col items-center text-[10px] transition-colors ${location.pathname === item.path ? 'font-bold' : 'text-gray-400'}`}
          style={{ color: location.pathname === item.path ? accentColor : undefined }}
        >
          {item.icon}
          <span className="mt-1">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
};

export default function App() {
  // [1] 초기 데이터 로드 (저장된 게 있으면 불러오고, 없으면 기본값)
  const loadInitialData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      level: 1,
      exp: 0,
      stats: { forehand: 1, backhand: 1, serve: 1, volley: 1, footwork: 1, mental: 1 },
      logs: [],
      gearColor: '#2a9d8f'
    };
  };

  const [data, setData] = useState(loadInitialData);
  const maxExp = 100;

  // [2] 데이터 자동 저장 (데이터가 변할 때마다 폰에 저장)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // 편의를 위해 data 객체에서 분리 (사용하기 편하게)
  const { level, exp, stats, logs, gearColor } = data;

  // 상태 업데이트 헬퍼 함수들
  const setLevel = (val) => setData(prev => ({ ...prev, level: typeof val === 'function' ? val(prev.level) : val }));
  const setExp = (val) => setData(prev => ({ ...prev, exp: typeof val === 'function' ? val(prev.exp) : val }));
  const setStats = (val) => setData(prev => ({ ...prev, stats: typeof val === 'function' ? val(prev.stats) : val }));
  const setGearColor = (val) => setData(prev => ({ ...prev, gearColor: typeof val === 'function' ? val(prev.gearColor) : val }));
  
  const handleSaveLog = (logData, gainedStats) => {
    setData(prev => {
      // 1. 로그 추가
      const newLogs = [logData, ...prev.logs];
      
      // 2. 스탯 업데이트
      const newStats = {
        forehand: prev.stats.forehand + gainedStats.forehand,
        backhand: prev.stats.backhand + gainedStats.backhand,
        serve: prev.stats.serve + gainedStats.serve,
        volley: prev.stats.volley + gainedStats.volley,
        footwork: prev.stats.footwork + gainedStats.footwork,
        mental: prev.stats.mental + gainedStats.mental,
      };

      // 3. 경험치 및 레벨업
      const gainedExp = Math.floor(logData.duration / 2);
      let newExp = prev.exp + gainedExp;
      let newLevel = prev.level;
      
      if (newExp >= maxExp) {
        newExp = newExp - maxExp;
        newLevel += 1;
        alert("🎉 레벨업! 캐릭터가 성장했습니다!");
      }

      return {
        ...prev,
        logs: newLogs,
        stats: newStats,
        exp: newExp,
        level: newLevel
      };
    });
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f6f8f6] font-sans text-gray-800">
        <Routes>
          <Route path="/" element={<Home level={level} exp={exp} maxExp={maxExp} stats={stats} gearColor={gearColor} />} />
          <Route path="/stats" element={<Stats stats={stats} />} />
          <Route path="/log" element={<Log onSave={handleSaveLog} />} />
          <Route path="/calendar" element={<Calendar logs={logs} />} />
          <Route path="/locker" element={<Locker gearColor={gearColor} setGearColor={setGearColor} level={level} />} />
        </Routes>
        <BottomNav accentColor={gearColor} />
      </div>
    </BrowserRouter>
  );
}