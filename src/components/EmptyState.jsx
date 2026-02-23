import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title, description, showCTA = true, ctaLabel = '기록하러 가기', icon: Icon = Inbox }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-[#F4F4F4] flex items-center justify-center mb-4">
        <Icon size={24} className="text-[#B0B8C1]" />
      </div>
      <h3 className="text-base font-bold text-[#191F28] mb-2">{title}</h3>
      <p className="text-sm text-[#8B95A1] mb-6">{description}</p>
      {showCTA && (
        <button
          onClick={() => navigate('/log')}
          className="px-6 py-3 bg-primary text-white rounded-[12px] font-bold text-sm hover:brightness-105 transition-all"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
