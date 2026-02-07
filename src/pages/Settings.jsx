import React, { useState, useRef, useMemo } from 'react';
import { Download, Upload, User, Info, ExternalLink, Palette, Award, Check, Lock } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import { calculateAchievements } from '../utils/gameData';

export default function Settings({ data, onUpdateProfile, onImportData, onResetData, gearColor, setGearColor, level, logs = [], stats = {} }) {
  const fileInputRef = useRef(null);
  const [editName, setEditName] = useState(data.profileName || '');
  const [editing, setEditing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [importError, setImportError] = useState(false);

  const colors = [
    { name: '오리지널 그린', value: '#2a9d8f' },
    { name: '클레이 오렌지', value: '#e76f51' },
    { name: '딥 블루', value: '#1d3557' },
    { name: '라벤더 퍼플', value: '#8338ec' },
    { name: '핫 핑크', value: '#ff006e' },
  ];

  const achievements = useMemo(() => calculateAchievements(logs, level, stats), [logs, level, stats]);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateProfile(editName.trim());
      setEditing(false);
    }
  };

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-tennis-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        const isValid = imported
          && typeof imported.stats === 'object'
          && Array.isArray(imported.logs)
          && typeof imported.level === 'number'
          && typeof imported.exp === 'number';
        if (isValid) {
          onImportData(imported);
          setImportMessage('데이터를 성공적으로 불러왔습니다!');
          setImportError(false);
        } else {
          setImportMessage('올바른 백업 파일이 아닙니다.');
          setImportError(true);
        }
      } catch {
        setImportMessage('파일을 읽을 수 없습니다.');
        setImportError(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] pb-32 font-sans">
      {/* Header */}
      <div className="pt-safe px-5 pt-8 pb-4">
        <h2 className="text-[22px] font-bold text-[#191F28]">더보기</h2>
      </div>

      <div className="px-5 space-y-4 max-w-md mx-auto">
        {/* Profile */}
        <div className="bg-white rounded-[16px] shadow-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <User size={18} className="text-[#8B95A1]" />
            <h3 className="font-bold text-[#191F28]">프로필</h3>
          </div>
          {editing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={20}
                className="flex-1 p-3 rounded-[12px] bg-[#F4F4F4] border-none font-bold text-[#191F28] focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <button onClick={handleSaveName} className="px-4 py-2 bg-primary text-white rounded-[12px] font-bold text-sm">저장</button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 bg-[#F4F4F4] text-[#8B95A1] rounded-[12px] font-bold text-sm">취소</button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#191F28]">{data.profileName || '이름 없음'}</span>
              <button onClick={() => setEditing(true)} className="text-primary text-sm font-bold">편집</button>
            </div>
          )}
        </div>

        {/* Theme Color (from Locker) */}
        <div className="bg-white rounded-[16px] shadow-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Palette size={18} className="text-[#8B95A1]" />
            <h3 className="font-bold text-[#191F28]">테마 컬러</h3>
          </div>
          <div className="flex gap-3">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => setGearColor(c.value)}
                className={`w-11 h-11 rounded-full transition-all flex items-center justify-center ${
                  gearColor === c.value ? 'ring-2 ring-offset-2 ring-[#191F28] scale-110' : ''
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              >
                {gearColor === c.value && <Check size={16} className="text-white" />}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#B0B8C1] mt-3">앱 전체에 적용됩니다</p>
        </div>

        {/* Achievements (from Locker) */}
        <div className="bg-white rounded-[16px] shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Award size={18} className="text-[#8B95A1]" />
              <h3 className="font-bold text-[#191F28]">나의 업적</h3>
            </div>
            <span className="text-xs font-bold" style={{ color: gearColor }}>{unlockedCount}/{achievements.length}</span>
          </div>
          <div className="space-y-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`flex items-center justify-between p-3 rounded-[12px] ${
                  ach.unlocked ? 'bg-primary/5' : 'bg-[#F4F4F4] opacity-50'
                }`}
              >
                <div>
                  <p className={`text-sm font-bold ${ach.unlocked ? 'text-[#191F28]' : 'text-[#B0B8C1]'}`}>{ach.title}</p>
                  <p className="text-xs text-[#8B95A1]">{ach.desc}</p>
                </div>
                {ach.unlocked
                  ? <Check size={18} className="text-primary" />
                  : <Lock size={18} className="text-[#B0B8C1]" />
                }
              </div>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-[16px] shadow-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Download size={18} className="text-[#8B95A1]" />
            <h3 className="font-bold text-[#191F28]">데이터 관리</h3>
          </div>
          <div className="space-y-3">
            <button onClick={handleExport} className="w-full flex items-center gap-3 p-3 rounded-[12px] bg-[#F4F4F4] hover:bg-[#ECECEC] transition-colors">
              <Download size={18} className="text-primary" />
              <div className="text-left">
                <p className="text-sm font-bold text-[#191F28]">데이터 내보내기</p>
                <p className="text-[11px] text-[#B0B8C1]">JSON 파일로 백업</p>
              </div>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 p-3 rounded-[12px] bg-[#F4F4F4] hover:bg-[#ECECEC] transition-colors">
              <Upload size={18} className="text-primary" />
              <div className="text-left">
                <p className="text-sm font-bold text-[#191F28]">데이터 가져오기</p>
                <p className="text-[11px] text-[#B0B8C1]">백업 파일에서 복원</p>
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            {importMessage && <p className={`text-xs font-bold text-center ${importError ? 'text-red-500' : 'text-primary'}`}>{importMessage}</p>}
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-[16px] shadow-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Info size={18} className="text-[#8B95A1]" />
            <h3 className="font-bold text-[#191F28]">앱 정보</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8B95A1]">버전</span>
              <span className="font-bold text-[#191F28]">1.0.0</span>
            </div>
            <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-1">
              <span className="text-[#8B95A1]">개인정보 처리방침</span>
              <ExternalLink size={14} className="text-[#B0B8C1]" />
            </a>
            <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-1">
              <span className="text-[#8B95A1]">이용약관</span>
              <ExternalLink size={14} className="text-[#B0B8C1]" />
            </a>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-[16px] shadow-card p-5">
          <button onClick={() => setShowResetConfirm(true)} className="w-full flex items-center gap-3 p-3 rounded-[12px] hover:bg-red-50 transition-colors">
            <div className="text-left">
              <p className="text-sm font-bold text-red-500">데이터 초기화</p>
              <p className="text-[11px] text-[#B0B8C1]">모든 기록과 스탯을 삭제합니다</p>
            </div>
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <ConfirmDialog
          title="데이터 초기화"
          message="모든 기록, 스탯, 레벨이 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
          confirmLabel="초기화"
          onConfirm={() => { onResetData(); setShowResetConfirm(false); }}
          onCancel={() => setShowResetConfirm(false)}
          danger
        />
      )}
    </div>
  );
}
