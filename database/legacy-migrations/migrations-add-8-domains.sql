INSERT INTO public.courses (slug, name, short_description, icon, domain, difficulty, duration_weeks, total_topics, total_tasks, quiz_marks, pass_marks, quiz_duration_min, is_published)
VALUES
  ('mernstack', 'MERN Stack Development', 'MongoDB, Express, React, Node.js — build full-stack apps end-to-end.', 'Globe', 'mernstack', 'Intermediate', 8, 0, 0, 100, 60, 60, true),
  ('meanstack', 'MEAN Stack Development', 'MongoDB, Express, Angular, Node.js — build full-stack apps with Angular.', 'Layers', 'meanstack', 'Intermediate', 8, 0, 0, 100, 60, 60, true)
ON CONFLICT (slug) DO NOTHING;
