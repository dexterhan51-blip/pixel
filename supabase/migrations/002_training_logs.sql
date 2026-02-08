-- ============================================
-- 002: training_logs 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS public.training_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lesson', 'game', 'practice')),
  duration INTEGER NOT NULL,
  satisfaction INTEGER DEFAULT 0,
  note TEXT DEFAULT '',
  photo_url TEXT,
  gained_stats JSONB NOT NULL DEFAULT '{}',
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_training_logs_user_id ON public.training_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_training_logs_date ON public.training_logs(date);
CREATE INDEX IF NOT EXISTS idx_training_logs_user_date ON public.training_logs(user_id, date);

-- RLS 활성화
ALTER TABLE public.training_logs ENABLE ROW LEVEL SECURITY;

-- 본인 CRUD
CREATE POLICY "Users can manage own logs" ON public.training_logs
  FOR ALL USING (auth.uid() = user_id);

-- 친구 읽기 전용
CREATE POLICY "Friends can view logs" ON public.training_logs
  FOR SELECT USING (
    user_id IN (
      SELECT friend_id FROM public.friendships WHERE user_id = auth.uid()
    )
  );
