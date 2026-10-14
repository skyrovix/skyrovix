import { createServerFn } from "@tanstack/react-start";

type TrackLoginInput = {
  studentId: string;
  internId?: string;
  studentName?: string;
  email?: string;
  domain?: string;
  college?: string;
  device?: string;
  browser?: string;
  os?: string;
};

type HeartbeatInput = {
  sessionId: string;
};

type MarkOfflineInput = {
  sessionId: string;
};

export const trackLogin = createServerFn({ method: "POST" })
  .validator((d: any) => d as TrackLoginInput)
  .handler(async ({ data, request }: { data: TrackLoginInput; request?: any }) => {
    const { studentId, internId, studentName, email, domain, college, device, browser, os } = data;
    if (!studentId) return { success: false, error: "Student ID required" };

    const { dbQuery } = await import("@/lib/db.server");

    const headers = request?.headers;
    const ip = headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim()
      || headers?.get?.("x-real-ip") || "";

    let country = "", state = "", city = "";
    if (ip && ip !== "::1" && ip !== "127.0.0.1") {
      try {
        const res = await fetch(`http://ip-api.com/json/${ip}`, { signal: AbortSignal.timeout(3000) });
        const geo = await res.json() as any;
        if (geo.status === "success") {
          country = geo.country || "";
          state = geo.regionName || "";
          city = geo.city || "";
        }
      } catch {}
    }

    try {
      const crypto = await import("crypto");
      const sessionId = crypto.randomUUID();
      await dbQuery(
        `INSERT INTO public.login_sessions 
         (id, student_id, intern_id, student_name, email, domain, college, login_time, last_active, status, ip_address, device, browser, os, country, state, city)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), 'online', $8, $9, $10, $11, $12, $13, $14)`,
        [
          sessionId,
          studentId,
          internId || null,
          studentName || null,
          email || null,
          domain || null,
          college || null,
          ip || null,
          device || null,
          browser || null,
          os || null,
          country || null,
          state || null,
          city || null,
        ]
      );
      return { success: true, sessionId };
    } catch (err: any) {
      console.error("[login-tracker] Error tracking login:", err);
      return { success: false, error: err.message };
    }
  });

export const heartbeat = createServerFn({ method: "POST" })
  .validator((d: any) => d as HeartbeatInput)
  .handler(async ({ data }) => {
    const { sessionId } = data;
    if (!sessionId) return { success: false };

    try {
      const { dbQuery } = await import("@/lib/db.server");
      await dbQuery("UPDATE public.login_sessions SET last_active = NOW() WHERE id = $1", [sessionId]);
      return { success: true };
    } catch {
      return { success: false };
    }
  });

export const markOffline = createServerFn({ method: "POST" })
  .validator((d: any) => d as MarkOfflineInput)
  .handler(async ({ data }) => {
    const { sessionId } = data;
    if (!sessionId) return { success: false };

    try {
      const { dbQuery } = await import("@/lib/db.server");
      await dbQuery(
        "UPDATE public.login_sessions SET status = 'offline', logout_time = NOW(), last_active = NOW() WHERE id = $1",
        [sessionId]
      );
      return { success: true };
    } catch {
      return { success: false };
    }
  });

export const markStaleSessionsOffline = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const { dbQuery } = await import("@/lib/db.server");
      const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const res = await dbQuery(
        "UPDATE public.login_sessions SET status = 'offline' WHERE status = 'online' AND last_active < $1 RETURNING id",
        [cutoff]
      );
      return { success: true, markedCount: res.rowCount ?? 0 };
    } catch {
      return { success: false, markedCount: 0 };
    }
  });
