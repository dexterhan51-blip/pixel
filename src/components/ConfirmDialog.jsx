import React from 'react';

export default function ConfirmDialog({ title, message, confirmLabel = '확인', cancelLabel = '취소', onConfirm, onCancel, danger = false }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="animate-scale-bounce-in bg-white rounded-[20px] p-6 mx-6 shadow-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-[#191F28] mb-2">{title}</h3>
        <p className="text-sm text-[#8B95A1] mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-[12px] font-bold text-[#8B95A1] bg-[#F4F4F4] text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-[12px] font-bold text-white text-sm transition-all ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:brightness-105'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
