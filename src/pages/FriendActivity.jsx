import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useFriends } from '../hooks/useFriends';
import { getLevelTitle } from '../utils/gameData';
import EmptyState from '../components/EmptyState';

const TYPE_LABELS = {
  lesson: '레슨',
  game: '경기',
  practice: '개인 연습',
};

const TYPE_COLORS = {
  lesson: '#2a9d8f',
  game: '#e76f51',
  practice: '#3b82f6',
};

export default function FriendActivity() {
  const { friendId } = useParams();
  const { getFriendActivity } = useFriends();
  const [friendProfile, setFriendProfile] = useState(null);
  const [friendLogs, setFriendLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { logs, profile } = await getFriendActivity(friendId);
      setFriendProfile(profile);
      setFriendLogs(logs.map(rl => ({
        id: rl.id,
        date: rl.date,
        type: rl.type,
        duration: rl.duration,
        satisfaction: rl.satisfaction || 0,
        note: rl.note || '',
        details: rl.details || {},
      })));
      setLoading(false);
    };

    if (friendId) load();
  }, [friendId, getFriendActivity]);

  const stats = friendProfile?.stats || { forehand: 1, backhand: 1, serve: 1, volley: 1, footwork: 1, mental: 1 };
  const gearColor = friendProfile?.gear_color || '#2a9d8f';

  const radarData = useMemo(() => [
    { subject: '포핸드', A: stats.forehand, fullMark: 50 },
    { subject: '백핸드', A: stats.backhand, fullMark: 50 },
    { subject: '서브', A: stats.serve, fullMark: 50 },
    { subject: '발리', A: stats.volley, fullMark: 50 },
    { subject: '풋워크', A: stats.footwork, fullMark: 50 },
    { subject: '멘탈', A: stats.mental, fullMark: 50 },
  ], [stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!friendProfile) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] pb-32 font-sans">
        <div className="bg-white shadow-card">
          <div className="px-5 py-4 pt-safe">
            <h2 className="text-lg font-bold text-[#191F28]">친구 활동</h2>
          </div>
        </div>
        <div className="px-5 pt-8">
          <EmptyState title="프로필을 찾을 수 없습니다" description="친구 정보를 불러올 수 없습니다." showCTA={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4] pb-32 font-sans">
      {/* Header */}
      <div className="bg-white shadow-card">
        <div className="px-5 py-4 pt-safe">
          <h2 className="text-lg font-bold text-[#191F28]">{friendProfile.profile_name}님</h2>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-4 max-w-md mx-auto">

        {/* Friend Profile Card */}
        <div className="bg-white rounded-[16px] shadow-card p-5 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3"
            style={{ backgroundColor: gearColor }}
          >
            {(friendProfile.profile_name || '?')[0]}
          </div>
          <p className="text-lg font-bold text-[#191F28]">{friendProfile.profile_name}</p>
          <p className="text-sm text-[#8B95A1]">Lv.{friendProfile.level} {getLevelTitle(friendProfile.level)}</p>
        </div>

        {/* Radar Chart (read-only) */}
        <div className="w-full h-64 bg-white rounded-[16px] shadow-card flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
              <PolarGrid stroke="#F4F4F4" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#191F28', fontSize: 11, fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, 50]} tick={false} axisLine={false} />
              <Radar
                name="Stats"
                dataKey="A"
                stroke={gearColor}
                strokeWidth={3}
                fill={gearColor}
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Training */}
        <div className="bg-white rounded-[16px] shadow-card p-5">
          <p className="text-sm font-bold text-[#191F28] mb-3">최근 훈련 기록</p>

          {friendLogs.length === 0 ? (
            <p className="text-xs text-[#8B95A1] text-center py-4">아직 훈련 기록이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {friendLogs.map((log) => {
                const details = log.details || {};
                const tags = details.tags || [];
                const games = details.games || [];

                return (
                  <div key={log.id} className="p-3 bg-[#F4F4F4] rounded-[12px]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: TYPE_COLORS[log.type] || '#2a9d8f' }}
                        />
                        <span className="text-sm font-bold text-[#191F28]">
                          {TYPE_LABELS[log.type] || log.type}
                        </span>
                      </div>
                      <span className="text-xs text-[#B0B8C1]">{log.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#8B95A1]">
                      <span>{log.duration}분</span>
                      {log.satisfaction > 0 && (
                        <span>{['😫','😕','😐','🙂','😆'][log.satisfaction - 1]}</span>
                      )}
                      {log.type === 'game' && games.length > 0 && (
                        <span>{games[0].myScore}:{games[0].oppScore}</span>
                      )}
                      {log.type !== 'game' && tags.length > 0 && (
                        <span>{tags.join(', ')}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
