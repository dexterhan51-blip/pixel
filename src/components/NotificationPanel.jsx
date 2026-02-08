import React from 'react';
import { X, UserPlus, UserCheck, Dumbbell, TrendingUp, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useFriends } from '../hooks/useFriends';

const NOTIFICATION_ICONS = {
  friend_request: <UserPlus size={16} className="text-blue-500" />,
  friend_accepted: <UserCheck size={16} className="text-primary" />,
  friend_training: <Dumbbell size={16} className="text-[#e76f51]" />,
  friend_level_up: <TrendingUp size={16} className="text-[#8338ec]" />,
};

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return date.toLocaleDateString('ko-KR');
}

export default function NotificationPanel({ onClose }) {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const { acceptRequest, rejectRequest } = useFriends();

  const handleAccept = async (requestId, notificationId) => {
    await acceptRequest(requestId);
    await markAsRead(notificationId);
  };

  const handleReject = async (requestId, notificationId) => {
    await rejectRequest(requestId);
    await markAsRead(notificationId);
  };

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="absolute top-0 left-0 right-0 bg-white rounded-b-[20px] shadow-2xl max-h-[70vh] overflow-hidden animate-slide-in-down">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 pt-safe border-b border-[#F4F4F4]">
          <h3 className="text-lg font-bold text-[#191F28]">알림</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F4F4F4] text-xs font-bold text-[#8B95A1]"
              >
                <CheckCheck size={12} />
                모두 읽음
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F4F4F4]"
            >
              <X size={18} className="text-[#8B95A1]" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[#8B95A1] text-sm">알림이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F4F4F4]">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-5 py-4 transition-colors ${n.is_read ? 'bg-white' : 'bg-blue-50/30'}`}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F4F4F4] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {NOTIFICATION_ICONS[n.type] || <Dumbbell size={16} className="text-[#8B95A1]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#191F28]">{n.title}</p>
                      <p className="text-xs text-[#8B95A1] mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-[#B0B8C1] mt-1">{timeAgo(n.created_at)}</p>

                      {/* Inline accept/reject for friend requests */}
                      {n.type === 'friend_request' && !n.is_read && n.data?.request_id && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAccept(n.data.request_id, n.id); }}
                            className="px-3 py-1.5 rounded-[8px] bg-primary text-white text-xs font-bold"
                          >
                            수락
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReject(n.data.request_id, n.id); }}
                            className="px-3 py-1.5 rounded-[8px] bg-[#F4F4F4] text-[#8B95A1] text-xs font-bold"
                          >
                            거절
                          </button>
                        </div>
                      )}
                    </div>

                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
