import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import { getLevelTitle } from '../utils/gameData';
import { hapticsNotification } from '../utils/haptics';

export default function LevelUpModal({ level, onClose }) {
  useEffect(() => {
    hapticsNotification('success');
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="animate-scale-bounce-in bg-white rounded-[20px] p-8 mx-6 text-center shadow-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#191F28] mb-2">레벨 업!</h2>
        <div className="inline-block bg-primary text-white px-4 py-1.5 rounded-full text-sm font-bold mb-3">
          Lv.{level} {getLevelTitle(level)}
        </div>
        <p className="text-[#8B95A1] text-sm mb-6">한 단계 더 성장했어요!</p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-primary text-white rounded-[12px] font-bold text-sm hover:brightness-105 transition-all"
        >
          확인
        </button>
      </div>
    </div>
  );
}
