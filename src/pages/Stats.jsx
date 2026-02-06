import React from 'react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export default function Stats({ stats }) {
  // 그래프용 데이터 변환
  const data = [
    { subject: '포핸드', A: stats.forehand, fullMark: 100 },
    { subject: '백핸드', A: stats.backhand, fullMark: 100 },
    { subject: '서브', A: stats.serve, fullMark: 100 },
    { subject: '발리', A: stats.volley, fullMark: 100 },
    { subject: '풋워크', A: stats.footwork, fullMark: 100 },
    { subject: '멘탈', A: stats.mental, fullMark: 100 },
  ];

  return (
    <div className="p-6 pb-24">
      <h2 className="text-2xl font-bold mb-6 text-tennis-dark">나의 플레이 스타일</h2>
      
      {/* 육각형 그래프 영역 */}
      <div className="w-full h-80 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
            <Radar
              name="My Stats"
              dataKey="A"
              stroke="#2a9d8f"
              strokeWidth={3}
              fill="#2a9d8f"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
        <span className="absolute bottom-4 text-xs text-gray-400">데이터가 쌓일수록 영역이 넓어집니다</span>
      </div>

      {/* 텍스트 수치 */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500 capitalize">{key}</span>
            <span className="text-lg font-bold text-tennis-dark">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}