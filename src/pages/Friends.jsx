import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, UserPlus, UserMinus, Clock, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFriends } from '../hooks/useFriends';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { getLevelTitle } from '../utils/gameData';

export default function Friends() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
  } = useFriends();

  const [inviteInput, setInviteInput] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');
  const [sending, setSending] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  const handleCopyCode = async () => {
    if (profile?.invite_code) {
      try {
        await navigator.clipboard.writeText(profile.invite_code);
      } catch {
        const textArea = document.createElement('textarea');
        textArea.value = profile.invite_code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleSendRequest = async () => {
    if (!inviteInput.trim()) return;
    setSending(true);
    setSendError('');
    setSendSuccess('');

    const { error } = await sendRequest(inviteInput.trim());
    if (error) {
      setSendError(error);
    } else {
      setSendSuccess('친구 요청을 보냈습니다!');
      setInviteInput('');
    }
    setSending(false);
  };

  const handleAccept = async (requestId) => {
    await acceptRequest(requestId);
  };

  const handleReject = async (requestId) => {
    await rejectRequest(requestId);
  };

  const confirmRemove = async () => {
    if (removeTarget) {
      await removeFriend(removeTarget);
      setRemoveTarget(null);
    }
  };

  const getLastTrainingDate = (friend) => {
    // This would need a separate query; for now show level
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] pb-32 font-sans">
      {/* Header */}
      <div className="bg-white shadow-card">
        <div className="px-5 py-4 pt-safe">
          <h2 className="text-lg font-bold text-[#191F28]">친구 관리</h2>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-4 max-w-md mx-auto">

        {/* My Invite Code */}
        {profile?.invite_code && (
          <div className="bg-white rounded-[16px] shadow-card p-5">
            <p className="text-xs text-[#8B95A1] font-medium mb-2">내 초대 코드</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#F4F4F4] px-4 py-3 rounded-[12px] font-mono font-bold text-[#191F28] text-lg tracking-wider text-center">
                {profile.invite_code}
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-3 rounded-[12px] bg-primary text-white flex items-center gap-1 text-sm font-bold"
              >
                {codeCopied ? <Check size={14} /> : <Copy size={14} />}
                {codeCopied ? '복사됨' : '복사'}
              </button>
            </div>
          </div>
        )}

        {/* Add Friend */}
        <div className="bg-white rounded-[16px] shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus size={16} className="text-[#8B95A1]" />
            <p className="text-sm font-bold text-[#191F28]">친구 추가</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
              placeholder="초대 코드 입력"
              maxLength={8}
              className="flex-1 p-3 rounded-[12px] bg-[#F4F4F4] border-none font-mono font-bold text-[#191F28] tracking-wider focus:outline-none focus:ring-2 focus:ring-primary uppercase"
              onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
            />
            <button
              onClick={handleSendRequest}
              disabled={!inviteInput.trim() || sending}
              className="px-4 py-3 rounded-[12px] bg-primary text-white flex items-center gap-1 text-sm font-bold disabled:opacity-50"
            >
              <Send size={14} />
              {sending ? '전송 중' : '요청'}
            </button>
          </div>
          {sendError && <p className="text-xs text-red-500 mt-2">{sendError}</p>}
          {sendSuccess && <p className="text-xs text-primary mt-2">{sendSuccess}</p>}
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-[16px] shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-[#8B95A1]" />
              <p className="text-sm font-bold text-[#191F28]">받은 요청 ({pendingRequests.length})</p>
            </div>
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-[#F4F4F4] rounded-[12px]">
                  <div>
                    <p className="text-sm font-bold text-[#191F28]">{req.from_user?.profile_name || '알 수 없음'}</p>
                    <p className="text-xs text-[#8B95A1]">Lv.{req.from_user?.level || 1}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="px-3 py-1.5 rounded-[8px] bg-primary text-white text-xs font-bold"
                    >
                      수락
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3 py-1.5 rounded-[8px] bg-[#F4F4F4] text-[#8B95A1] text-xs font-bold border border-[#E5E5E5]"
                    >
                      거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sent Requests */}
        {sentRequests.length > 0 && (
          <div className="bg-white rounded-[16px] shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Send size={16} className="text-[#8B95A1]" />
              <p className="text-sm font-bold text-[#191F28]">보낸 요청 ({sentRequests.length})</p>
            </div>
            <div className="space-y-2">
              {sentRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-[#F4F4F4] rounded-[12px]">
                  <div>
                    <p className="text-sm font-bold text-[#191F28]">{req.to_user?.profile_name || '알 수 없음'}</p>
                    <p className="text-xs text-[#8B95A1]">대기 중</p>
                  </div>
                  <Clock size={14} className="text-[#B0B8C1]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friend List */}
        <div className="bg-white rounded-[16px] shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-[#191F28]">친구 목록 ({friends.length})</p>
          </div>

          {friends.length === 0 ? (
            <EmptyState
              title="아직 친구가 없습니다"
              description="초대 코드를 공유하여 친구를 추가해보세요."
              showCTA={false}
            />
          ) : (
            <div className="space-y-3">
              {friends.map((f) => (
                <button
                  key={f.id}
                  onClick={() => navigate(`/friend-activity/${f.friend_id}`)}
                  className="w-full flex items-center justify-between p-3 bg-[#F4F4F4] rounded-[12px] hover:bg-[#ECECEC] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: f.friend?.gear_color || '#2a9d8f' }}
                    >
                      {(f.friend?.profile_name || '?')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#191F28]">{f.friend?.profile_name || '알 수 없음'}</p>
                      <p className="text-xs text-[#8B95A1]">
                        Lv.{f.friend?.level || 1} {getLevelTitle(f.friend?.level || 1)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setRemoveTarget(f.friend_id); }}
                    className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-red-50 text-[#B0B8C1] hover:text-red-500"
                  >
                    <UserMinus size={14} />
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {removeTarget && (
        <ConfirmDialog
          title="친구 삭제"
          message="이 친구를 삭제하시겠습니까? 상대방의 친구 목록에서도 제거됩니다."
          confirmLabel="삭제"
          onConfirm={confirmRemove}
          onCancel={() => setRemoveTarget(null)}
          danger
        />
      )}
    </div>
  );
}
