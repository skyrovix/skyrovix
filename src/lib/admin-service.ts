import { createServerFn } from "@tanstack/react-start";

type DeleteResult = { success: boolean; error?: string };

export const deleteInternshipApplication = createServerFn({ method: "POST" })
  .validator((d: any) => d as { applicationId: string })
  .handler(async ({ data }): Promise<DeleteResult> => {
    const { deleteInternshipApplicationServer } = await import("@/lib/admin-service.server");
    return deleteInternshipApplicationServer(data.applicationId);
  });

export const deleteCourseEnrollment = createServerFn({ method: "POST" })
  .validator((d: any) => d as { enrollmentId: string })
  .handler(async ({ data }): Promise<DeleteResult> => {
    const { deleteCourseEnrollmentServer } = await import("@/lib/admin-service.server");
    return deleteCourseEnrollmentServer(data.enrollmentId);
  });

export interface AdminStudentAccount {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  year: string;
  photo_url: string | null;
  created_at: string;
  updated_at?: string | null;
  has_application: boolean;
  application_id: string | null;
  domain: string | null;
  intern_id: string | null;
  application_status: string | null;
  offer_issued_at: string | null;
  is_online: boolean;
  last_active: string | null;
  device?: string | null;
  browser?: string | null;
}

export const getAdminStudents = createServerFn({ method: "GET" })
  .handler(async (): Promise<AdminStudentAccount[]> => {
    const { getAdminStudentsServer } = await import("@/lib/admin-service.server");
    return getAdminStudentsServer();
  });

export interface CourseStudentEnrollment {
  enrollment_id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  status: string;
  progress_percent: number;
  current_topic_id?: string | null;
  started_at: string;
  completed_at?: string | null;
  created_at: string;
  certificate?: {
    id: string;
    certificate_id: string;
    score: number;
    issued_at: string;
  } | null;
}

export interface AdminCourseItem {
  id: string;
  slug: string;
  name: string;
  short_description?: string | null;
  icon?: string | null;
  domain: string;
  total_topics: number;
  total_tasks: number;
  quiz_marks: number;
  pass_marks: number;
  quiz_duration_min: number;
  duration_weeks: number;
  difficulty: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string | null;

  // Real-time enrollment analytics
  enrollment_count: number;
  completed_count: number;
  in_progress_count: number;
  avg_progress: number;
  cert_count: number;
  students: CourseStudentEnrollment[];
}

export const getAdminCourses = createServerFn({ method: "GET" })
  .handler(async (): Promise<AdminCourseItem[]> => {
    const { getAdminCoursesServer } = await import("@/lib/admin-service.server");
    return getAdminCoursesServer();
  });

export const toggleCoursePublish = createServerFn({ method: "POST" })
  .validator((d: any) => d as { courseId: string; isPublished: boolean })
  .handler(async ({ data }) => {
    const { toggleCoursePublishServer } = await import("@/lib/admin-service.server");
    return toggleCoursePublishServer(data);
  });

export const syncApplicationsEmailStatus = createServerFn({ method: "POST" })
  .handler(async (): Promise<{ success: boolean; count: number; error?: string }> => {
    const { syncApplicationsEmailStatusServer } = await import("@/lib/admin-service.server");
    return syncApplicationsEmailStatusServer();
  });



