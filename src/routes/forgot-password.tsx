import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/db-client";
import { getProductionResetPasswordRedirectUrl } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Sparkles, ArrowRight, ArrowLeft, Loader2, Mail, CheckCircle2, Shield } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Forgot Password — Skyrovix Internship Portal" },
      { name: "description", content: "Reset your Skyrovix portal account password securely." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = getProductionResetPasswordRedirectUrl();
      console.log("[ForgotPassword] Requesting resetPasswordForEmail with redirectTo:", redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("[ForgotPassword] Supabase error:", error);
        setErrorMessage(error.message || "Unable to send reset link. Please try again later.");
        toast.error(error.message || "Unable to send reset link.");
      } else {
        setSubmitted(true);
        toast.success("If the email is registered, a password reset link has been sent.");
      }
    } catch (err: any) {
      console.error("[ForgotPassword] Unexpected error:", err);
      const msg = err?.message || "An unexpected error occurred. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
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
              <Shield className="size-3.5 text-blue-300" />
              <span>Secure Account Recovery</span>
            </div>

            <h2 className="font-display text-3xl font-extrabold leading-[1.2] tracking-tight">
              Regain access to your<br />
              <span className="text-blue-300">Skyrovix portal.</span>
            </h2>

            <p className="text-sm text-white/80 leading-relaxed max-w-sm">
              Safely reset your password using Supabase-authenticated recovery links sent directly to your registered email address.
            </p>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-200">
                <Sparkles className="size-4 text-amber-300 shrink-0" />
                <span>Encrypted single-use recovery link</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                For security reasons, reset links are cryptographically signed and expire automatically.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-white/40">
            <span>© {new Date().getFullYear()} Skyrovix</span>
            <span className="font-medium">Skyrovix Authentication</span>
          </div>
        </div>

        {/* ─── Column 2: Forgot Password Form Panel ─── */}
        <div className="flex lg:col-span-6 flex-col justify-center p-6 sm:p-10 md:p-12 w-full">
          <div className="mb-6 flex justify-between items-center lg:hidden">
            <Link to="/"><Logo /></Link>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight">
                Forgot Password?
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Enter your registered email address and we'll send you a password reset link.
              </p>
            </div>

            {submitted ? (
              /* Success confirmation state */
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 p-6 space-y-4 text-center">
                <div className="mx-auto size-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                    Reset Link Dispatched
                  </h3>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                    If the email is registered, a password reset link has been sent.
                  </p>
                </div>
                <div className="rounded-xl bg-background/60 p-3.5 border border-border/40 text-left space-y-1">
                  <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="size-3.5 text-blue-500" />
                    Sent to: <span className="font-mono font-normal text-muted-foreground">{email}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Check your inbox and spam folder for the password reset email.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 rounded-xl text-xs font-semibold"
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                    }}
                  >
                    Try another email address
                  </Button>
                  <Link
                    to="/auth"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#07284a] dark:text-blue-400 hover:underline pt-1"
                  >
                    <ArrowLeft className="size-3.5" /> Back to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleResetRequest} className="space-y-4">
                {errorMessage && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-600 dark:text-red-400">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Registered Email Address *
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      name="email"
                      type="email"
                      placeholder="name@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="h-11 rounded-xl border-border/60 bg-white dark:bg-slate-900/60 pl-9"
                    />
                    <Mail className="absolute left-3 top-3.5 size-4 text-muted-foreground/60 pointer-events-none" />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full brand-gradient text-white border-0 h-11 rounded-2xl font-bold gap-1.5 shadow-lg shadow-[#07284a]/15 mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="size-3.5" /> Back to Sign In
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
