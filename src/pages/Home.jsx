import React from 'react';
import { useNavigate } from 'react-router-dom';
// ▼▼▼ 방금 만든 캐릭터 컴포넌트 가져오기 ▼▼▼
import PixelCharacter from '../components/PixelCharacter';

export default function Home({ level, exp, maxExp, stats, gearColor }) {
  const navigate = useNavigate();
  const expPercent = Math.floor((exp / maxExp) * 100);

  return (
    <div className="pt-8 pb-32 px-4 max-w-md mx-auto space-y-6 animate-fade-in font-sans">
      
      {/* 1. 상단 프로필 카드 */}
      <div className="bg-white p-6 rounded-xl border border-[#dde4e3] shadow-sm">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-lg bg-[#f1f4f3] border-2 border-primary flex items-center justify-center text-3xl">🧑‍💻</div>
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-tight">Lv.{level} 루키</span>
              <span className="text-[#678380] text-[11px] font-bold tracking-tight">랭킹 #128</span>
            </div>
            <p className="text-[#121716] text-xl font-bold tracking-tight">한성종PD님</p>
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[11px] font-bold text-[#678380]">경험치 (EXP)</p>
                <p className="text-primary text-[11px] font-bold">{expPercent}%</p>
              </div>
              <div className="h-2 w-full bg-[#dde4e3] rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${expPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 캐릭터 스테이지 (메인) */}
      <div 
        onClick={() => navigate('/locker')}
        className="relative bg-white rounded-2xl border-2 border-[#dde4e3] p-8 flex flex-col items-center justify-center min-h-[360px] overflow-hidden shadow-inner group cursor-pointer hover:border-primary transition-colors"
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#121716 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-primary/10 to-transparent flex flex-col items-center">
          <div className="w-full h-[1px] bg-primary/20 mt-4"></div>
          <div className="w-full h-[1px] bg-primary/10 mt-8"></div>
        </div>

        {/* ▼▼▼ 여기가 핵심! 아까 그 🎾 이모지 대신 이 컴포넌트를 넣습니다 ▼▼▼ */}
        <PixelCharacter level={level} gearColor={gearColor} />
        {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}

        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#dde4e3] shadow-sm flex items-center gap-2">
          <div className="w-3 h-3 rounded-full transition-colors duration-500" style={{ backgroundColor: gearColor }}></div>
          <p className="text-[11px] font-bold text-[#121716]">착용 장비</p>
        </div>
      </div>

      {/* 3. 주간 요약 카드 */}
      <div className="group relative rounded-xl bg-white p-5 shadow-sm border border-[#dde4e3] flex items-stretch gap-4 overflow-hidden">
        <div className="flex flex-col justify-between flex-1">
          <div>
            <p className="text-primary text-[11px] font-bold uppercase tracking-wider mb-1">주간 요약</p>
            <p className="text-[#121716] text-2xl font-bold tracking-tight">5.5 시간</p>
            <p className="text-[#678380] text-xs font-medium mt-1 tracking-tight">이번 주 총 운동 시간</p>
          </div>
          <button onClick={() => navigate('/stats')} className="mt-4 flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-white gap-2 text-xs font-bold w-fit hover:brightness-110 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            <span>성장 리포트</span>
          </button>
        </div>
        <div className="w-24 bg-gray-50 rounded-lg border border-[#dde4e3] flex items-center justify-center text-4xl opacity-50 grayscale group-hover:grayscale-0 transition-all">📊</div>
      </div>

      {/* 4. 스탯 요약 그리드 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl border border-[#dde4e3] text-center">
          <p className="text-[10px] font-bold text-[#678380] mb-1">파워</p>
          <p className="text-lg font-bold text-clay">{stats.forehand + stats.serve}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-[#dde4e3] text-center">
          <p className="text-[10px] font-bold text-[#678380] mb-1">스피드</p>
          <p className="text-lg font-bold text-primary">{stats.footwork}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-[#dde4e3] text-center">
          <p className="text-[10px] font-bold text-[#678380] mb-1">체력</p>
          <p className="text-lg font-bold text-blue-500">{stats.mental}</p>
        </div>
      </div>
    </div>
  );
}