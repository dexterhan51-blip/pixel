import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFriends = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch friendships with profile data
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          friend_id,
          created_at,
          friend:profiles!friendships_friend_id_fkey (
            id, profile_name, gear_color, level, exp, stats
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Fetch friends error:', error);
      } else {
        setFriends(data || []);
      }
    } catch (err) {
      console.error('Fetch friends exception:', err);
    }

    setLoading(false);
  }, [user]);

  const fetchPendingRequests = useCallback(async () => {
    if (!user) return;

    try {
      // Incoming requests
      const { data: incoming, error: inErr } = await supabase
        .from('friend_requests')
        .select(`
          id,
          from_user_id,
          status,
          created_at,
          from_user:profiles!friend_requests_from_user_id_fkey (
            id, profile_name, gear_color, level
          )
        `)
        .eq('to_user_id', user.id)
        .eq('status', 'pending');

      if (inErr) {
        console.error('Fetch pending requests error:', inErr);
      } else {
        setPendingRequests(incoming || []);
      }

      // Outgoing requests
      const { data: outgoing, error: outErr } = await supabase
        .from('friend_requests')
        .select(`
          id,
          to_user_id,
          status,
          created_at,
          to_user:profiles!friend_requests_to_user_id_fkey (
            id, profile_name, gear_color, level
          )
        `)
        .eq('from_user_id', user.id)
        .eq('status', 'pending');

      if (outErr) {
        console.error('Fetch sent requests error:', outErr);
      } else {
        setSentRequests(outgoing || []);
      }
    } catch (err) {
      console.error('Fetch requests exception:', err);
    }
  }, [user]);

  const sendRequest = useCallback(async (inviteCode) => {
    if (!user) return { error: '로그인이 필요합니다' };

    try {
      const { data, error } = await supabase
        .rpc('send_friend_request_by_code', { p_invite_code: inviteCode });

      if (error) {
        if (error.message.includes('본인')) return { error: '본인에게는 요청을 보낼 수 없습니다' };
        if (error.message.includes('이미')) return { error: '이미 친구이거나 요청이 대기 중입니다' };
        if (error.message.includes('찾을 수 없')) return { error: '해당 초대 코드를 찾을 수 없습니다' };
        return { error: error.message };
      }

      await fetchPendingRequests();
      return { data, error: null };
    } catch (err) {
      return { error: '요청 전송에 실패했습니다' };
    }
  }, [user, fetchPendingRequests]);

  const acceptRequest = useCallback(async (requestId) => {
    if (!user) return { error: '로그인이 필요합니다' };

    try {
      const { data, error } = await supabase
        .rpc('accept_friend_request', { p_request_id: requestId });

      if (error) return { error: error.message };

      await Promise.all([fetchFriends(), fetchPendingRequests()]);
      return { data, error: null };
    } catch (err) {
      return { error: '수락에 실패했습니다' };
    }
  }, [user, fetchFriends, fetchPendingRequests]);

  const rejectRequest = useCallback(async (requestId) => {
    if (!user) return { error: '로그인이 필요합니다' };

    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .eq('to_user_id', user.id);

      if (error) return { error: error.message };

      await fetchPendingRequests();
      return { error: null };
    } catch (err) {
      return { error: '거절에 실패했습니다' };
    }
  }, [user, fetchPendingRequests]);

  const removeFriend = useCallback(async (friendId) => {
    if (!user) return { error: '로그인이 필요합니다' };

    try {
      // Delete both directions
      const { error: e1 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', user.id)
        .eq('friend_id', friendId);

      const { error: e2 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', user.id);

      if (e1 || e2) return { error: '친구 삭제에 실패했습니다' };

      await fetchFriends();
      return { error: null };
    } catch (err) {
      return { error: '친구 삭제에 실패했습니다' };
    }
  }, [user, fetchFriends]);

  const getFriendActivity = useCallback(async (friendId) => {
    if (!user) return { logs: [], profile: null };

    try {
      const [logsResult, profileResult] = await Promise.all([
        supabase
          .from('training_logs')
          .select('*')
          .eq('user_id', friendId)
          .order('date', { ascending: false })
          .limit(20),
        supabase
          .from('profiles')
          .select('*')
          .eq('id', friendId)
          .single(),
      ]);

      return {
        logs: logsResult.data || [],
        profile: profileResult.data || null,
      };
    } catch (err) {
      console.error('Fetch friend activity error:', err);
      return { logs: [], profile: null };
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchPendingRequests();
    }
  }, [user, fetchFriends, fetchPendingRequests]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    fetchFriends,
    fetchPendingRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    getFriendActivity,
  };
}
