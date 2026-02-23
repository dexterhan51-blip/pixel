import React, { Suspense, lazy } from 'react';
import { MemoryRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Calendar as CalendarIcon, PieChart, MoreHorizontal, PlusCircle } from 'lucide-react';

import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';

import Home from './pages/Home';
import Log from './pages/Log';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import LevelUpModal from './components/LevelUpModal';
import { isSupabaseConfigured } from './lib/supabase';

const Stats = lazy(() => import('./pages/Stats'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Settings = lazy(() => import('./pages/Settings'));
const Friends = lazy(() => import('./pages/Friends'));
const FriendActivity = lazy(() => import('./pages/FriendActivity'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

const LoadingFallback = () => (
  <div className="pt-safe pb-32 px-5 max-w-md mx-auto animate-pulse">
    {/* Header skeleton */}
    <div className="flex items-center justify-between mt-8 mb-6">
      <div>
        <div className="h-4 w-24 bg-[#E8E8E8] rounded mb-2" />
        <div className="h-6 w-32 bg-[#E8E8E8] rounded" />
      </div>
      <div className="w-10 h-10 rounded-full bg-[#E8E8E8]" />
    </div>
    {/* Card skeletons */}
    <div className="bg-white rounded-[16px] shadow-card p-5 mb-4">
      <div className="h-4 w-20 bg-[#E8E8E8] rounded mb-3" />
      <div className="h-[6px] w-full bg-[#E8E8E8] rounded-full" />
      <div className="h-3 w-36 bg-[#E8E8E8] rounded mt-2" />
    </div>
    <div className="bg-white rounded-[16px] shadow-card p-5 mb-4">
      <div className="h-3 w-16 bg-[#E8E8E8] rounded mb-3" />
      <div className="h-10 w-24 bg-[#E8E8E8] rounded mb-1" />
      <div className="h-3 w-20 bg-[#E8E8E8] rounded" />
    </div>
    <div className="grid grid-cols-3 gap-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-[16px] shadow-card p-4 flex flex-col items-center">
          <div className="h-3 w-10 bg-[#E8E8E8] rounded mb-2" />
          <div className="h-6 w-8 bg-[#E8E8E8] rounded" />
        </div>
      ))}
    </div>
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pointer-events-none"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      role="navigation"
      aria-label="하단 내비게이션"
    >
      <div className="max-w-md mx-auto h-14 flex items-center justify-around bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] pointer-events-auto">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-2 text-[10px] transition-colors ${isActive ? 'font-bold' : 'text-[#B0B8C1]'}`}
              style={{ color: isActive ? accentColor : undefined }}
            >
              {isActive && (
                <span
                  className="absolute top-0.5 w-1 h-1 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              )}
              {item.icon}
              <span className="mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default function App() {
  const { isLoading: authLoading, user } = useAuth();
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

  // New users: show login quiz before onboarding
  // Existing users (onboardingComplete): skip gate, they can log in from Settings
  if (!user && isSupabaseConfigured && !onboardingComplete) {
    return <Login />;
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
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </Suspense>
        <BottomNav accentColor={gearColor} />
        {showLevelUp && <LevelUpModal level={level} onClose={() => setShowLevelUp(false)} />}
      </div>
    </MemoryRouter>
  );
}
