import React from 'react';
import { Shield, Award } from 'lucide-react';

export default function Locker({ gearColor, setGearColor, level }) {
  // 색상 팔레트
  const colors = [
    { name: '오리지널 그린', value: '#2a9d8f' },
    { name: '클레이 오렌지', value: '#e76f51' },
    { name: '딥 블루', value: '#1d3557' },
    { name: '라벤더 퍼플', value: '#8338ec' },
    { name: '핫 핑크', value: '#ff006e' },
  ];

  // 업적 리스트 (레벨에 따라 자동 해금)
  const achievements = [
    { title: '테니스 입문', desc: '레벨 1 달성', unlocked: level >= 1 },
    { title: '꾸준함의 시작', desc: '레벨 3 달성', unlocked: level >= 3 },
    { title: '중급자의 길', desc: '레벨 5 달성', unlocked: level >= 5 },
    { title: '코트의 지배자', desc: '레벨 10 달성', unlocked: level >= 10 },
  ];

  return (
    <div className="p-6 pb-24">
      <h2 className="text-2xl font-bold mb-6 text-tennis-dark">마이 락커룸</h2>

      {/* 장비 커스텀 섹션 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Shield size={18} /> 장비 컬러 선택
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => setGearColor(c.value)}
              className={`w-12 h-12 rounded-full border-4 transition-all ${
                gearColor === c.value ? 'border-gray-800 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">선택한 색상이 홈 화면 캐릭터에 적용됩니다.</p>
      </div>

      {/* 업적 섹션 */}
      <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
        <Award size={18} /> 나의 업적
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {achievements.map((ach, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              ach.unlocked 
                ? 'bg-white border-tennis-green shadow-sm' 
                : 'bg-gray-100 border-gray-200 opacity-60'
            }`}
          >
            <div>
              <h4 className={`font-bold ${ach.unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                {ach.title}
              </h4>
              <p className="text-xs text-gray-500">{ach.desc}</p>
            </div>
            <div className="text-2xl">
              {ach.unlocked ? '🏆' : '🔒'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}