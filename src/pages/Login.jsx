import React, { useState } from 'react';
import { hapticsLight, hapticsMedium } from '../utils/haptics';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signInAnonymously } = useAuth();
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const normalized = answer.replace(/\s/g, '').toLowerCase();
    if (normalized !== '러브포티') {
      setError('정답이 아닙니다. 다시 시도해주세요!');
      setShake(true);
      hapticsLight();
      setTimeout(() => setShake(false), 500);
      return;
    }

    setError('');
    setLoading(true);
    hapticsMedium();

    const { error: authError } = await signInAnonymously();
    if (authError) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center px-6 relative">
      <div className="w-full max-w-sm">
        <div className="animate-fade-in text-center">
          <h1 className="text-[28px] font-bold text-[#191F28] mb-2">잇츠 마이 테니스</h1>
          <p className="text-[#8B95A1] text-sm mb-10">입장을 위해 퀴즈를 풀어주세요</p>

          <div className="text-left mb-8">
            <label className="block text-sm font-bold text-[#8B95A1] mb-2">우리 팀 이름은?</label>
            <input
              type="text"
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); setError(''); }}
              placeholder="정답을 입력하세요"
              maxLength={20}
              className={`w-full p-4 rounded-[12px] bg-white border-none text-lg font-bold text-[#191F28] focus:outline-none focus:ring-2 focus:ring-primary shadow-card ${shake ? 'animate-shake' : ''}`}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
            />
            {error && (
              <p className="text-red-500 text-xs font-bold mt-2">{error}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || loading}
            className="w-full bg-primary text-white py-4 rounded-[12px] font-bold text-lg flex items-center justify-center gap-2 hover:brightness-105 transition-all disabled:opacity-40"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              '입장하기'
            )}
          </button>
        </div>
      </div>
      <p className="absolute bottom-6 text-[11px] text-[#B0B8C1]">v1.0 잇마테 by 한PD</p>
    </div>
  );
}
