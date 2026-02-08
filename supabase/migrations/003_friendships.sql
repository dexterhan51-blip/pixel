-- ============================================
-- 003: friendships + friend_requests 테이블
-- ============================================

-- 친구 관계 (양방향 저장)
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id);

-- 친구 요청
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON public.friend_requests(to_user_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_from ON public.friend_requests(from_user_id, status);

-- RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- friendships: 본인 관련만
CREATE POLICY "Users can view own friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete own friendships" ON public.friendships
  FOR DELETE USING (auth.uid() = user_id);

-- friend_requests: 본인 관련만
CREATE POLICY "Users can view own requests" ON public.friend_requests
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can update received requests" ON public.friend_requests
  FOR UPDATE USING (auth.uid() = to_user_id);

-- ============================================
-- RPC 함수: 초대 코드로 친구 요청 보내기
-- ============================================
CREATE OR REPLACE FUNCTION public.send_friend_request_by_code(p_invite_code TEXT)
RETURNS UUID AS $$
DECLARE
  v_target_id UUID;
  v_request_id UUID;
  v_existing INT;
BEGIN
  -- 대상 사용자 찾기
  SELECT id INTO v_target_id FROM public.profiles WHERE invite_code = upper(p_invite_code);
  IF v_target_id IS NULL THEN
    RAISE EXCEPTION '해당 초대 코드를 찾을 수 없습니다';
  END IF;

  -- 본인 체크
  IF v_target_id = auth.uid() THEN
    RAISE EXCEPTION '본인에게는 요청을 보낼 수 없습니다';
  END IF;

  -- 이미 친구인지 체크
  SELECT count(*) INTO v_existing FROM public.friendships
    WHERE user_id = auth.uid() AND friend_id = v_target_id;
  IF v_existing > 0 THEN
    RAISE EXCEPTION '이미 친구입니다';
  END IF;

  -- 이미 대기 중인 요청 체크
  SELECT count(*) INTO v_existing FROM public.friend_requests
    WHERE status = 'pending'
    AND ((from_user_id = auth.uid() AND to_user_id = v_target_id)
      OR (from_user_id = v_target_id AND to_user_id = auth.uid()));
  IF v_existing > 0 THEN
    RAISE EXCEPTION '이미 대기 중인 요청이 있습니다';
  END IF;

  -- 요청 생성
  INSERT INTO public.friend_requests (from_user_id, to_user_id)
  VALUES (auth.uid(), v_target_id)
  RETURNING id INTO v_request_id;

  -- 알림 생성
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    v_target_id,
    'friend_request',
    '새 친구 요청',
    (SELECT profile_name FROM public.profiles WHERE id = auth.uid()) || '님이 친구 요청을 보냈습니다',
    jsonb_build_object('request_id', v_request_id, 'from_user_id', auth.uid())
  );

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC 함수: 친구 요청 수락
-- ============================================
CREATE OR REPLACE FUNCTION public.accept_friend_request(p_request_id UUID)
RETURNS VOID AS $$
DECLARE
  v_from UUID;
  v_to UUID;
BEGIN
  -- 요청 확인
  SELECT from_user_id, to_user_id INTO v_from, v_to
    FROM public.friend_requests
    WHERE id = p_request_id AND status = 'pending';

  IF v_to IS NULL OR v_to != auth.uid() THEN
    RAISE EXCEPTION '유효하지 않은 요청입니다';
  END IF;

  -- 요청 상태 업데이트
  UPDATE public.friend_requests SET status = 'accepted' WHERE id = p_request_id;

  -- 양방향 friendship 생성
  INSERT INTO public.friendships (user_id, friend_id) VALUES (v_from, v_to) ON CONFLICT DO NOTHING;
  INSERT INTO public.friendships (user_id, friend_id) VALUES (v_to, v_from) ON CONFLICT DO NOTHING;

  -- 수락 알림 생성 (요청 보낸 사람에게)
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    v_from,
    'friend_accepted',
    '친구 요청 수락',
    (SELECT profile_name FROM public.profiles WHERE id = v_to) || '님이 친구 요청을 수락했습니다',
    jsonb_build_object('friend_id', v_to)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
