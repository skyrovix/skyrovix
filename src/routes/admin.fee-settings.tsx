import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/db-client";
import { useAuth } from "@/lib/auth";
import { FeeSettingsSection } from "@/components/admin/FeeSettingsSection";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/admin/fee-settings")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data: sessionData } = await supabase.auth.getSession();
    let user: any = sessionData?.session?.user;
    if (!user) {
      const { data: userData } = await supabase.auth.getUser();
      user = userData?.user;
    }
    if (!user) throw redirect({ to: "/auth" });

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    if (role?.role !== "admin") throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Fee Settings — Skyrovix Admin" }] }),
  component: AdminFeeSettingsPage,
});

function AdminFeeSettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Bar */}
      <header className="h-16 border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="flex items-center gap-2">
            <Logo />
            <span className="text-xs font-bold uppercase tracking-wider text-primary border border-primary/20 px-2 py-0.5 rounded-md bg-primary/5">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 h-9 border-border/60">
              <ArrowLeft className="size-3.5" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        <FeeSettingsSection adminId={user.id} />
      </main>
    </div>
  );
}
