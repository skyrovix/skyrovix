-- =========================================================
-- SKYROVIX — RPC: generate_certificate (SECURITY DEFINER)
-- Bypasses RLS so authenticated users can generate their own
-- certificate when a free coupon is applied.
-- Idempotent: returns existing cert if already generated.
-- Run this in your Supabase SQL Editor
-- =========================================================

CREATE OR REPLACE FUNCTION public.generate_certificate(p_application_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cert_id TEXT;
  v_hash TEXT;
  v_year TEXT;
  v_existing TEXT;
BEGIN
  SELECT certificate_id INTO v_existing FROM public.certificates WHERE application_id = p_application_id;
  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  v_year := EXTRACT(YEAR FROM NOW())::TEXT;
  v_cert_id := 'SKX-CERT-' || v_year || '-' || LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');
  v_hash := LEFT(REPLACE(gen_random_uuid()::TEXT, '-', ''), 32);

  INSERT INTO public.certificates (application_id, certificate_id, verification_hash)
  VALUES (p_application_id, v_cert_id, v_hash);

  RETURN v_cert_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_certificate(UUID) TO authenticated;
