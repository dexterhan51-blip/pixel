import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import NotificationBell from '../components/NotificationBell';
import { getLevelTitle, calculateStreak } from '../utils/gameData';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { level, exp, maxExp, stats, gearColor, profileName, logs, storageWarning } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const expPercent = Math.floor((exp / maxExp) * 100);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후예요' : '좋은 저녁이에요';

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const safeLogs = Array.isArray(logs) ? logs : [];
  const weeklyMinutes = safeLogs
    .filter(log => new Date(log.date) >= startOfWeek)
    .reduce((sum, log) => sum + (log.duration || 0), 0);
  const weeklyHours = (weeklyMinutes / 60).toFixed(1);
  const weeklyCount = safeLogs.filter(log => new Date(log.date) >= startOfWeek).length;

  const hasLogs = safeLogs.length > 0;

  const streak = calculateStreak(safeLogs);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekTrainedDays = new Set();
  safeLogs.forEach(log => {
    const logDate = new Date(log.date);
    if (logDate >= startOfWeek) {
      weekTrainedDays.add(logDate.getDay());
    }
  });

  const statItems = [
    { label: '포핸드', value: stats.forehand },
    { label: '백핸드', value: stats.backhand },
    { label: '서브', value: stats.serve },
    { label: '발리', value: stats.volley },
    { label: '풋워크', value: stats.footwork },
    { label: '멘탈', value: stats.mental },
  ];

  return (
    <div className="pt-safe pb-32 px-5 max-w-md mx-auto animate-fade-in font-sans">

      {storageWarning && (
        <div className="mt-4 bg-amber-50 rounded-[16px] shadow-card p-4 flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-bold text-amber-800">저장 공간이 거의 찼습니다</p>
            <p className="text-xs text-amber-600 mt-1">설정에서 데이터를 백업한 후 오래된 사진이 포함된 기록을 정리해주세요.</p>
          </div>
        </div>
      )}

      {/* Greeting + Notification + Settings */}
      <div className="flex items-center justify-between mt-8 mb-6">
        <div>
          <p className="text-[#8B95A1] text-sm font-medium">{greeting}</p>
          <p className="text-[#191F28] text-[22px] font-bold tracking-tight mt-0.5">{profileName || '플레이어'}님</p>
        </div>
        <div className="flex items-center gap-2">
          {user && <NotificationBell />}
          <button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center">
            <Settings size={18} className="text-[#8B95A1]" />
          </button>
        </div>
      </div>

      {/* Level Progress Card */}
      <div className="bg-white rounded-[16px] shadow-card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#191F28] text-lg font-bold">Lv.{level}</span>
            <span className="text-[#8B95A1] text-sm font-medium">{getLevelTitle(level)}</span>
          </div>
          <span className="text-primary text-sm font-bold">{expPercent}%</span>
        </div>
        <div className="h-[6px] w-full bg-[#F4F4F4] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${expPercent}%`, backgroundColor: gearColor }}
          />
        </div>
        <p className="text-[#B0B8C1] text-xs mt-2">다음 레벨까지 {100 - expPercent}% 남음</p>
      </div>

      {/* Streak Card */}
      {hasLogs && (
        <div className="bg-white rounded-[16px] shadow-card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <span className="text-[#191F28] text-base font-bold">
                {streak.current > 0 ? `${streak.current}일 연속 훈련 중!` : '오늘 훈련을 시작해보세요'}
              </span>
            </div>
          </div>
          <div className="flex gap-1 mb-3">
            {weekDays.map((day, idx) => {
              const trained = weekTrainedDays.has(idx);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full h-[6px] rounded-full transition-all ${trained ? '' : 'bg-[#F4F4F4]'}`}
                    style={trained ? { backgroundColor: gearColor } : undefined}
                  />
                  <span className={`text-[10px] font-medium ${trained ? 'text-[#191F28]' : 'text-[#B0B8C1]'}`}>{day}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8B95A1] text-xs">이번 주 {streak.thisWeek}/7</span>
            <span className="text-[#B0B8C1] text-xs">최장 기록: {streak.longest}일</span>
          </div>
        </div>
      )}

      {/* Weekly Summary Card */}
      {hasLogs ? (
        <div className="bg-white rounded-[16px] shadow-card p-5 mb-4">
          <p className="text-[#8B95A1] text-xs font-medium mb-3">이번 주 요약</p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-[#191F28] text-[36px] font-bold tracking-tight leading-none">{weeklyHours}</span>
            <span className="text-[#8B95A1] text-base font-medium">시간</span>
          </div>
          <p className="text-[#8B95A1] text-sm">{weeklyCount}회 운동</p>
        </div>
      ) : (
        <EmptyState
          title="첫 기록을 남겨보세요"
          description="운동을 기록하면 여기에 주간 요약이 표시됩니다."
        />
      )}

      {/* Stats Grid 2x3 */}
      <div className="grid grid-cols-3 gap-3">
        {statItems.map((item) => (
          <div key={item.label} className="bg-white rounded-[16px] shadow-card p-4 text-center">
            <p className="text-[#8B95A1] text-xs font-medium mb-1">{item.label}</p>
            <p className="text-[#191F28] text-xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
