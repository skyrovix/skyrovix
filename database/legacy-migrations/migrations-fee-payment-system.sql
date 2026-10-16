-- ==========================================================
-- SKYROVIX LMS: FEE MANAGEMENT, UPI PAYMENT, COUPON SYSTEM & AUDIT LOGS
-- ==========================================================

-- 1. FEE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.fee_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_type TEXT UNIQUE NOT NULL CHECK (fee_type IN ('application', 'certificate')),
  amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0),
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  upi_id TEXT NOT NULL DEFAULT 'hariharanmahesh34@oksbi',
  payee_name TEXT NOT NULL DEFAULT 'Hariharan Mahesh',
  qr_code_url TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial default fee settings if they don't exist
INSERT INTO public.fee_settings (fee_type, amount, is_enabled, upi_id, payee_name)
VALUES 
  ('application', 0, false, 'hariharanmahesh34@oksbi', 'Hariharan Mahesh'),
  ('certificate', 100, true, 'hariharanmahesh34@oksbi', 'Hariharan Mahesh')
ON CONFLICT (fee_type) DO NOTHING;

GRANT SELECT ON public.fee_settings TO anon, authenticated;
GRANT ALL ON public.fee_settings TO service_role;
ALTER TABLE public.fee_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view fee settings" ON public.fee_settings;
CREATE POLICY "Public can view fee settings" ON public.fee_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage fee settings" ON public.fee_settings;
CREATE POLICY "Admins can manage fee settings" ON public.fee_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- 2. EXTEND COUPONS TABLE
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS applies_to TEXT NOT NULL DEFAULT 'certificate' CHECK (applies_to IN ('certificate', 'application', 'both'));
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS single_use_per_user BOOLEAN NOT NULL DEFAULT true;

-- Update discount_type check if needed to also support 'free'
ALTER TABLE public.coupons DROP CONSTRAINT IF EXISTS coupons_discount_type_check;
ALTER TABLE public.coupons ADD CONSTRAINT coupons_discount_type_check CHECK (discount_type IN ('percentage', 'fixed', 'free'));


-- 3. COUPON REDEMPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  certificate_id TEXT,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (coupon_id, user_id, application_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON public.coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON public.coupon_redemptions(coupon_id);

GRANT SELECT, INSERT ON public.coupon_redemptions TO authenticated;
GRANT ALL ON public.coupon_redemptions TO service_role;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own redemptions" ON public.coupon_redemptions;
CREATE POLICY "Users can view own redemptions" ON public.coupon_redemptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can insert own redemptions" ON public.coupon_redemptions;
CREATE POLICY "Users can insert own redemptions" ON public.coupon_redemptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage redemptions" ON public.coupon_redemptions;
CREATE POLICY "Admins manage redemptions" ON public.coupon_redemptions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- 4. PAYMENT RECORDS TABLE (UNIFIED MANUAL UPI PAYMENT TABLE)
CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  certificate_id TEXT,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('application', 'certificate')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  utr_number TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'resubmission_required', 'cancelled')),
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_records_user ON public.payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_app ON public.payment_records(application_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON public.payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_type ON public.payment_records(payment_type);

GRANT SELECT, INSERT, UPDATE ON public.payment_records TO authenticated;
GRANT ALL ON public.payment_records TO service_role;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own payment records" ON public.payment_records;
CREATE POLICY "Users view own payment records" ON public.payment_records
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users insert own payment records" ON public.payment_records;
CREATE POLICY "Users insert own payment records" ON public.payment_records
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "Users update own pending payment records" ON public.payment_records;
CREATE POLICY "Users update own pending payment records" ON public.payment_records
  FOR UPDATE TO authenticated
  USING (
    (auth.uid() = user_id AND status IN ('pending', 'resubmission_required'))
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    (auth.uid() = user_id AND status IN ('pending', 'resubmission_required'))
    OR public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "Admins full manage payment records" ON public.payment_records;
CREATE POLICY "Admins full manage payment records" ON public.payment_records
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- 5. BACKFILL EXISTING PAYMENTS INTO PAYMENT_RECORDS
DO $$
BEGIN
  INSERT INTO public.payment_records (
    id,
    user_id,
    application_id,
    payment_type,
    amount,
    utr_number,
    screenshot_url,
    status,
    admin_note,
    reviewed_at,
    created_at,
    updated_at
  )
  SELECT 
    p.id,
    a.user_id,
    p.application_id,
    'certificate' AS payment_type,
    p.amount,
    p.utr_number,
    p.screenshot_url,
    CASE 
      WHEN p.status = 'verified' THEN 'approved'
      WHEN p.status = 'rejected' THEN 'rejected'
      ELSE 'pending'
    END AS status,
    NULL AS admin_note,
    p.verified_at AS reviewed_at,
    p.submitted_at AS created_at,
    COALESCE(p.verified_at, p.submitted_at, now()) AS updated_at
  FROM public.payments p
  JOIN public.applications a ON a.id = p.application_id
  ON CONFLICT (id) DO NOTHING;
END $$;


-- 6. FEE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.fee_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('fee_setting', 'payment', 'coupon')),
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fee_audit_logs_created_at ON public.fee_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fee_audit_logs_entity ON public.fee_audit_logs(entity_type, entity_id);

GRANT SELECT, INSERT ON public.fee_audit_logs TO authenticated;
GRANT ALL ON public.fee_audit_logs TO service_role;
ALTER TABLE public.fee_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view fee audit logs" ON public.fee_audit_logs;
CREATE POLICY "Admins view fee audit logs" ON public.fee_audit_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins insert fee audit logs" ON public.fee_audit_logs;
CREATE POLICY "Admins insert fee audit logs" ON public.fee_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
