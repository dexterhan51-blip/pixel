import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationPanel from './NotificationPanel';

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPanel(true)}
        className="w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center relative"
      >
        <Bell size={18} className="text-[#8B95A1]" />
        {unreadCount > 0 && (
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      {showPanel && (
        <NotificationPanel onClose={() => setShowPanel(false)} />
      )}
    </>
  );
}
