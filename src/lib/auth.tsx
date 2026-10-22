import { useEffect, useState, useCallback } from "react";
import { supabase, type User } from "@/lib/db-client";

export type Role = "admin" | "user" | null;

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const s = localStorage.getItem("skyrovix_auth_session");
      return s ? JSON.parse(s).user : null;
    } catch { return null; }
  });

  const [role, setRole] = useState<Role>(() => {
    if (typeof window === "undefined") return null;
    try {
      const s = localStorage.getItem("skyrovix_auth_session");
      const u = s ? JSON.parse(s).user : null;
      if (u?.email === "hariharan@skyrovix.com") return "admin";
      return (u?.app_metadata?.role as Role) ?? (u ? "user" : null);
    } catch { return null; }
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return !localStorage.getItem("skyrovix_auth_session");
    } catch { return true; }
  });

  const loadRole = useCallback(async (u: User) => {
    if (u.email === "hariharan@skyrovix.com") {
      setRole("admin");
      return;
    }
    const cachedRole = (u.app_metadata?.role as Role) || "user";
    setRole(cachedRole);
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) loadRole(u);
      else setRole(null);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadRole(u);
      else setRole(null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadRole]);

  return { user, role, loading, isAdmin: role === "admin" };
}
