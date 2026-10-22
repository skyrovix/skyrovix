import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/db-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { GraduationCap, Sparkles, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { useLoginTracker } from "@/lib/use-login-tracker";
import { getProductionAuthRedirectUrl, getPublicSiteUrl, getForgotPasswordUrl } from "@/lib/constants";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in — Skyrovix Internship Portal" }, { name: "description", content: "Sign in or create your Skyrovix internship account." }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const redirect = search.redirect ?? "/dashboard";
  const [loading, setLoading] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const { startTracking } = useLoginTracker();

  const checkRoleAndRedirect = async (userId: string, userEmail?: string, appMetadata?: any) => {
    const email = (userEmail || "").trim().toLowerCase();
    if (email === "hariharan@skyrovix.com" || appMetadata?.role === "admin") {
      window.location.href = "/admin";
      return;
    }
    window.location.href = redirect;
  };

  useEffect(() => {
    // Scrub any sensitive params that leaked into the URL
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let dirty = false;
      for (const key of ["email", "password", "name"]) {
        if (url.searchParams.has(key)) { url.searchParams.delete(key); dirty = true; }
      }
      if (dirty) window.history.replaceState({}, "", url.pathname + (url.search ? url.search : "") + url.hash);

      // Fast check from local storage
      const stored = localStorage.getItem("skyrovix_auth_session");
      if (stored) {
        try {
          const u = JSON.parse(stored).user;
          if (u?.email === "hariharan@skyrovix.com" || u?.app_metadata?.role === "admin") {
            window.location.href = "/admin";
            return;
          }
        } catch {}
      }
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        checkRoleAndRedirect(data.user.id, data.user.email, data.user.app_metadata);
      }
    });
  }, [redirect]);

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const rawEmail = String(fd.get("email") || "").trim().toLowerCase();
    const password = String(fd.get("password") || "").trim();

    console.log("[Auth] Attempting sign-in for:", rawEmail);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: rawEmail,
      password,
    });

    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    if (authData?.user) {
      startTracking(authData.user.id);
      await checkRoleAndRedirect(authData.user.id, authData.user.email ?? rawEmail, authData.user.app_metadata);
    } else {
      window.location.href = redirect;
    }
  };

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      options: { emailRedirectTo: getProductionAuthRedirectUrl(), data: { full_name: String(fd.get("name")) } },
    });
    setLoading(false);
    if (error) return toast.error(error.message);

    if (data?.session) {
      toast.success("Account created! You're signed in.");
      navigate({ to: redirect });
    } else {
      toast.success("Registration successful! Please check your email for the confirmation link to activate your account.", { duration: 10000 });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf8f2] dark:bg-[#181619] p-4 sm:p-6 lg:p-8">
      {/* CSS Keyframes for drift background blobs */}
      <style>{`
        @keyframes drift-sphere-1 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, -60px) scale(1.15); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes drift-sphere-2 {
          0% { transform: translate(0px, 0px) scale(1.1); }
          50% { transform: translate(-50px, 50px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1.1); }
        }
        .animate-drift-1 {
          animation: drift-sphere-1 20s infinite alternate ease-in-out;
        }
        .animate-drift-2 {
          animation: drift-sphere-2 16s infinite alternate ease-in-out;
        }
      `}</style>

      {/* Backdrop glowing spheres */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-[450px] rounded-full bg-[#f95c4b]/12 blur-[130px] animate-drift-1" />
        <div className="absolute top-1/2 -right-40 size-[400px] rounded-full bg-[rgb(139,92,246)]/12 blur-[120px] animate-drift-2" />
        <div className="absolute -bottom-48 left-1/4 size-[550px] rounded-full bg-[rgb(242,61,224)]/10 blur-[140px] animate-drift-1" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl overflow-hidden rounded-3xl border border-border/40 bg-white/40 shadow-2xl backdrop-blur-xl dark:bg-slate-900/40 dark:border-white/5 min-h-[640px] lg:grid lg:grid-cols-12">
        {/* ─── Column 1: Brand visual panel (Desktop only) ─── */}
        <div className="relative hidden lg:flex lg:col-span-6 flex-col justify-between p-10 overflow-hidden bg-gradient-to-br from-[#181619] via-[#201d22] to-[#181619] border-r border-white/10 text-white">
          {/* Subtle grid layout overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_55%)] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-blue-400/20 blur-[80px]" />
          
          <div className="relative z-10">
            <Link to="/"><Logo variant="white" /></Link>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md border border-white/10">
              <Sparkles className="size-3.5 text-amber-300 animate-pulse" />
              <span>MSME Registered Internship Platform</span>
            </div>
            
            <h2 className="font-display text-3xl font-extrabold leading-[1.2] tracking-tight">
              Build real projects.<br />
              <span className="text-[#ee9590]">Earn verified credentials.</span>
            </h2>
            
            <p className="text-sm text-white/80 leading-relaxed max-w-sm">
              Complete task-based virtual internships, receive detailed mentor code feedback, and unlock QR-coded certificates to power your career.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 text-center">
              <div className="rounded-2xl bg-white/5 border border-white/5 p-3.5 backdrop-blur-sm">
                <p className="text-2xl font-black text-[#ee9590]">10+</p>
                <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider mt-0.5">Domains</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/5 p-3.5 backdrop-blur-sm">
                <p className="text-2xl font-black text-[#ee9590]">50+</p>
                <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider mt-0.5">Tasks</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/5 p-3.5 backdrop-blur-sm">
                <p className="text-2xl font-black text-[#ee9590]">100%</p>
                <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider mt-0.5">Online</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-white/40">
            <span>© {new Date().getFullYear()} Skyrovix</span>
            <span className="font-medium">Registered IT Company</span>
          </div>
        </div>

        {/* ─── Column 2: Authentication Form Panel ─── */}
        <div className="flex lg:col-span-6 flex-col justify-center p-6 sm:p-10 md:p-12 w-full">
          <div className="mb-6 flex justify-between items-center lg:hidden">
            <Link to="/"><Logo /></Link>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight">Portal Gateway</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Access your virtual internship task submissions panel.</p>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted/60 p-1">
                <TabsTrigger value="signin" className="rounded-xl font-bold py-2 text-xs transition-all">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl font-bold py-2 text-xs transition-all">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="mt-4">
                <form onSubmit={signIn} method="post" action="?" className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground">Registered Email</Label>
                    <Input name="email" type="email" placeholder="name@college.edu" required className="mt-1.5 h-11 rounded-xl border-border/60 bg-white" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-muted-foreground">Account Password</Label>
                      <a
                        href={getForgotPasswordUrl()}
                        className="text-xs font-semibold text-[#07284a] dark:text-blue-400 hover:underline transition-colors"
                      >
                        Forgot Password?
                      </a>
                    </div>
                    <div className="relative mt-1.5">
                      <Input
                        name="password"
                        type={showSignInPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        className="h-11 rounded-xl border-border/60 bg-white pr-10"
                      />
                      <button
                        type="button"
                        aria-label={showSignInPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                      >
                        {showSignInPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full brand-gradient text-white border-0 h-11 rounded-2xl font-bold gap-1.5 shadow-lg shadow-[#07284a]/15 mt-2" disabled={loading}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <>Access Dashboard <ArrowRight className="size-4" /></>}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-4">
                <form onSubmit={signUp} method="post" action="?" className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground">Your Full Name</Label>
                    <Input name="name" type="text" placeholder="As required on certificate" required className="mt-1.5 h-11 rounded-xl border-border/60 bg-white" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground">Preferred Email</Label>
                    <Input name="email" type="email" placeholder="name@college.edu" required className="mt-1.5 h-11 rounded-xl border-border/60 bg-white" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground">Set Secure Password (min 6 chars)</Label>
                    <div className="relative mt-1.5">
                      <Input
                        name="password"
                        type={showSignUpPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        minLength={6}
                        required
                        className="h-11 rounded-xl border-border/60 bg-white pr-10"
                      />
                      <button
                        type="button"
                        aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                      >
                        {showSignUpPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full brand-gradient text-white border-0 h-11 rounded-2xl font-bold gap-1.5 shadow-lg shadow-[#07284a]/15 mt-2" disabled={loading}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <>Register Account <GraduationCap className="size-4" /></>}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
