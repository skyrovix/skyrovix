import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password — Skyrovix Internship Portal" },
      { name: "description", content: "Create a new secure password for your Skyrovix portal account." },
    ],
  }),
  component: ResetPasswordPage,
});

type LinkStatus = "checking" | "valid" | "expired" | "no_session";

function extractAuthParams() {
  if (typeof window === "undefined") {
    return { error: null, errorCode: null, accessToken: null, refreshToken: null, code: null, tokenHash: null, type: null };
  }

  const hash = window.location.hash.replace(/^#/, "");
  const search = window.location.search.replace(/^\?/, "");

  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(search);

  const error =
    hashParams.get("error_description") ||
    hashParams.get("error") ||
    searchParams.get("error_description") ||
    searchParams.get("error");

  const errorCode = hashParams.get("error_code") || searchParams.get("error_code");

  const accessToken = hashParams.get("access_token") || searchParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token") || searchParams.get("refresh_token");
  const type = hashParams.get("type") || searchParams.get("type");

  const code = searchParams.get("code") || hashParams.get("code");
  const tokenHash = searchParams.get("token_hash") || hashParams.get("token_hash");

  return {
    error,
    errorCode,
    accessToken,
    refreshToken,
    code,
    tokenHash,
    type,
    rawHash: hash,
    rawSearch: search,
  };
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [linkStatus, setLinkStatus] = useState<LinkStatus>("checking");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const params = extractAuthParams();
      console.log("[ResetPassword] Inspecting URL parameters...", {
        hasError: Boolean(params.error || params.errorCode),
        hasAccessToken: Boolean(params.accessToken),
        hasCode: Boolean(params.code),
        hasTokenHash: Boolean(params.tokenHash),
        type: params.type,
      });

      // 1. Check for explicit error in URL (e.g. otp_expired, access_denied)
      if (params.error || params.errorCode) {
        console.warn("[ResetPassword] Error detected in URL:", params.error || params.errorCode);
        if (isMounted) setLinkStatus("expired");
        return;
      }

      // 2. If access_token and refresh_token are in the hash or query (standard recovery redirect)
      if (params.accessToken && params.refreshToken) {
        console.log("[ResetPassword] Found access_token and refresh_token, establishing session...");
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: params.accessToken,
            refresh_token: params.refreshToken,
          });

          if (error) {
            console.error("[ResetPassword] setSession failed:", error);
            if (isMounted) setLinkStatus("expired");
            return;
          }

          if (data?.session) {
            console.log("[ResetPassword] Session established via setSession for:", data.session.user?.email);
            if (isMounted) setLinkStatus("valid");
            return;
          }
        } catch (err) {
          console.error("[ResetPassword] Exception in setSession:", err);
        }
      }

      // 3. If PKCE code is in query params (?code=...)
      if (params.code) {
        console.log("[ResetPassword] Found PKCE code, exchanging for session...");
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
          if (error) {
            console.error("[ResetPassword] exchangeCodeForSession failed:", error);
            if (isMounted) setLinkStatus("expired");
            return;
          }

          if (data?.session) {
            console.log("[ResetPassword] Session established via exchangeCodeForSession for:", data.session.user?.email);
            if (isMounted) setLinkStatus("valid");
            return;
          }
        } catch (err) {
          console.error("[ResetPassword] Exception in exchangeCodeForSession:", err);
        }
      }

      // 4. If token_hash is in query params (?token_hash=...&type=recovery)
      if (params.tokenHash) {
        console.log("[ResetPassword] Found token_hash, verifying OTP...");
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: params.tokenHash,
            type: "recovery",
          });

          if (error) {
            console.error("[ResetPassword] verifyOtp failed:", error);
            if (isMounted) setLinkStatus("expired");
            return;
          }

          if (data?.session) {
            console.log("[ResetPassword] Session established via verifyOtp for:", data.session.user?.email);
            if (isMounted) setLinkStatus("valid");
            return;
          }
        } catch (err) {
          console.error("[ResetPassword] Exception in verifyOtp:", err);
        }
      }

      // 5. Check if there is already an active session (e.g. after refresh or previously established)
      try {
        const { data: sessData } = await supabase.auth.getSession();
        if (sessData?.session) {
          console.log("[ResetPassword] Found existing active session for:", sessData.session.user?.email);
          if (isMounted) setLinkStatus("valid");
          return;
        }
      } catch (err) {
        console.warn("[ResetPassword] getSession error:", err);
      }

      // 6. Listen to onAuthStateChange in case Supabase background listener fires
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("[ResetPassword] onAuthStateChange event:", event, Boolean(session));
        if (!isMounted) return;
        if (event === "PASSWORD_RECOVERY" || (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION"))) {
          setLinkStatus("valid");
        }
      });

      // 7. Timeout fallback: recheck session once more after 1.5 seconds
      const timer = setTimeout(async () => {
        if (!isMounted) return;
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            setLinkStatus("valid");
            return;
          }
        } catch {}

        const p = extractAuthParams();
        if (p.error || p.errorCode) {
          setLinkStatus("expired");
        } else {
          setLinkStatus("no_session");
        }
      }, 1500);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timer);
      };
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute password strength
  const strengthInfo = useMemo(() => {
    const pwd = newPassword;
    if (!pwd) return { score: 0, label: "", color: "bg-slate-200", text: "" };

    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1;

    if (score <= 1) {
      return { score: 1, label: "Weak", color: "bg-red-500", text: "text-red-500" };
    }
    if (score === 2 || score === 3) {
      return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
    }
    if (score === 4) {
      return { score: 3, label: "Good", color: "bg-blue-500", text: "text-blue-500" };
    }
    return { score: 4, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
  }, [newPassword]);

  // Validation flags
  const isLengthValid = newPassword.length >= 6;
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = isLengthValid && isMatch && !updating;

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isLengthValid) {
      setErrorMessage("Password must be at least 6 characters long.");
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter your new password.");
      toast.error("Passwords do not match.");
      return;
    }

    setUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("[ResetPassword] updateUser error:", error);
        setUpdating(false);
        if (
          error.message?.toLowerCase().includes("different from the old") ||
          error.message?.toLowerCase().includes("same as")
        ) {
          setErrorMessage("Your new password must be different from your previous password.");
          toast.error("Your new password must be different from your previous password.");
        } else if (
          error.message?.toLowerCase().includes("session") ||
          error.message?.toLowerCase().includes("auth") ||
          error.message?.toLowerCase().includes("jwt")
        ) {
          setErrorMessage("This password reset link has expired or is invalid. Please request a new one.");
          setLinkStatus("expired");
          toast.error("Session expired. Please request a new reset link.");
        } else {
          setErrorMessage(error.message || "Unable to reset your password. Please request a new reset link.");
          toast.error(error.message || "Unable to reset password.");
        }
        return;
      }

      // Password successfully updated!
      setUpdateSuccess(true);
      toast.success("Password updated successfully.");

      // Securely sign out the recovery session so user logs in cleanly with new credentials
      try {
        await supabase.auth.signOut();
      } catch (signOutErr) {
        console.warn("[ResetPassword] signOut error:", signOutErr);
      }

      // Redirect user to login page after short delay
      setTimeout(() => {
        navigate({ to: "/auth" });
      }, 2500);
    } catch (err: any) {
      console.error("[ResetPassword] Unexpected error:", err);
      setUpdating(false);
      const msg = err?.message || "An unexpected error occurred. Please request a new reset link.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#F8FAFC] to-[#EEF2FF] dark:from-[#0B1120] dark:to-[#0F172A] p-4 sm:p-6 lg:p-8">
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
        <div className="absolute -top-40 -left-40 size-[450px] rounded-full bg-[#07284a]/10 blur-[130px] dark:bg-[#07284a]/15 animate-drift-1" />
        <div className="absolute top-1/2 -right-40 size-[400px] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/5 animate-drift-2" />
        <div className="absolute -bottom-48 left-1/4 size-[550px] rounded-full bg-violet-400/8 blur-[140px] dark:bg-violet-600/5 animate-drift-1" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl overflow-hidden rounded-3xl border border-border/40 bg-white/40 shadow-2xl backdrop-blur-xl dark:bg-slate-900/40 dark:border-white/5 min-h-[600px] lg:grid lg:grid-cols-12">
        {/* ─── Column 1: Brand visual panel (Desktop only) ─── */}
        <div className="relative hidden lg:flex lg:col-span-6 flex-col justify-between p-10 overflow-hidden bg-gradient-to-br from-[#07284a] via-[#093561] to-[#0d4c8a] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_55%)] pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-blue-400/20 blur-[80px]" />

          <div className="relative z-10">
            <Link to="/"><Logo variant="white" /></Link>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md border border-white/10">
              <ShieldCheck className="size-3.5 text-emerald-300" />
              <span>Password Security</span>
            </div>

            <h2 className="font-display text-3xl font-extrabold leading-[1.2] tracking-tight">
              Create a new<br />
              <span className="text-blue-300">secure password.</span>
            </h2>

            <p className="text-sm text-white/80 leading-relaxed max-w-sm">
              Keep your Skyrovix student portal account safe by choosing a strong password with a mix of letters, numbers, and symbols.
            </p>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm space-y-2">
              <p className="text-xs font-bold text-blue-200">Security Tips:</p>
              <ul className="text-[11px] text-white/70 space-y-1.5 list-disc list-inside">
                <li>Minimum 6 characters (8+ recommended)</li>
                <li>Combine uppercase and lowercase letters</li>
                <li>Include at least one digit and special symbol</li>
                <li>Never share your credentials with anyone</li>
              </ul>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-white/40">
            <span>© {new Date().getFullYear()} Skyrovix</span>
            <span className="font-medium">Skyrovix Authentication</span>
          </div>
        </div>

        {/* ─── Column 2: Reset Form Panel ─── */}
        <div className="flex lg:col-span-6 flex-col justify-center p-6 sm:p-10 md:p-12 w-full">
          <div className="mb-6 flex justify-between items-center lg:hidden">
            <Link to="/"><Logo /></Link>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight">
                Reset Password
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Set a new password for your Skyrovix account.
              </p>
            </div>

            {/* Case 0: Checking link status */}
            {linkStatus === "checking" && (
              <div className="rounded-2xl border border-border/40 bg-white/60 dark:bg-slate-900/60 p-8 text-center space-y-3">
                <Loader2 className="size-7 animate-spin mx-auto text-[#07284a] dark:text-blue-400" />
                <p className="text-xs font-medium text-muted-foreground">
                  Verifying your password reset link...
                </p>
              </div>
            )}

            {/* Case 1: Update success screen */}
            {updateSuccess && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 p-6 space-y-4 text-center">
                <div className="mx-auto size-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                    Password updated successfully.
                  </h3>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                    Your password has been changed. Redirecting to sign in...
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#07284a] dark:text-blue-400 hover:underline"
                  >
                    Click here if you are not redirected automatically <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Case 2: Expired or Invalid Link */}
            {linkStatus === "expired" && !updateSuccess && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 dark:bg-red-500/10 p-6 space-y-4 text-center">
                <div className="mx-auto size-12 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                  <AlertTriangle className="size-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-red-900 dark:text-red-200">
                    Link Expired or Invalid
                  </h3>
                  <p className="text-xs text-red-800/80 dark:text-red-300/80 leading-relaxed">
                    This password reset link has expired or is invalid.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <Button asChild className="w-full brand-gradient text-white border-0 h-11 rounded-2xl font-bold gap-1.5 shadow-lg shadow-[#07284a]/15">
                    <Link to="/forgot-password">
                      Request New Reset Link <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Link
                    to="/auth"
                    className="inline-flex items-center justify-center text-xs font-semibold text-muted-foreground hover:text-foreground pt-1"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            )}

            {/* Case 3: No recovery session */}
            {linkStatus === "no_session" && !updateSuccess && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 p-6 space-y-4 text-center">
                <div className="mx-auto size-12 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <KeyRound className="size-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                    Session Not Found
                  </h3>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                    Please request a new password reset link.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <Button asChild className="w-full brand-gradient text-white border-0 h-11 rounded-2xl font-bold gap-1.5 shadow-lg shadow-[#07284a]/15">
                    <Link to="/forgot-password">
                      Request Password Reset <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Link
                    to="/auth"
                    className="inline-flex items-center justify-center text-xs font-semibold text-muted-foreground hover:text-foreground pt-1"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            )}

            {/* Case 4: Valid recovery session - Show reset password form */}
            {linkStatus === "valid" && !updateSuccess && (
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                {errorMessage && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-600 dark:text-red-400">
                    {errorMessage}
                  </div>
                )}

                {/* New Password */}
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">
                    New Password *
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password (min 6 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="h-11 rounded-xl border-border/60 bg-white dark:bg-slate-900/60 pl-9 pr-10"
                    />
                    <Lock className="absolute left-3 top-3.5 size-4 text-muted-foreground/60 pointer-events-none" />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Password strength meter */}
                  {newPassword.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Strength:</span>
                        <span className={`font-bold ${strengthInfo.text}`}>
                          {strengthInfo.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                        <div className={`h-full rounded-full transition-all ${strengthInfo.score >= 1 ? strengthInfo.color : "bg-transparent"}`} />
                        <div className={`h-full rounded-full transition-all ${strengthInfo.score >= 2 ? strengthInfo.color : "bg-transparent"}`} />
                        <div className={`h-full rounded-full transition-all ${strengthInfo.score >= 3 ? strengthInfo.color : "bg-transparent"}`} />
                        <div className={`h-full rounded-full transition-all ${strengthInfo.score >= 4 ? strengthInfo.color : "bg-transparent"}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Confirm New Password *
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="h-11 rounded-xl border-border/60 bg-white dark:bg-slate-900/60 pl-9 pr-10"
                    />
                    <Lock className="absolute left-3 top-3.5 size-4 text-muted-foreground/60 pointer-events-none" />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Matching confirmation feedback */}
                  {confirmPassword.length > 0 && (
                    <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${isMatch ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-red-500 font-medium"}`}>
                      {isMatch ? (
                        <>
                          <CheckCircle2 className="size-3.5" /> Passwords match
                        </>
                      ) : (
                        <>
                          <XCircle className="size-3.5" /> Passwords do not match
                        </>
                      )}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full brand-gradient text-white border-0 h-11 rounded-2xl font-bold gap-1.5 shadow-lg shadow-[#07284a]/15 mt-2"
                  disabled={!canSubmit}
                >
                  {updating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <div className="pt-1 text-center">
                  <Link
                    to="/auth"
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel and Return to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
