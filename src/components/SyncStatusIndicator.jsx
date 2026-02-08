import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function SyncStatusIndicator() {
  const { isOnline, isSyncing } = useData();

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1 text-[#8B95A1]">
        <RefreshCw size={12} className="animate-spin" />
        <span className="text-[10px] font-medium">동기화 중</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1 text-amber-500">
        <WifiOff size={12} />
        <span className="text-[10px] font-medium">오프라인</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-primary">
      <Wifi size={12} />
      <span className="text-[10px] font-medium">동기화됨</span>
    </div>
  );
}
