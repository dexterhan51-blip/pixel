import React, { useMemo } from 'react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import TrainingHeatmap from '../components/TrainingHeatmap';
import { aggregateByMonth } from '../utils/gameData';
import { useData } from '../contexts/DataContext';

export default function Stats() {
  const { stats, logs, gearColor } = useData();

  const radarData = useMemo(() => [
    { subject: '포핸드', A: stats.forehand, fullMark: 50 },
    { subject: '백핸드', A: stats.backhand, fullMark: 50 },
    { subject: '서브', A: stats.serve, fullMark: 50 },
    { subject: '발리', A: stats.volley, fullMark: 50 },
    { subject: '풋워크', A: stats.footwork, fullMark: 50 },
    { subject: '멘탈', A: stats.mental, fullMark: 50 },
  ], [stats]);

  const statLabels = {
    forehand: '포핸드', backhand: '백핸드', serve: '서브',
    volley: '발리', footwork: '풋워크', mental: '멘탈'
  };

  const allBase = Object.values(stats).every(v => v <= 1);

  const monthlyData = useMemo(() => aggregateByMonth(logs, 6), [logs]);

  const currentMonth = monthlyData[monthlyData.length - 1];
  const currentMonthHours = currentMonth ? (currentMonth.totalMinutes / 60).toFixed(1) : '0';
  const currentMonthCount = currentMonth ? currentMonth.count : 0;

  const safeLogs = Array.isArray(logs) ? logs : [];
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthLogs = safeLogs.filter(l => l.date && l.date.startsWith(currentYearMonth));
  const satisfactionLogs = thisMonthLogs.filter(l => l.satisfaction > 0);
  const avgSatisfaction = satisfactionLogs.length > 0
    ? (satisfactionLogs.reduce((sum, l) => sum + l.satisfaction, 0) / satisfactionLogs.length).toFixed(1)
    : null;

  const barData = useMemo(() => monthlyData.map(m => ({
    name: m.month,
    시간: parseFloat((m.totalMinutes / 60).toFixed(1)),
  })), [monthlyData]);

  return (
    <div className="px-5 pb-32 pt-8 max-w-md mx-auto">
      <h2 className="text-[22px] font-bold text-[#191F28] mb-6">나의 플레이 스타일</h2>

      <TrainingHeatmap logs={logs} gearColor={gearColor} />

      <div className="w-full h-80 bg-white rounded-[16px] shadow-card mb-4 flex flex-col items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#F4F4F4" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#191F28', fontSize: 12, fontWeight: 'bold' }} />
            <PolarRadiusAxis angle={30} domain={[0, 50]} tick={false} axisLine={false} />
            <Radar
              name="My Stats"
              dataKey="A"
              stroke={gearColor}
              strokeWidth={3}
              fill={gearColor}
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
        <span className="absolute bottom-4 text-xs text-[#B0B8C1]">
          {allBase ? '운동을 기록하면 스탯이 성장합니다' : '데이터가 쌓일수록 영역이 넓어집니다'}
        </span>
      </div>

      <div className="bg-white rounded-[16px] shadow-card p-5 mb-4">
        <p className="text-[#8B95A1] text-xs font-medium mb-3">이번 달 요약</p>
        <div className="flex items-baseline gap-4">
          <div>
            <span className="text-[#191F28] text-[28px] font-bold tracking-tight leading-none">{currentMonthHours}</span>
            <span className="text-[#8B95A1] text-sm font-medium ml-1">시간</span>
          </div>
          <span className="text-[#F4F4F4]">|</span>
          <div>
            <span className="text-[#191F28] text-[28px] font-bold tracking-tight leading-none">{currentMonthCount}</span>
            <span className="text-[#8B95A1] text-sm font-medium ml-1">회 운동</span>
          </div>
          {avgSatisfaction && (
            <>
              <span className="text-[#F4F4F4]">|</span>
              <div>
                <span className="text-[#191F28] text-[28px] font-bold tracking-tight leading-none">{avgSatisfaction}</span>
                <span className="text-[#8B95A1] text-sm font-medium ml-1">만족도</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[16px] shadow-card p-5 mb-4">
        <p className="text-[#191F28] text-base font-bold mb-1">최근 6개월 추이</p>
        <p className="text-[#B0B8C1] text-xs mb-4">월별 운동 시간 (시간)</p>
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F4" />
              <XAxis dataKey="name" tick={{ fill: '#8B95A1', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#B0B8C1', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: 12 }}
                formatter={(value) => [`${value}시간`, '운동 시간']}
              />
              <Bar dataKey="시간" fill={gearColor} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white p-4 rounded-[16px] shadow-card flex justify-between items-center">
            <span className="text-sm font-medium text-[#8B95A1]">{statLabels[key] || key}</span>
            <span className="text-xl font-bold text-[#191F28]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
