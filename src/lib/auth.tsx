import { useEffect, useState, useCallback } from "react";
import { supabase, type User } from "@/lib/db-client";

export type Role = "admin" | "user" | null;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  const loadRole = useCallback(async (uid: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).maybeSingle();
    setRole((data?.role as Role) ?? "user");
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadRole(data.session.user.id);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadRole(session.user.id);
      else setRole(null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadRole]);

  return { user, role, loading, isAdmin: role === "admin" };
}
