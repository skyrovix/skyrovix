-- =========================================================
-- SKYROVIX — Submission History + Rejection Reason
-- Run this in your Supabase SQL Editor
-- =========================================================

-- 1. Submission history table for both internship and course submissions
CREATE TABLE IF NOT EXISTS public.submission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.submission_history TO authenticated;
GRANT ALL ON public.submission_history TO service_role;
ALTER TABLE public.submission_history ENABLE ROW LEVEL SECURITY;

-- Admin can see all history
DROP POLICY IF EXISTS "Admin view submission history" ON public.submission_history;
CREATE POLICY "Admin view submission history" ON public.submission_history
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_id AND table_name = 'submissions'
    AND EXISTS (SELECT 1 FROM public.applications a WHERE a.id = s.application_id AND a.user_id = auth.uid())
  ) OR EXISTS (
    SELECT 1 FROM public.course_task_submissions cs
    WHERE cs.id = submission_id AND table_name = 'course_task_submissions'
    AND EXISTS (SELECT 1 FROM public.enrollments e WHERE e.id = cs.enrollment_id AND e.user_id = auth.uid())
  ));

-- Users can insert their own resubmission history
DROP POLICY IF EXISTS "Users insert submission history" ON public.submission_history;
CREATE POLICY "Users insert submission history" ON public.submission_history
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = changed_by);

-- Grant usage for submission_status enum
GRANT USAGE ON TYPE public.submission_status TO authenticated;

-- 2. Add resubmission tracking columns to submissions table
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS previous_submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS resubmission_count INT DEFAULT 0;

-- 3. Drop legacy unique constraint to allow historical rejected records + new pending resubmissions
ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_application_id_task_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS submissions_one_pending_per_task ON public.submissions (application_id, task_id) WHERE status = 'pending';

-- 4. Allow students to update rejected submissions to pending
DROP POLICY IF EXISTS "Users update own pending submissions" ON public.submissions;
CREATE POLICY "Users update own pending submissions" ON public.submissions FOR UPDATE TO authenticated USING (
  (EXISTS (SELECT 1 FROM public.applications a WHERE a.id = submissions.application_id AND a.user_id = auth.uid()) 
   AND (status = 'pending'::submission_status OR status = 'rejected'::submission_status)) 
  OR public.has_role(auth.uid(), 'admin')
);


