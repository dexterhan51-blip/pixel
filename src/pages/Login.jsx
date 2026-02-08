import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signInWithKakao } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleKakaoLogin = async () => {
    setLoading(true);
    const { error } = await signInWithKakao();
    if (error) {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-[28px] font-bold text-[#191F28] mb-2">잇츠 마이 테니스</h1>
        <p className="text-[#8B95A1] text-sm mb-12">성장한다. 조용히 그리고 천천히.</p>

        <button
          onClick={handleKakaoLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-[12px] font-bold text-lg transition-all disabled:opacity-50"
          style={{ backgroundColor: '#FEE500', color: '#000000' }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C6.48 3 2 6.36 2 10.5c0 2.62 1.74 4.94 4.38 6.3-.14.52-.93 3.38-.96 3.6 0 0-.02.17.09.24.11.07.24.01.24.01.32-.04 3.7-2.44 4.28-2.86.63.09 1.28.14 1.97.14 5.52 0 10-3.36 10-7.5S17.52 3 12 3z" fill="black"/>
              </svg>
              카카오로 시작하기
            </>
          )}
        </button>

        <button
          onClick={handleSkip}
          className="mt-4 text-[#8B95A1] text-sm font-medium underline underline-offset-4 hover:text-[#191F28] transition-colors"
        >
          로그인 없이 사용하기
        </button>
      </div>
    </div>
  );
}
