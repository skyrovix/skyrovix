# Skyrovix Comprehensive Data Backup (CSV Format)
**Export Timestamp:** 2026-10-26T14:55:23.414Z  
**Database Host:** Supabase PostgreSQL (`db.eesiuqeswydlmwhecrcy.supabase.co`)  
**Total Records Exported:** 19,701+ records across 49 tables and 8 curated categories  

---

## Directory Organization & Catalog

### 📁 1_students_data/
| File Name | Description | Rows |
|---|---|---|
| `students_master_complete.csv` | Fully enriched master student records with contact, domains, intern IDs, total submissions, cert counts, login stats | 1074 |
| `student_profiles.csv` | Raw public profiles table | 1074 |
| `student_applications.csv` | Full internship application submissions | 791 |
| `student_roles.csv` | User role mappings | 1074 |

### 📁 2_task_and_all_submissions/
| File Name | Description | Rows |
|---|---|---|
| `task_submissions_master.csv` | Comprehensive task submissions with student name, intern ID, domain, task details, links, status, feedback | 857 |
| `submission_history_audit_log.csv` | Complete audit trail of status transitions (submitted, approved, rejected, resubmitted) | 1040 |
| `internship_tasks_catalog.csv` | Full catalog of assigned curriculum tasks across all domains | 412 |
| `project_challenges_submissions.csv` | Project challenge submissions with git repo, demo URL, scores | 8 |
| `project_evaluations.csv` | Evaluation scores and mentor review criteria | 4 |
| `course_task_submissions.csv` | Submissions within specific courses | 0 |

### 📁 3_certificates_issued/
| File Name | Description | Rows |
|---|---|---|
| `internship_certificates_master.csv` | All issued internship certificates with certificate IDs, verification hashes, student and domain details | 34 |
| `course_certificates.csv` | Course completion certificates | 12 |
| `project_certificates.csv` | Project challenge awards and certificates | 2 |
| `all_certificates_consolidated.csv` | Unified master list of EVERY certificate issued across internships, courses, and projects | 48 |

### 📁 4_courses_details/
| File Name | Description | Rows |
|---|---|---|
| `courses_master.csv` | Master list of all available courses, categories, levels, and pricing | 19 |
| `course_curriculum_topics.csv` | Detailed list of 435 lessons/topics, order index, durations, and video links | 435 |
| `course_enrollments.csv` | Student course enrollments, completion percentage, enrolled & completed timestamps | 82 |
| `course_lesson_progress.csv` | Exact progress logs for each lesson completed by students | 549 |
| `quiz_attempts.csv` | Student quiz attempt records, scores, passing status | 28 |
| `project_challenges_catalog.csv` | Full challenges catalog with problem statements and requirements | 6 |

### 📁 5_feedbacks_and_reviews/
| File Name | Description | Rows |
|---|---|---|
| `platform_reviews_and_feedbacks.csv` | Student platform testimonials, star ratings, and review feedback | 6 |
| `task_review_feedbacks.csv` | All task submissions containing mentor evaluation remarks, notes, and feedback | 345 |
| `fee_audit_logs_and_feedback.csv` | Admin fee transaction audit logs and remarks | 13 |

### 📁 6_payment_details/
| File Name | Description | Rows |
|---|---|---|
| `payments_manual_utr.csv` | All manual UTR payments with verification status, student info, receipt screenshot links | 32 |
| `cashfree_orders.csv` | Cashfree online gateway orders, payment methods, session IDs, transaction statuses | 67 |
| `payment_records_ledger.csv` | Financial ledger records | 31 |
| `fee_settings.csv` | Current platform fee configurations | 2 |
| `coupons_and_discounts.csv` | Active & past promotional coupon codes | 1 |

### 📁 7_analytics_and_logs/
| File Name | Description | Rows |
|---|---|---|
| `login_sessions_analytics.csv` | Student login session records with IP addresses, browser, OS, city, country, session durations | 727 |
| `email_delivery_logs.csv` | All email dispatch logs, delivery statuses, subjects, document types | 194 |
| `domain_distribution_analytics.csv` | Aggregated performance metrics and completion rates grouped by internship domain | 27 |
| `leaderboard_rankings.csv` | Top ranked student gamification leaderboard and points | 12 |
| `storage_files_catalog.csv` | Index of all 999 files in Supabase storage (certificates, task submissions, receipts) with direct URLs | 999 |
| `platform_overall_summary_kpis.csv` | Executive KPIs summarizing entire database counts | 24 |

### 📁 8_all_database_tables_raw/
Contains clean, raw 1:1 CSV exports for all 49 database tables across `auth`, `public`, and `storage` schemas.

---
