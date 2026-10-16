-- RPC functions to safely expose enrollment/application counts (bypass RLS via SECURITY DEFINER)

CREATE OR REPLACE FUNCTION public.count_course_enrollments(p_course_id UUID)
RETURNS BIGINT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.enrollments WHERE course_id = p_course_id
$$;

CREATE OR REPLACE FUNCTION public.count_domain_applications(p_domain TEXT)
RETURNS BIGINT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.applications WHERE domain = p_domain
$$;
