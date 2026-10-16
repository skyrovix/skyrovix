/* === SKYROVIX PROMOTIONAL OFFER & COUPON SYSTEM === */

-- ============ COUPONS TABLE ============
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER NOT NULL DEFAULT 0,
  current_uses INTEGER NOT NULL DEFAULT 0,
  min_amount NUMERIC NOT NULL DEFAULT 0,
  max_discount_amount NUMERIC,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  applicable_domains TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage coupons" ON public.coupons;
CREATE POLICY "Admins manage coupons" ON public.coupons
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PAYMENT TABLE CHANGES ============
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS discount_amount NUMERIC NOT NULL DEFAULT 0;

ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS coupon_code TEXT;
