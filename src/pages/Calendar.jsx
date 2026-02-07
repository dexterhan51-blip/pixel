import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';

const TYPE_COLORS = {
  lesson: '#2a9d8f',
  game: '#e76f51',
  practice: '#3b82f6'
};

const TYPE_LABELS = {
  lesson: '레슨',
  game: '경기',
  practice: '개인 연습'
};

export default function Calendar({ logs, onDeleteLog, onEditLog }) {
  const navigate = useNavigate();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const safeLogs = Array.isArray(logs) ? logs : [];
  const getLogsForDate = (dateStr) => safeLogs.filter(log => log.date === dateStr);
  const selectedLogs = getLogsForDate(selectedDate);
  const formatDateStr = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const handleDelete = (log) => {
    setDeleteTarget(log);
  };

  const confirmDelete = () => {
    if (deleteTarget && onDeleteLog) {
      onDeleteLog(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  return (
    <div className="bg-[#F4F4F4] min-h-screen pb-32 font-sans">

      {/* Month Navigation */}
      <div className="bg-white shadow-card">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F4F4F4] transition-colors">
            <ChevronLeft size={20} className="text-[#191F28]" />
          </button>
          <p className="text-lg font-bold text-[#191F28]">
            {year}년 {monthNames[month]}
          </p>
          <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F4F4F4] transition-colors">
            <ChevronRight size={20} className="text-[#191F28]" />
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="grid grid-cols-7 gap-1 w-full mb-2">
            {['일','월','화','수','목','금','토'].map((d, i) => (
              <div key={i} className="text-[#B0B8C1] text-[11px] font-medium h-8 flex items-center justify-center">{d}</div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="h-11"></div>)}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDateStr(day);
              const dayLogs = getLogsForDate(dateStr);
              const hasLog = dayLogs.length > 0;
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-11 w-full text-sm font-medium flex flex-col items-center justify-center rounded-full transition-all relative
                    ${isSelected ? 'bg-primary text-white' : isToday ? 'text-primary font-bold' : 'text-[#191F28] hover:bg-[#F4F4F4]'}
                  `}
                >
                  <span>{day}</span>
                  {hasLog && !isSelected && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {dayLogs.slice(0, 3).map((log, idx) => (
                        <div
                          key={idx}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: TYPE_COLORS[log.type] || '#2a9d8f' }}
                        />
                      ))}
                    </div>
                  )}
                  {hasLog && isSelected && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {dayLogs.slice(0, 3).map((_, idx) => (
                        <div key={idx} className="w-1 h-1 rounded-full bg-white/70" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Log */}
      <div className="px-5 pt-4">
        <p className="text-[#8B95A1] text-xs font-medium mb-3">{selectedDate}</p>

        {selectedLogs.length === 0 ? (
          <EmptyState
            title="기록이 없습니다"
            description="이 날의 운동을 기록해보세요."
            showCTA={false}
          />
        ) : (
          <div className="space-y-3">
            {selectedLogs.map((log) => {
              const details = log.details || {};
              const tags = details.tags || [];
              const games = details.games || [];

              return (
                <div key={log.id || log.date + log.type} className="animate-fade-in bg-white rounded-[16px] shadow-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: TYPE_COLORS[log.type] || '#2a9d8f' }}
                      />
                      <span className="text-[#191F28] text-sm font-bold">
                        {TYPE_LABELS[log.type] || log.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {onEditLog && log.id && (
                        <button onClick={() => { onEditLog(log); navigate('/log'); }} className="p-1.5 rounded-full hover:bg-[#F4F4F4] text-[#B0B8C1]">
                          <Pencil size={14} />
                        </button>
                      )}
                      {onDeleteLog && log.id && (
                        <button onClick={() => handleDelete(log)} className="p-1.5 rounded-full hover:bg-red-50 text-[#B0B8C1] hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-[#8B95A1]">
                    <span>{log.duration}분</span>
                    {log.satisfaction > 0 && (
                      <>
                        <span className="text-[#F4F4F4]">|</span>
                        <span>{['😫','😕','😐','🙂','😆'][log.satisfaction - 1]}</span>
                      </>
                    )}
                    <span className="text-[#F4F4F4]">|</span>
                    {log.type === 'game'
                      ? <span>{games.length > 0 ? `${games[0].myScore}:${games[0].oppScore} (${games[0].result === 'win' ? '승' : '패'})` : '결과 없음'}</span>
                      : <span>{tags.length > 0 ? tags.join(', ') : '기본 훈련'}</span>
                    }
                  </div>

                  {log.note && (
                    <p className="text-[#8B95A1] text-xs mt-2 italic">"{log.note}"</p>
                  )}

                  {log.photo && (
                    <div className="mt-3 rounded-[12px] overflow-hidden">
                      <img src={log.photo} alt="Session" className="w-full h-40 object-cover" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="기록 삭제"
          message="이 기록을 삭제하면 해당 스탯 포인트도 함께 차감됩니다."
          confirmLabel="삭제"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}
    </div>
  );
}
