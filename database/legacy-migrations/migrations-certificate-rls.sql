-- =========================================================
-- SKYROVIX — Allow users to insert certificates for their own applications
-- Run this in your Supabase SQL Editor
-- =========================================================

DROP POLICY IF EXISTS "Authenticated can insert certificates" ON public.certificates;
CREATE POLICY "Authenticated can insert certificates" ON public.certificates
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND a.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
