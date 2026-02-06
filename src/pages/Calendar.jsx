import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar({ logs }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // 로그 데이터가 배열인지 확인 (안전장치)
  const safeLogs = Array.isArray(logs) ? logs : [];
  
  const getLogsForDate = (dateStr) => safeLogs.filter(log => log.date === dateStr);
  const selectedLogs = getLogsForDate(selectedDate);
  const formatDateStr = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return (
    <div className="bg-[#f6f8f6] min-h-screen pb-24 font-sans text-slate-900">
      
      {/* 헤더 & 컨트롤 */}
      <div className="flex items-center justify-between p-4 border-b border-[#3b5441] bg-white">
        <h2 className="text-lg font-bold tracking-widest uppercase flex-1 text-center">PIXEL HISTORY</h2>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="hover:text-primary transition-colors"><ChevronLeft /></button>
          <p className="text-lg font-bold uppercase tracking-tighter">
            {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </p>
          <button onClick={handleNextMonth} className="hover:text-primary transition-colors"><ChevronRight /></button>
        </div>

        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-1 w-full mb-6">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-[#9db9a4] text-[11px] font-bold h-8 flex items-center justify-center">{d}</div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="h-12"></div>)}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDateStr(day);
            const dayLogs = getLogsForDate(dateStr);
            const hasLog = dayLogs.length > 0;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-12 w-full text-sm font-medium flex flex-col items-center justify-center border transition-all relative
                  ${isSelected ? 'bg-primary/10 ring-2 ring-primary border-transparent z-10' : 'border-[#3b5441]/10 bg-white hover:bg-gray-50'}
                `}
              >
                <span className={isSelected || hasLog ? 'font-bold' : 'text-gray-400'}>{day}</span>
                {hasLog && (
                  <span className="material-symbols-outlined text-[14px] text-primary mt-1 animate-bounce">sports_tennis</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 상세 기록 (안전장치 적용됨) */}
      <div className="border-t border-[#3b5441] bg-white min-h-[300px]">
        <div className="bg-primary/5 border-b border-[#3b5441] px-4 py-3">
          <h3 className="text-sm font-bold tracking-widest uppercase italic">DAILY LOG - {selectedDate}</h3>
        </div>

        {selectedLogs.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">기록된 운동이 없습니다.</div>
        ) : (
          selectedLogs.map((log, idx) => {
            // ▼▼▼ 여기가 핵심! 데이터가 없어도 에러 안 나게 처리 ▼▼▼
            const details = log.details || {}; 
            const tags = details.tags || [];
            const scores = details.scores || [];
            const games = details.games || [];
            // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

            return (
              <div key={idx} className="animate-fade-in border-b border-[#3b5441]/10 pb-6 last:border-0">
                <div className="flex items-center gap-4 px-4 py-4">
                  <div className="flex items-center justify-center rounded bg-slate-100 w-14 h-14 border border-[#3b5441] shrink-0">
                    <span className="text-3xl">{log.type === 'game' ? '⚔️' : log.type === 'lesson' ? '🎓' : '🔥'}</span>
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <p className="text-base font-bold uppercase tracking-tight">
                      {log.type === 'game' ? 'Match Play' : log.type === 'lesson' ? 'Tennis Lesson' : 'Practice'}
                    </p>
                    <p className="text-xs text-gray-500 font-medium truncate">
                      {/* 안전하게 데이터 표시 */}
                      {log.type === 'game' 
                        ? (details.matchCount ? `${details.matchCount} Game(s)` : '기록 없음') 
                        : (tags.length > 0 ? tags.join(', ') : '기본 훈련')}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-primary text-white text-[10px] font-black uppercase rounded-sm">
                    {log.duration} MIN
                  </span>
                </div>

                {/* 정보 카드 */}
                <div className="flex gap-4 px-4 mb-4">
                  <div className="flex-1 flex flex-col gap-1 rounded p-3 border border-[#3b5441] bg-white">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Duration</p>
                    <p className="text-xl font-black italic">{log.duration} MINS</p>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 rounded p-3 border border-[#3b5441] bg-white">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                      {log.type === 'game' ? 'Result' : 'Focus'}
                    </p>
                    <p className="text-sm font-bold truncate">
                       {/* 게임 결과 요약 또는 태그 수 표시 */}
                       {log.type === 'game' 
                         ? (games.length > 0 ? `${games[0].myScore}:${games[0].oppScore} (${games[0].result})` : '결과 없음')
                         : `${tags.length} Skills`}
                    </p>
                  </div>
                </div>

                {/* 메모 & 사진 */}
                <div className="px-4 space-y-3">
                  {log.note && (
                    <div className="p-3 rounded border border-[#3b5441] bg-slate-50">
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Notes</p>
                      <p className="text-sm italic text-gray-700">"{log.note}"</p>
                    </div>
                  )}
                  {log.photo && (
                    <div className="rounded border border-[#3b5441] overflow-hidden">
                      <img src={log.photo} alt="Session" className="w-full h-48 object-cover" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}