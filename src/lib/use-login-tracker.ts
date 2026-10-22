import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/db-client";
import { getDeviceInfo } from "@/lib/device-info";

let currentSessionId: string | null = null;

export function useLoginTracker() {
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initRef = useRef(false);
  const markOfflineRef = useRef<((input: { data: { sessionId: string } }) => Promise<any>) | null>(null);

  const startTracking = useCallback(async (userId: string) => {
    if (initRef.current) return;
    initRef.current = true;

    const { data: app } = await supabase
      .from("applications")
      .select("intern_id, domain, college, email, full_name")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { device, browser, os } = getDeviceInfo();

    const { trackLogin } = await import("@/lib/login-tracker");
    const result = await trackLogin({
      data: {
        studentId: userId,
        internId: app?.intern_id,
        studentName: app?.full_name,
        email: app?.email,
        domain: app?.domain,
        college: app?.college,
        device,
        browser,
        os,
      }
    });

    if (result.sessionId) {
      currentSessionId = result.sessionId;

      // Store markOffline reference for beforeunload
      const { markOffline } = await import("@/lib/login-tracker");
      markOfflineRef.current = markOffline;

      // Heartbeat every 2 minutes
      heartbeatRef.current = setInterval(async () => {
        const { heartbeat } = await import("@/lib/login-tracker");
        await heartbeat({ data: { sessionId: currentSessionId! } });
      }, 120_000);
    }
  }, []);

  const stopTracking = useCallback(async () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (currentSessionId) {
      const { markOffline } = await import("@/lib/login-tracker");
      await markOffline({ data: { sessionId: currentSessionId } });
      currentSessionId = null;
    }
    initRef.current = false;
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSessionId && markOfflineRef.current) {
        markOfflineRef.current({ data: { sessionId: currentSessionId } });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      stopTracking();
    };
  }, [stopTracking]);

  return { startTracking, stopTracking };
}

