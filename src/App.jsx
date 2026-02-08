import React, { Suspense, lazy } from 'react';
import { MemoryRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Calendar as CalendarIcon, PieChart, MoreHorizontal, PlusCircle } from 'lucide-react';

import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';

import Home from './pages/Home';
import Log from './pages/Log';
import Onboarding from './pages/Onboarding';
import LevelUpModal from './components/LevelUpModal';

const Stats = lazy(() => import('./pages/Stats'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Settings = lazy(() => import('./pages/Settings'));
const Friends = lazy(() => import('./pages/Friends'));
const FriendActivity = lazy(() => import('./pages/FriendActivity'));

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

export default function App() {
  const { isLoading: authLoading } = useAuth();
  const {
    gearColor,
    onboardingComplete,
    showLevelUp,
    setShowLevelUp,
    level,
    handleOnboardingComplete,
  } = useData();

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show onboarding if not complete
  if (!onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <MemoryRouter>
      <div className="min-h-screen bg-[#F4F4F4] font-sans text-[#191F28]">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/log" element={<Log />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/friend-activity/:friendId" element={<FriendActivity />} />
          </Routes>
        </Suspense>
        <BottomNav accentColor={gearColor} />
        {showLevelUp && <LevelUpModal level={level} onClose={() => setShowLevelUp(false)} />}
      </div>
    </MemoryRouter>
  );
}
