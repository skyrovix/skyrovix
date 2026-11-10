import { useEffect, useState, useCallback } from "react";
import { supabase, type User } from "@/lib/db-client";

export type Role = "admin" | "user" | null;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

    // Quick hydrate from cached session storage after initial mount
    try {
      const s = localStorage.getItem("skyrovix_auth_session");
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed.user && !cancelled) {
          setUser(parsed.user);
          if (parsed.user.email === "hariharan@skyrovix.com") {
            setRole("admin");
          } else {
            setRole((parsed.user.app_metadata?.role as Role) ?? "user");
          }
          setLoading(false);
        }
      }
    } catch {
      // ignore
    }

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
