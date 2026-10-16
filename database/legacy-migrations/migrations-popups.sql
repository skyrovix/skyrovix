-- =========================================================
-- SKYROVIX — Promotional Popups
-- Run this in your Supabase SQL Editor
-- =========================================================

CREATE TABLE IF NOT EXISTS public.promotional_popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_label TEXT DEFAULT 'Learn More',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promotional_popups TO anon, authenticated;
GRANT ALL ON public.promotional_popups TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotional_popups TO authenticated;

ALTER TABLE public.promotional_popups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active popups" ON public.promotional_popups;
CREATE POLICY "Anyone can view active popups" ON public.promotional_popups
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin manage popups" ON public.promotional_popups;
CREATE POLICY "Admin manage popups" ON public.promotional_popups
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
