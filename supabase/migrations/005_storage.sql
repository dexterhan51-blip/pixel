-- ============================================
-- 005: Supabase Storage — training-photos 버킷
-- ============================================

-- Note: Storage bucket creation is done via Supabase Dashboard or CLI.
-- This file documents the configuration and RLS policies.

-- Create bucket (run in Supabase Dashboard > Storage > New Bucket):
-- Name: training-photos
-- Public: false (private)
-- File size limit: 2MB
-- Allowed MIME types: image/jpeg

-- Storage RLS Policies (run in SQL Editor):

-- 본인 업로드
CREATE POLICY "Users can upload own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'training-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 본인 읽기
CREATE POLICY "Users can read own photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'training-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 친구 읽기
CREATE POLICY "Friends can read photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'training-photos'
    AND (storage.foldername(name))[1]::uuid IN (
      SELECT friend_id FROM public.friendships WHERE user_id = auth.uid()
    )
  );

-- 본인 삭제
CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'training-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 본인 업데이트 (upsert)
CREATE POLICY "Users can update own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'training-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
