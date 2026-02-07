import React, { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { hapticsLight, hapticsMedium } from '../utils/haptics';

const COLORS = [
  { name: '코트 그린', value: '#2a9d8f' },
  { name: '클레이 오렌지', value: '#e76f51' },
  { name: '딥 블루', value: '#1d3557' },
  { name: '라벤더 퍼플', value: '#8338ec' },
  { name: '핫 핑크', value: '#ff006e' },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2a9d8f');

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      hapticsLight();
      setStep(2);
    }
  };

  const handleFinish = () => {
    if (name.trim()) {
      hapticsMedium();
      onComplete(name.trim(), selectedColor);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center px-6 relative">
      <div className="w-full max-w-sm">

        {step === 1 && (
          <div className="animate-fade-in text-center">
            <h1 className="text-[28px] font-bold text-[#191F28] mb-2">잇츠 마이 테니스</h1>
            <p className="text-[#8B95A1] text-sm mb-10">성장한다. 조용히 그리고 천천히.</p>

            <div className="text-left mb-8">
              <label className="block text-sm font-bold text-[#8B95A1] mb-2">이름을 알려주세요</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="닉네임 입력"
                maxLength={20}
                className="w-full p-4 rounded-[12px] bg-white border-none text-lg font-bold text-[#191F28] focus:outline-none focus:ring-2 focus:ring-primary shadow-card"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className="w-full bg-primary text-white py-4 rounded-[12px] font-bold text-lg flex items-center justify-center gap-2 hover:brightness-105 transition-all disabled:opacity-40"
            >
              다음 <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in text-center">
            <h2 className="text-xl font-bold text-[#191F28] mb-2">테마 컬러를 선택하세요</h2>
            <p className="text-[#8B95A1] text-sm mb-8">앱 전체에 적용됩니다</p>

            <div className="flex justify-center gap-4 mb-10">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => { setSelectedColor(c.value); hapticsLight(); }}
                  className={`w-14 h-14 rounded-full transition-all flex items-center justify-center ${
                    selectedColor === c.value ? 'ring-2 ring-offset-2 ring-[#191F28] scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {selectedColor === c.value && <Check size={20} className="text-white" />}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-[16px] shadow-card p-6 mb-8">
              <p className="font-bold text-[#191F28] text-lg">{name}님</p>
              <p className="text-sm text-[#8B95A1] mt-1">Lv.1 루키</p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-4 rounded-[12px] font-bold text-white text-lg transition-all hover:brightness-105"
              style={{ backgroundColor: selectedColor }}
            >
              시작하기
            </button>
          </div>
        )}
      </div>
      <p className="absolute bottom-6 text-[11px] text-[#B0B8C1]">v1.0 잇마테 by 한PD</p>
    </div>
  );
}
