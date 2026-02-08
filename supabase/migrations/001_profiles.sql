-- ============================================
-- 001: profiles 테이블 + 자동 생성 트리거
-- ============================================

-- 8자리 대문자 영숫자 초대코드 생성 함수
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_count INT;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text || now()::text), 1, 8));
    SELECT count(*) INTO exists_count FROM public.profiles WHERE invite_code = code;
    IF exists_count = 0 THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- profiles 테이블
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL DEFAULT '',
  gear_color TEXT NOT NULL DEFAULT '#2a9d8f',
  level INTEGER NOT NULL DEFAULT 1,
  exp INTEGER NOT NULL DEFAULT 0,
  stats JSONB NOT NULL DEFAULT '{"forehand":1,"backhand":1,"serve":1,"volley":1,"footwork":1,"mental":1}',
  invite_code TEXT UNIQUE NOT NULL DEFAULT generate_invite_code(),
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- auth.users INSERT 시 자동 profile 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, profile_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 본인 프로필 읽기/수정
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 친구가 프로필 읽기 가능
CREATE POLICY "Friends can view profiles" ON public.profiles
  FOR SELECT USING (
    id IN (
      SELECT friend_id FROM public.friendships WHERE user_id = auth.uid()
    )
  );

-- 초대 코드로 프로필 조회 (RPC에서 사용)
CREATE POLICY "Anyone can lookup by invite code" ON public.profiles
  FOR SELECT USING (true);
