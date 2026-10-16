-- =========================================================
-- SKYROVIX — Real-World Project Challenge Module
-- Run this in your Supabase SQL Editor
-- =========================================================

-- ─── Projects ───
CREATE TABLE IF NOT EXISTS public.project_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  industry TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced','expert')),
  business_background TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  business_requirements TEXT[] NOT NULL DEFAULT '{}',
  functional_requirements TEXT[] NOT NULL DEFAULT '{}',
  technical_requirements TEXT[] NOT NULL DEFAULT '{}',
  expected_deliverables TEXT[] NOT NULL DEFAULT '{}',
  evaluation_criteria TEXT[] NOT NULL DEFAULT '{}',
  technologies TEXT[] NOT NULL DEFAULT '{}',
  resources JSONB DEFAULT '[]',
  submission_deadline TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Submissions ───
CREATE TABLE IF NOT EXISTS public.project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.project_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  github_url TEXT NOT NULL,
  demo_url TEXT,
  doc_url TEXT,
  video_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  final_score NUMERIC(5,1),
  evaluated_at TIMESTAMPTZ,
  evaluator_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- ─── Evaluation Scores ───
CREATE TABLE IF NOT EXISTS public.project_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  problem_solving NUMERIC(3,0) NOT NULL DEFAULT 0,
  ui_ux_design NUMERIC(3,0) NOT NULL DEFAULT 0,
  functionality NUMERIC(3,0) NOT NULL DEFAULT 0,
  code_quality NUMERIC(3,0) NOT NULL DEFAULT 0,
  architecture NUMERIC(3,0) NOT NULL DEFAULT 0,
  database_design NUMERIC(3,0) NOT NULL DEFAULT 0,
  performance NUMERIC(3,0) NOT NULL DEFAULT 0,
  security NUMERIC(3,0) NOT NULL DEFAULT 0,
  scalability NUMERIC(3,0) NOT NULL DEFAULT 0,
  documentation NUMERIC(3,0) NOT NULL DEFAULT 0,
  innovation NUMERIC(3,0) NOT NULL DEFAULT 0,
  total NUMERIC(4,1) GENERATED ALWAYS AS (
    (COALESCE(problem_solving,0) + COALESCE(ui_ux_design,0) + COALESCE(functionality,0) +
     COALESCE(code_quality,0) + COALESCE(architecture,0) + COALESCE(database_design,0) +
     COALESCE(performance,0) + COALESCE(security,0) + COALESCE(scalability,0) +
     COALESCE(documentation,0) + COALESCE(innovation,0)) / 11.0 * 100
  ) STORED,
  feedback TEXT,
  evaluated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(submission_id)
);

-- ─── Completion Certificates ───
CREATE TABLE IF NOT EXISTS public.project_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_id TEXT UNIQUE NOT NULL,
  submission_id UUID NOT NULL REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.project_challenges(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  project_title TEXT NOT NULL,
  industry TEXT NOT NULL,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  final_score NUMERIC(5,1) NOT NULL,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Best Performer Awards ───
CREATE TABLE IF NOT EXISTS public.project_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  project_title TEXT NOT NULL,
  rank TEXT NOT NULL,
  final_score NUMERIC(5,1) NOT NULL,
  award_category TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── RLS ───
ALTER TABLE public.project_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_awards ENABLE ROW LEVEL SECURITY;

-- Project challenges: anyone can view published, admin can all
DROP POLICY IF EXISTS "View published projects" ON public.project_challenges;
CREATE POLICY "View published projects" ON public.project_challenges
  FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin manage projects" ON public.project_challenges;
CREATE POLICY "Admin manage projects" ON public.project_challenges
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Submissions: user owns, admin all
DROP POLICY IF EXISTS "Users view own submissions" ON public.project_submissions;
CREATE POLICY "Users view own submissions" ON public.project_submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users insert own submission" ON public.project_submissions;
CREATE POLICY "Users insert own submission" ON public.project_submissions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin manage submissions" ON public.project_submissions;
CREATE POLICY "Admin manage submissions" ON public.project_submissions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Evaluations: admin only
DROP POLICY IF EXISTS "Admin manage evaluations" ON public.project_evaluations;
CREATE POLICY "Admin manage evaluations" ON public.project_evaluations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Certificates: view own or admin
DROP POLICY IF EXISTS "Users view own project certs" ON public.project_certificates;
CREATE POLICY "Users view own project certs" ON public.project_certificates
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin manage project certs" ON public.project_certificates;
CREATE POLICY "Admin manage project certs" ON public.project_certificates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Awards: view own or admin
DROP POLICY IF EXISTS "Users view own awards" ON public.project_awards;
CREATE POLICY "Users view own awards" ON public.project_awards
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin manage awards" ON public.project_awards;
CREATE POLICY "Admin manage awards" ON public.project_awards
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for project submissions
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
  VALUES ('project-submissions', 'project-submissions', true, false)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload own project submission docs" ON storage.objects;
CREATE POLICY "Users upload own project submission docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-submissions' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Anyone view project submission docs" ON storage.objects;
CREATE POLICY "Anyone view project submission docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-submissions');
