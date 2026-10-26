-- ==========================================================
-- SKYROVIX LMS — COMPLETE MYSQL 8.0 PRODUCTION SCHEMA
-- Run this script on your Contabo MySQL Server:
-- mysql -u root -p skyrovix < mysql_schema.sql
-- ==========================================================
CREATE DATABASE IF NOT EXISTS skyrovix
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE skyrovix;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS (replaces auth.users)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  raw_user_meta_data JSON,
  is_verified TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USER ROLES
CREATE TABLE IF NOT EXISTS user_roles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_user_role (user_id, role),
  INDEX idx_user_roles_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  college VARCHAR(255),
  course VARCHAR(255),
  year VARCHAR(50),
  photo_url TEXT,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3B. STUDENTS (Legacy / Restored Students Master)
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(36) PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255),
  mobile VARCHAR(50),
  college VARCHAR(255),
  degree VARCHAR(255),
  department VARCHAR(255),
  year_of_study VARCHAR(50),
  city VARCHAR(100),
  skill_level VARCHAR(50) DEFAULT 'Beginner',
  password_hash VARCHAR(255),
  student_id_formatted VARCHAR(100),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_students_email (email),
  INDEX idx_students_mobile (mobile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3C. REGISTRATIONS (Legacy / Restored Registrations)
CREATE TABLE IF NOT EXISTS registrations (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36),
  domain VARCHAR(100),
  registration_status VARCHAR(50) DEFAULT 'APPROVED',
  internship_status VARCHAR(50) DEFAULT 'ACTIVE',
  status VARCHAR(50) DEFAULT 'APPROVED',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_reg_student (student_id),
  INDEX idx_reg_domain (domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. APPLICATIONS (Student Internship Applications)
CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'approved',
  intern_id VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  college VARCHAR(255),
  course VARCHAR(255),
  year VARCHAR(50),
  photo_url TEXT,
  duration INT DEFAULT 1,
  country VARCHAR(100),
  state VARCHAR(100),
  district VARCHAR(100),
  city VARCHAR(100),
  pincode VARCHAR(20),
  hear_about VARCHAR(100),
  referral_name VARCHAR(100),
  coupon_code VARCHAR(100),
  plan_type VARCHAR(50) NOT NULL DEFAULT 'standard',
  plan_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  plan_payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  plan_payment_id VARCHAR(100),
  plan_payment_method VARCHAR(50),
  plan_paid_at DATETIME(3),
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  agreed_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  submission_status VARCHAR(50) DEFAULT 'in_progress',
  submitted_at DATETIME(3),
  verified TINYINT(1) DEFAULT 0,
  verified_by VARCHAR(36),
  verified_at DATETIME(3),
  verification_notes TEXT,
  rejection_reason TEXT,
  all_tasks_verified TINYINT(1) DEFAULT 0,
  certificate_generated TINYINT(1) DEFAULT 0,
  certificate_generated_at DATETIME(3),
  certificate_payment_unlocked TINYINT(1) DEFAULT 0,
  certificate_payment_status VARCHAR(50) DEFAULT 'pending',
  completed_at DATETIME(3),
  certificate_offer_eligible TINYINT(1) NOT NULL DEFAULT 0,
  certificate_offer_id VARCHAR(100),
  certificate_offer_amount DECIMAL(10,2),
  certificate_offer_snapshot JSON,
  certificate_offer_granted_at DATETIME(3),
  certificate_offer_expires_at DATETIME(3),
  offer_issued_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_apps_user (user_id),
  INDEX idx_apps_intern_id (intern_id),
  INDEX idx_apps_domain (domain),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(36) PRIMARY KEY,
  domain VARCHAR(100) NOT NULL,
  task_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  resources TEXT,
  UNIQUE KEY uq_domain_task (domain, task_number),
  INDEX idx_tasks_domain (domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. SUBMISSIONS
CREATE TABLE IF NOT EXISTS submissions (
  id VARCHAR(36) PRIMARY KEY,
  application_id VARCHAR(36),
  student_id VARCHAR(36),
  intern_id VARCHAR(100),
  domain VARCHAR(100),
  task_id VARCHAR(36),
  task_number INT,
  task_title VARCHAR(255),
  github_url TEXT,
  deployed_url TEXT,
  pdf_url TEXT,
  screenshot_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
  feedback TEXT,
  notes TEXT,
  student_name VARCHAR(255),
  student_email VARCHAR(255),
  submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  reviewed_at DATETIME(3),
  resubmission_count INT DEFAULT 0,
  project_id VARCHAR(100),
  project_title VARCHAR(255),
  github_repo_url TEXT,
  live_deployment_url TEXT,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_submissions_app (application_id),
  INDEX idx_submissions_student (student_id),
  INDEX idx_submissions_task (task_id),
  INDEX idx_submissions_domain (domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. SUBMISSION HISTORY
CREATE TABLE IF NOT EXISTS submission_history (
  id VARCHAR(36) PRIMARY KEY,
  submission_id VARCHAR(36),
  application_id VARCHAR(36),
  task_id VARCHAR(36),
  status VARCHAR(50),
  notes TEXT,
  github_url TEXT,
  deployed_url TEXT,
  pdf_url TEXT,
  screenshot_url TEXT,
  feedback TEXT,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by VARCHAR(255),
  reason TEXT,
  table_name VARCHAR(100) DEFAULT 'submissions',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_sub_hist_app (application_id),
  INDEX idx_sub_hist_sub (submission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. CERTIFICATES
CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(36) PRIMARY KEY,
  certificate_id VARCHAR(100) NOT NULL UNIQUE,
  student_id VARCHAR(36),
  application_id VARCHAR(36),
  intern_id VARCHAR(100),
  internship_id VARCHAR(100),
  student_name VARCHAR(255),
  domain VARCHAR(100),
  verification_hash VARCHAR(255) NOT NULL,
  issued_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  issue_date DATETIME(3),
  status VARCHAR(50) DEFAULT 'ISSUED',
  certificate_status VARCHAR(50) DEFAULT 'VALID',
  verification_url TEXT,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_certs_cert_id (certificate_id),
  INDEX idx_certs_app (application_id),
  INDEX idx_certs_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. PAYMENTS (UPI verification & transactions)
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  application_id VARCHAR(36),
  registration_id VARCHAR(36),
  utr_number VARCHAR(100),
  screenshot_url TEXT,
  amount DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  status VARCHAR(50) NOT NULL DEFAULT 'verified',
  coupon_code VARCHAR(100),
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  verified_at DATETIME(3),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_payments_app (application_id),
  INDEX idx_payments_utr (utr_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. PAYMENT RECORDS
CREATE TABLE IF NOT EXISTS payment_records (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  application_id VARCHAR(36),
  certificate_id VARCHAR(100),
  payment_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  utr_number VARCHAR(100) NOT NULL,
  screenshot_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by VARCHAR(36),
  reviewed_at DATETIME(3),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_pay_rec_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. FEE SETTINGS
CREATE TABLE IF NOT EXISTS fee_settings (
  id VARCHAR(36) PRIMARY KEY,
  fee_type VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_enabled TINYINT(1) NOT NULL DEFAULT 0,
  upi_id VARCHAR(100) NOT NULL DEFAULT 'hariharanmahesh34@oksbi',
  payee_name VARCHAR(100) NOT NULL DEFAULT 'Hariharan Mahesh',
  qr_code_url TEXT,
  offer_enabled TINYINT(1) NOT NULL DEFAULT 0,
  offer_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  offer_name VARCHAR(255) NOT NULL DEFAULT 'Certificate Free Offer',
  offer_start_at DATETIME(3),
  offer_end_at DATETIME(3),
  updated_by VARCHAR(36),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. CASHFREE ORDERS
CREATE TABLE IF NOT EXISTS cashfree_orders (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(100) UNIQUE NOT NULL,
  user_id VARCHAR(36),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  product_service VARCHAR(255) NOT NULL,
  product_type VARCHAR(50) NOT NULL DEFAULT 'certificate',
  entity_id VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'CREATED',
  cashfree_payment_id VARCHAR(100),
  cf_order_id VARCHAR(100),
  payment_session_id TEXT,
  payment_method VARCHAR(100),
  payment_time DATETIME(3),
  error_message TEXT,
  coupon_code VARCHAR(100),
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  raw_response JSON,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_cf_order_id (order_id),
  INDEX idx_cf_user (user_id),
  INDEX idx_cf_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(50) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INT NOT NULL DEFAULT 0,
  current_uses INT NOT NULL DEFAULT 0,
  min_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  max_discount_amount DECIMAL(10,2),
  expires_at DATETIME(3),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  applicable_domains JSON,
  applies_to VARCHAR(50) NOT NULL DEFAULT 'certificate',
  single_use_per_user TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(36),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_coupon_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. COUPON REDEMPTIONS
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id VARCHAR(36) PRIMARY KEY,
  coupon_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  application_id VARCHAR(36),
  certificate_id VARCHAR(100),
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  redeemed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_coupon_user_app (coupon_id, user_id, application_id),
  INDEX idx_coupon_redemptions_user (user_id),
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(100) NOT NULL,
  rating INT NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'approved',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_reviews_target (target_type, target_id),
  INDEX idx_reviews_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. EMAIL LOGS
CREATE TABLE IF NOT EXISTS email_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  email_to VARCHAR(255),
  recipient_email VARCHAR(255) NOT NULL,
  student_name VARCHAR(255),
  recipient_name VARCHAR(255),
  document_type VARCHAR(100) DEFAULT 'offer_letter',
  email_type VARCHAR(100) NOT NULL DEFAULT 'offer_letter',
  status VARCHAR(50) NOT NULL DEFAULT 'sent',
  subject VARCHAR(255) NOT NULL,
  reference_id VARCHAR(100),
  error_message TEXT,
  metadata JSON,
  sent_at DATETIME(3),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_email_logs_email (recipient_email),
  INDEX idx_email_logs_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. PROMOTIONAL POPUPS
CREATE TABLE IF NOT EXISTS promotional_popups (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '',
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_label VARCHAR(100) DEFAULT 'Learn More',
  is_active TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. PROJECT CHALLENGES
CREATE TABLE IF NOT EXISTS project_challenges (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  business_background TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  business_requirements JSON,
  functional_requirements JSON,
  technical_requirements JSON,
  expected_deliverables JSON,
  evaluation_criteria JSON,
  technologies JSON,
  resources JSON,
  min_duration INT NOT NULL DEFAULT 3,
  tier VARCHAR(20) NOT NULL DEFAULT 'tier1',
  submission_deadline DATETIME(3),
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. PROJECT SUBMISSIONS
CREATE TABLE IF NOT EXISTS project_submissions (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  github_url TEXT NOT NULL,
  demo_url TEXT,
  doc_url TEXT,
  video_url TEXT,
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  final_score DECIMAL(5,1),
  evaluated_at DATETIME(3),
  evaluator_id VARCHAR(36),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_proj_user (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES project_challenges(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. PROJECT EVALUATIONS
CREATE TABLE IF NOT EXISTS project_evaluations (
  id VARCHAR(36) PRIMARY KEY,
  submission_id VARCHAR(36) NOT NULL,
  problem_solving DECIMAL(5,0) NOT NULL DEFAULT 0,
  ui_ux_design DECIMAL(5,0) NOT NULL DEFAULT 0,
  functionality DECIMAL(5,0) NOT NULL DEFAULT 0,
  code_quality DECIMAL(5,0) NOT NULL DEFAULT 0,
  architecture DECIMAL(5,0) NOT NULL DEFAULT 0,
  database_design DECIMAL(5,0) NOT NULL DEFAULT 0,
  performance DECIMAL(5,0) NOT NULL DEFAULT 0,
  security DECIMAL(5,0) NOT NULL DEFAULT 0,
  scalability DECIMAL(5,0) NOT NULL DEFAULT 0,
  documentation DECIMAL(5,0) NOT NULL DEFAULT 0,
  total_score DECIMAL(5,1) NOT NULL DEFAULT 0,
  feedback TEXT,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (submission_id) REFERENCES project_submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. PROJECT CERTIFICATES
CREATE TABLE IF NOT EXISTS project_certificates (
  id VARCHAR(36) PRIMARY KEY,
  cert_id VARCHAR(100) UNIQUE NOT NULL,
  submission_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  project_id VARCHAR(36) NOT NULL,
  participant_name VARCHAR(255) NOT NULL,
  project_title VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  technologies JSON,
  final_score DECIMAL(5,1) NOT NULL,
  completion_date DATE NOT NULL,
  issued_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_proj_certs_cert_id (cert_id),
  FOREIGN KEY (submission_id) REFERENCES project_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES project_challenges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. PROJECT AWARDS
CREATE TABLE IF NOT EXISTS project_awards (
  id VARCHAR(36) PRIMARY KEY,
  award_id VARCHAR(100) UNIQUE NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  submission_id VARCHAR(36) NOT NULL,
  participant_name VARCHAR(255) NOT NULL,
  project_title VARCHAR(255) NOT NULL,
  rank_position VARCHAR(50) NOT NULL,
  award_title VARCHAR(255) NOT NULL DEFAULT '',
  award_category VARCHAR(100) NOT NULL,
  final_score DECIMAL(5,1) NOT NULL,
  issue_date DATE NOT NULL,
  issued_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_proj_awards_award_id (award_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (submission_id) REFERENCES project_submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. COURSES
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(36) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  short_description TEXT NOT NULL,
  icon VARCHAR(100) NOT NULL DEFAULT 'BookOpen',
  domain VARCHAR(100) NOT NULL,
  total_topics INT NOT NULL DEFAULT 0,
  total_tasks INT NOT NULL DEFAULT 5,
  quiz_marks INT NOT NULL DEFAULT 100,
  pass_marks INT NOT NULL DEFAULT 60,
  quiz_duration_min INT NOT NULL DEFAULT 60,
  duration_weeks INT NOT NULL DEFAULT 8,
  difficulty VARCHAR(50) NOT NULL DEFAULT 'Intermediate',
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. COURSE TOPICS
CREATE TABLE IF NOT EXISTS course_topics (
  id VARCHAR(36) PRIMARY KEY,
  course_id VARCHAR(36) NOT NULL,
  order_index INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content_md MEDIUMTEXT NOT NULL,
  code_example MEDIUMTEXT,
  key_points JSON,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_course_topic (course_id, order_index),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. COURSE TASKS
CREATE TABLE IF NOT EXISTS course_tasks (
  id VARCHAR(36) PRIMARY KEY,
  course_id VARCHAR(36) NOT NULL,
  task_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  due_days INT NOT NULL DEFAULT 7,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_course_task (course_id, task_number),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. COURSE QUIZ QUESTIONS
CREATE TABLE IF NOT EXISTS course_quiz_questions (
  id VARCHAR(36) PRIMARY KEY,
  course_id VARCHAR(36) NOT NULL,
  order_index INT NOT NULL,
  question TEXT NOT NULL,
  options JSON NOT NULL,
  correct_index INT NOT NULL,
  question_type VARCHAR(50) NOT NULL DEFAULT 'mcq',
  marks INT NOT NULL DEFAULT 2,
  explanation TEXT,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. ENROLLMENTS
CREATE TABLE IF NOT EXISTS enrollments (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'enrolled',
  progress_percent INT NOT NULL DEFAULT 0,
  current_topic_id VARCHAR(36),
  started_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  completed_at DATETIME(3),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_user_course (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. LESSON PROGRESS
CREATE TABLE IF NOT EXISTS lesson_progress (
  id VARCHAR(36) PRIMARY KEY,
  enrollment_id VARCHAR(36) NOT NULL,
  topic_id VARCHAR(36) NOT NULL,
  completed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_enrollment_topic (enrollment_id, topic_id),
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES course_topics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. QUIZ ATTEMPTS
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id VARCHAR(36) PRIMARY KEY,
  enrollment_id VARCHAR(36) NOT NULL,
  score INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 100,
  passed TINYINT(1) NOT NULL DEFAULT 0,
  answers JSON,
  started_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  submitted_at DATETIME(3),
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. COURSE CERTIFICATES
CREATE TABLE IF NOT EXISTS course_certificates (
  id VARCHAR(36) PRIMARY KEY,
  certificate_id VARCHAR(100) NOT NULL UNIQUE,
  enrollment_id VARCHAR(36),
  user_id VARCHAR(36),
  course_id VARCHAR(36),
  student_name VARCHAR(255),
  course_title VARCHAR(255),
  verification_hash VARCHAR(255) NOT NULL,
  score INT NOT NULL DEFAULT 100,
  issued_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_course_certs_cert_id (certificate_id),
  INDEX idx_course_certs_user (user_id),
  INDEX idx_course_certs_enroll (enrollment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. LEADERBOARD
CREATE TABLE IF NOT EXISTS leaderboard (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36) NOT NULL,
  score INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 100,
  quiz_attempt_id VARCHAR(36),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_leaderboard (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30. LOGIN SESSIONS (Student Activity Tracking)
CREATE TABLE IF NOT EXISTS login_sessions (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  intern_id VARCHAR(100),
  student_name VARCHAR(255),
  email VARCHAR(255),
  domain VARCHAR(100),
  college VARCHAR(255),
  login_time DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  logout_time DATETIME(3),
  last_active DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  status VARCHAR(50) NOT NULL DEFAULT 'online',
  ip_address VARCHAR(100),
  device VARCHAR(100),
  browser VARCHAR(100),
  os VARCHAR(100),
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_login_sessions_student (student_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 31. STUDENT KIT ITEMS (Premium Plan Toolkits & Career Kits)
CREATE TABLE IF NOT EXISTS student_kit_items (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'toolkit',
  description TEXT,
  icon VARCHAR(50) NOT NULL DEFAULT 'Package',
  file_url TEXT,
  external_url TEXT,
  download_url TEXT,
  file_type VARCHAR(50) DEFAULT 'PDF',
  resource_type VARCHAR(50) DEFAULT 'PDF',
  file_size VARCHAR(50),
  format VARCHAR(50) NOT NULL DEFAULT 'ZIP',
  min_duration INT DEFAULT 3,
  min_tier INT NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 32. GUIDANCE SCHEDULES (Premium Mentorship & Office Hours)
CREATE TABLE IF NOT EXISTS guidance_schedules (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  mentor_name VARCHAR(255) NOT NULL,
  mentor_role VARCHAR(255),
  topic VARCHAR(255) NOT NULL,
  session_type VARCHAR(100),
  description TEXT,
  scheduled_at DATETIME(3) NULL,
  schedule_time VARCHAR(255) NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  meeting_url TEXT,
  meeting_link VARCHAR(255),
  recording_url TEXT,
  support_channel VARCHAR(255),
  instructions TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  notes TEXT,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- DEFAULT SEED DATA
-- ==========================================================

-- Default Fee Settings
INSERT INTO fee_settings (id, fee_type, amount, is_enabled, upi_id, payee_name, offer_enabled, offer_amount, offer_name)
VALUES 
  (UUID(), 'application', 0.00, 0, 'hariharanmahesh34@oksbi', 'Hariharan Mahesh', 0, 0.00, 'Free Application'),
  (UUID(), 'certificate', 100.00, 1, 'hariharanmahesh34@oksbi', 'Hariharan Mahesh', 0, 0.00, 'Certificate Free Offer'),
  (UUID(), 'premium_plan', 200.00, 1, 'hariharanmahesh34@oksbi', 'Hariharan Mahesh', 0, 0.00, 'Premium Plan Flat Fee')
ON DUPLICATE KEY UPDATE amount = VALUES(amount), is_enabled = VALUES(is_enabled);

-- Default Admin User (hariharan@skyrovix.com / Admin@123 / 123harimahesh)
INSERT INTO users (id, email, password_hash, full_name, raw_user_meta_data, is_verified)
VALUES (
  '15430c49-f28f-459e-ba3f-411b18519445',
  'hariharan@skyrovix.com',
  '$2b$10$bxTZ5YsCda5mi6eTctu05.sKz.OE3r1iZv4fNuNzR.O07onX/pQyu',
  'Hariharan S',
  '{"full_name": "Hariharan S"}',
  1
) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), full_name = VALUES(full_name);

INSERT INTO user_roles (id, user_id, role)
VALUES (UUID(), '15430c49-f28f-459e-ba3f-411b18519445', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin';

INSERT INTO profiles (id, full_name, email)
VALUES ('15430c49-f28f-459e-ba3f-411b18519445', 'Hariharan S', 'hariharan@skyrovix.com')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- Seed Core Tasks 1 to 5 for All Domains
INSERT INTO tasks (id, domain, task_number, title, description, resources) VALUES
(UUID(), 'fullstack', 1, 'Personal Portfolio Website', 'Build a responsive personal portfolio with React + Tailwind. Include Home, About, Projects, Contact.', 'MDN, React docs'),
(UUID(), 'fullstack', 2, 'REST API with CRUD', 'Build a Node.js/Express API with full CRUD on a "tasks" resource. Use MySQL or PostgreSQL.', 'Express docs'),
(UUID(), 'fullstack', 3, 'Authentication System', 'Add JWT or session-based auth (signup/login/logout) to your API + a React frontend.', ''),
(UUID(), 'fullstack', 4, 'Real-time Chat App', 'Build a real-time chat application with WebSockets or Socket.io.', ''),
(UUID(), 'fullstack', 5, 'Full Stack Capstone', 'Design + ship a full stack product of your choice (e.g. blog, task manager, e-commerce). Deploy live.', ''),

(UUID(), 'frontend', 1, 'Landing Page Clone', 'Pixel-perfect responsive clone of any modern SaaS landing page.', ''),
(UUID(), 'frontend', 2, 'Component Library', 'Build 8 reusable accessible components (Button, Modal, Tabs, Toast, etc.) with Tailwind.', ''),
(UUID(), 'frontend', 3, 'Dashboard UI', 'Build an analytics dashboard with charts (Recharts/Chart.js), filters, dark mode.', ''),
(UUID(), 'frontend', 4, 'Animated Web App', 'Use Framer Motion to build an interactive animated UI (e.g. onboarding flow, product showcase).', ''),
(UUID(), 'frontend', 5, 'Frontend Capstone', 'Ship a polished frontend product. Lighthouse score ≥ 90.', ''),

(UUID(), 'backend', 1, 'REST API Basics', 'Build a Node/Express API with CRUD + validation + error handling.', ''),
(UUID(), 'backend', 2, 'Database Design', 'Design a normalized relational schema for an e-commerce store. Implement migrations.', ''),
(UUID(), 'backend', 3, 'Authentication & Authorization', 'Implement JWT auth + role-based access control.', ''),
(UUID(), 'backend', 4, 'File Uploads & Email', 'Add S3/local uploads + transactional email (SMTP/Nodemailer).', ''),
(UUID(), 'backend', 5, 'Backend Capstone', 'Ship a production-grade backend with tests, docs (Swagger/Postman) and deployment.', ''),

(UUID(), 'datascience', 1, 'Exploratory Data Analysis', 'Pick a Kaggle dataset, do EDA with pandas + matplotlib/seaborn. Submit notebook.', ''),
(UUID(), 'datascience', 2, 'Data Cleaning Pipeline', 'Build a reproducible cleaning pipeline for a messy dataset.', ''),
(UUID(), 'datascience', 3, 'Predictive Model', 'Train + evaluate a regression or classification model. Report metrics.', ''),
(UUID(), 'datascience', 4, 'Dashboard / Visualization', 'Build an interactive dashboard with Streamlit or Plotly Dash.', ''),
(UUID(), 'datascience', 5, 'DS Capstone', 'End-to-end DS project: data → model → deployed app or report.', ''),

(UUID(), 'aiml', 1, 'ML Fundamentals', 'Implement linear regression + logistic regression from scratch in NumPy.', ''),
(UUID(), 'aiml', 2, 'Classification Project', 'Train a classifier (sklearn) on a real dataset. Report confusion matrix + F1.', ''),
(UUID(), 'aiml', 3, 'Neural Network', 'Build an image classifier with PyTorch or TensorFlow.', ''),
(UUID(), 'aiml', 4, 'LLM Application', 'Build an app using OpenAI / Gemini APIs (e.g. chatbot, summarizer, RAG).', ''),
(UUID(), 'aiml', 5, 'AI/ML Capstone', 'Ship an ML model behind a web UI. Document the pipeline.', ''),

(UUID(), 'uiux', 1, 'Design Research', 'Pick a problem, do user interviews/surveys, document personas + journey map.', ''),
(UUID(), 'uiux', 2, 'Wireframes', 'Low-fi wireframes for a mobile app (5+ screens) in Figma.', ''),
(UUID(), 'uiux', 3, 'High-Fidelity Mockups', 'High-fidelity Figma mockups with proper design system (colors, type, components).', ''),
(UUID(), 'uiux', 4, 'Interactive Prototype', 'Clickable Figma prototype with micro-interactions.', ''),
(UUID(), 'uiux', 5, 'UX Capstone', 'Full case study (research → wireframes → mockups → prototype → usability test).', ''),

(UUID(), 'python', 1, 'Python Basics Project', 'CLI tool of your choice (e.g. todo, currency converter, file organizer).', ''),
(UUID(), 'python', 2, 'Web Scraper', 'Scrape a website with requests + BeautifulSoup or Playwright; save to CSV.', ''),
(UUID(), 'python', 3, 'Flask/FastAPI App', 'Build a small web API with FastAPI.', ''),
(UUID(), 'python', 4, 'Automation Script', 'Automate a real-world task (email, file processing, reports).', ''),
(UUID(), 'python', 5, 'Python Capstone', 'Ship a Python project (web app, data tool, or library) with tests.', ''),

(UUID(), 'java', 1, 'Java Fundamentals', 'OOP project: design a Library Management System (classes, inheritance, interfaces).', ''),
(UUID(), 'java', 2, 'Collections & Streams', 'Build a data-processing app using Streams, Lambdas, Collections.', ''),
(UUID(), 'java', 3, 'Spring Boot REST API', 'Build a REST API with Spring Boot + JPA + MySQL.', ''),
(UUID(), 'java', 4, 'Authentication', 'Add JWT auth to your Spring Boot API.', ''),
(UUID(), 'java', 5, 'Java Capstone', 'Ship a full Spring Boot backend, deployed with documentation.', ''),

(UUID(), 'cybersecurity', 1, 'CIA Triad & Recon', 'Write a report on Confidentiality/Integrity/Availability + perform OSINT on a target you own.', ''),
(UUID(), 'cybersecurity', 2, 'Network Scanning', 'Use Nmap to scan + document open ports + services on a lab machine.', ''),
(UUID(), 'cybersecurity', 3, 'Web Vulnerability Lab', 'Solve OWASP Juice Shop / DVWA challenges (SQLi, XSS, CSRF). Submit writeups.', ''),
(UUID(), 'cybersecurity', 4, 'Password Cracking & Hashing', 'Use Hashcat/John on test hashes; explain salting + KDFs.', ''),
(UUID(), 'cybersecurity', 5, 'CyberSec Capstone', 'Full pentest report on a vulnerable VM (HackTheBox/TryHackMe).', ''),

(UUID(), 'digitalmarketing', 1, 'SEO Audit', 'Run a full SEO audit on a website (keywords, on-page, backlinks). Submit report.', ''),
(UUID(), 'digitalmarketing', 2, 'Social Media Strategy', '30-day content calendar for a brand of your choice (Instagram + LinkedIn).', ''),
(UUID(), 'digitalmarketing', 3, 'Google Ads Campaign', 'Plan a Google Ads campaign (keywords, ad copy, budget, KPIs).', ''),
(UUID(), 'digitalmarketing', 4, 'Email Marketing', 'Design a 5-email drip campaign + landing page.', ''),
(UUID(), 'digitalmarketing', 5, 'DM Capstone', 'Real campaign for a small business / portfolio site with measurable results.', '')
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description);

SET FOREIGN_KEY_CHECKS = 1;
