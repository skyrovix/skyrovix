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

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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

    const { data: session, error } = await (supabaseAdmin
      .from("login_sessions" as any) as any)
      .insert({
        student_id: studentId,
        intern_id: internId || null,
        student_name: studentName || null,
        email: email || null,
        domain: domain || null,
        college: college || null,
        login_time: new Date().toISOString(),
        last_active: new Date().toISOString(),
        status: "online",
        ip_address: ip || null,
        device: device || null,
        browser: browser || null,
        os: os || null,
        country: country || null,
        state: state || null,
        city: city || null,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, sessionId: session?.id };
  });

export const heartbeat = createServerFn({ method: "POST" })
  .validator((d: any) => d as HeartbeatInput)
  .handler(async ({ data }) => {
    const { sessionId } = data;
    if (!sessionId) return { success: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await (supabaseAdmin
      .from("login_sessions" as any) as any)
      .update({ last_active: new Date().toISOString() })
      .eq("id", sessionId);

    return { success: true };
  });

export const markOffline = createServerFn({ method: "POST" })
  .validator((d: any) => d as MarkOfflineInput)
  .handler(async ({ data }) => {
    const { sessionId } = data;
    if (!sessionId) return { success: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await (supabaseAdmin
      .from("login_sessions" as any) as any)
      .update({
        status: "offline",
        logout_time: new Date().toISOString(),
        last_active: new Date().toISOString(),
      })
      .eq("id", sessionId);

    return { success: true };
  });

export const markStaleSessionsOffline = createServerFn({ method: "POST" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data: stale } = await (supabaseAdmin
      .from("login_sessions" as any) as any)
      .update({
        status: "offline",
      })
      .eq("status", "online")
      .lt("last_active", cutoff)
      .select("id");

    return { success: true, markedCount: stale?.length ?? 0 };
  });
