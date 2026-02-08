-- ============================================
-- 004: notifications 테이블 + 트리거
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'friend_request', 'friend_accepted', 'friend_training', 'friend_level_up'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 트리거: 훈련 기록 시 친구에게 알림
-- ============================================
CREATE OR REPLACE FUNCTION public.on_training_log_created()
RETURNS TRIGGER AS $$
DECLARE
  v_friend_id UUID;
  v_profile_name TEXT;
  v_type_label TEXT;
BEGIN
  -- 프로필 이름 가져오기
  SELECT profile_name INTO v_profile_name FROM public.profiles WHERE id = NEW.user_id;

  -- 타입 라벨
  CASE NEW.type
    WHEN 'lesson' THEN v_type_label := '레슨';
    WHEN 'game' THEN v_type_label := '경기';
    WHEN 'practice' THEN v_type_label := '개인 연습';
    ELSE v_type_label := '훈련';
  END CASE;

  -- 모든 친구에게 알림
  FOR v_friend_id IN
    SELECT friend_id FROM public.friendships WHERE user_id = NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      v_friend_id,
      'friend_training',
      v_profile_name || '님이 운동했습니다',
      v_type_label || ' ' || NEW.duration || '분',
      jsonb_build_object('user_id', NEW.user_id, 'log_id', NEW.id)
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_training_log_created ON public.training_logs;
CREATE TRIGGER on_training_log_created
  AFTER INSERT ON public.training_logs
  FOR EACH ROW EXECUTE FUNCTION public.on_training_log_created();

-- ============================================
-- 트리거: 레벨업 시 친구에게 알림
-- ============================================
CREATE OR REPLACE FUNCTION public.on_profile_level_up()
RETURNS TRIGGER AS $$
DECLARE
  v_friend_id UUID;
BEGIN
  -- 레벨이 올라간 경우에만
  IF NEW.level > OLD.level THEN
    FOR v_friend_id IN
      SELECT friend_id FROM public.friendships WHERE user_id = NEW.id
    LOOP
      INSERT INTO public.notifications (user_id, type, title, body, data)
      VALUES (
        v_friend_id,
        'friend_level_up',
        NEW.profile_name || '님이 레벨업!',
        'Lv.' || NEW.level || ' 달성',
        jsonb_build_object('user_id', NEW.id, 'new_level', NEW.level)
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_level_up ON public.profiles;
CREATE TRIGGER on_profile_level_up
  AFTER UPDATE OF level ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.on_profile_level_up();

-- ============================================
-- Supabase Realtime 활성화
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
