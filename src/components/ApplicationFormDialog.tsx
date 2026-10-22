import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DOMAINS, DURATIONS, durationConfig, getDomainTaskCount, generateInternId, getDomain, getAvailableDurations } from "@/lib/constants";
import { validateCoupon } from "@/lib/coupons";
import { supabase } from "@/lib/db-client";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getPublicFeeSettings, submitApplicationServer, type PublicFeeSettings } from "@/lib/fee-service";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Sparkles, IndianRupee, Crown, Lock, Check, ShieldCheck, Gift } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { INDIA_STATES, STATE_DISTRICTS } from "@/lib/india-locations";
import { PaymentSummaryDialog } from "@/components/payment/PaymentSummaryDialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDomain?: string;
  onSuccess?: () => void;
}

export function ApplicationFormDialog({ open, onOpenChange, defaultDomain, onSuccess }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applyDomain, setApplyDomain] = useState(defaultDomain ?? "");
  const [applyDuration, setApplyDuration] = useState(1);
  const [planType, setPlanType] = useState<"standard" | "premium">("standard");
  const [applying, setApplying] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discountType: "percentage" | "fixed" | "free";
    discountValue: number;
    discount: string;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{
    open: boolean;
    productType?: "application" | "premium_plan";
    applicationId: string;
    productService: string;
    amount: number;
    discountAmount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    couponCode?: string | null;
  } | null>(null);

  // Location and Hear about us fields
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [hearAbout, setHearAbout] = useState("");
  const [referralName, setReferralName] = useState("");

  const { data: feeSettings } = useQuery<PublicFeeSettings>({
    queryKey: ["public-fee-settings"],
    queryFn: () => getPublicFeeSettings(),
    staleTime: 5000,
    refetchInterval: 10000,
  });

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const result = await validateCoupon(couponCode.trim(), applyDomain || undefined);
      if (result.valid) {
        setCouponApplied({
          code: result.code!,
          discountType: result.discountType as any,
          discountValue: Number(result.discountValue || 0),
          discount: result.discountType === "percentage" ? `${result.discountValue}% OFF` : `₹${result.discountValue} OFF`,
        });
        toast.success(`Coupon applied! ${result.discountType === "percentage" ? `${result.discountValue}%` : `₹${result.discountValue}`} discount`);
      } else {
        setCouponApplied(null);
        toast.error(result.error || "Invalid coupon");
      }
    } catch {
      toast.error("Failed to validate coupon");
      setCouponApplied(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponApplied(null);
  };

  const reset = () => {
    setApplyDomain(defaultDomain ?? "");
    setApplyDuration(1);
    setPlanType("standard");
    setPhotoFile(null);
    setCouponCode("");
    setCouponApplied(null);
    setPendingPayment(null);
    setCountry("India");
    setState("");
    setDistrict("");
    setCity("");
    setPincode("");
    setHearAbout("");
    setReferralName("");
  };

  const currentDomain = defaultDomain || applyDomain;
  const availableDurations = getAvailableDurations(currentDomain);

  const isPremiumPlanGlobalEnabled = Boolean(
    feeSettings?.premiumPlan?.isEnabled ?? feeSettings?.premiumPlan?.enabled ?? false
  );

  const handleDurationChange = (val: number) => {
    setApplyDuration(val);
    if (!isPremiumPlanGlobalEnabled || currentDomain !== "fullstack" || (val !== 3 && val !== 6)) {
      setPlanType("standard");
    }
  };

  const isPremiumEligible =
    isPremiumPlanGlobalEnabled && currentDomain === "fullstack" && (applyDuration === 3 || applyDuration === 6);
  const isPremiumTrack = isPremiumEligible && planType === "premium";
  const standardFee = feeSettings?.applicationFee?.isEnabled && feeSettings.applicationFee.amount > 0
    ? feeSettings.applicationFee.amount
    : (feeSettings?.certificateFee?.amount ?? 100);
  const premiumFee = feeSettings?.premiumPlan?.amount ?? 200;
  const baseFee = isPremiumTrack ? premiumFee : standardFee;
  const dur = durationConfig(applyDuration, currentDomain, isPremiumTrack ? "premium" : "standard");

  let couponDiscount = 0;
  if (couponApplied) {
    if (couponApplied.discountType === "free" || (couponApplied.discountType === "percentage" && couponApplied.discountValue >= 100)) {
      couponDiscount = baseFee;
    } else if (couponApplied.discountType === "percentage") {
      couponDiscount = Math.round((baseFee * couponApplied.discountValue) / 100);
    } else {
      couponDiscount = Math.min(baseFee, couponApplied.discountValue);
    }
  }

  const finalPayable = Math.max(0, baseFee - couponDiscount);

  const submitApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const domain = defaultDomain || applyDomain;
    if (!domain) return toast.error("Please select a domain");

    // Front-end Validation for Location and Hear About fields
    if (!state) return toast.error("State / Union Territory is required");
    if (!district) return toast.error("District is required");
    if (!city.trim()) return toast.error("City / Town is required");
    if (!/^\d{6}$/.test(pincode)) {
      return toast.error("PIN Code must be exactly 6 digits");
    }
    if (!hearAbout) return toast.error("Please select how you heard about us");
    if ((hearAbout === "Friend / Classmate" || hearAbout === "Existing Skyrovix Intern") && !referralName.trim()) {
      return toast.error("Referral Name is required for selected referral source");
    }

    const currentDomain = defaultDomain || applyDomain;
    const effectivePlan =
      isPremiumPlanGlobalEnabled &&
      currentDomain === "fullstack" &&
      (applyDuration === 3 || applyDuration === 6) &&
      planType === "premium"
        ? "premium"
        : "standard";

    const fd = new FormData(e.currentTarget);
    setApplying(true);
    try {
      let currentUser = user;
      if (!currentUser) {
        const email = String(fd.get("email"));
        const password = String(fd.get("password"));
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: String(fd.get("full_name")) } },
        });
        if (signUpError) {
          if (signUpError.message.toLowerCase().includes("already registered") || 
              signUpError.message.toLowerCase().includes("already exists") ||
              signUpError.message.toLowerCase().includes("user_already_exists")) {
            // Try to sign in instead
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (signInError) {
              throw new Error("This email is already registered. Please check your password or use a different email.");
            }
            currentUser = signInData.user;
          } else {
            throw signUpError;
          }
        } else {
          currentUser = signUpData.user;
        }
        if (!currentUser) throw new Error("Account creation failed");
      }

      let photo_url: string | null = null;
      if (photoFile && currentUser) {
        const ext = photoFile.name.split(".").pop();
        const path = `${currentUser.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("profile-photos").upload(path, photoFile, { upsert: true });
        if (!upErr) {
          const { data: signed } = await supabase.storage.from("profile-photos").createSignedUrl(path, 60 * 60 * 24 * 365);
          photo_url = signed?.signedUrl ?? null;
        }
      }

      const intern_id = generateInternId();
      const dur = durationConfig(applyDuration, currentDomain, effectivePlan);
      const studentFullName = String(fd.get("full_name"));
      const studentPhone = String(fd.get("phone"));

      const appResult = await submitApplicationServer({
        data: {
          userId: currentUser.id,
          domain: currentDomain,
          duration: applyDuration,
          totalTasks: dur?.tasks ?? getDomainTaskCount(currentDomain, applyDuration, effectivePlan),
          internId: intern_id,
          fullName: studentFullName,
          email: currentUser.email ?? "",
          phone: studentPhone,
          college: String(fd.get("college")),
          course: String(fd.get("course")),
          year: String(fd.get("year")),
          photoUrl: photo_url,
          couponCode: couponApplied?.code ?? null,
          country,
          state,
          district,
          city,
          pincode,
          hearAbout,
          referralName:
            hearAbout === "Friend / Classmate" || hearAbout === "Existing Skyrovix Intern"
              ? referralName
              : null,
          planType: effectivePlan,
        },
      });

      const appId = appResult.application.id;
      const requiresAppFee = appResult.requiresAppFee;

      if (appResult.isOfferEligible) {
        toast.success("🎉 You qualified for the Certificate Free Offer! Your certificate is ₹0 upon task completion.");
      }

      // Note: Upfront payment is not required. Completion fee is paid only after task completion & admin approval.
      onOpenChange(false);

      const assignedInternId = appResult.application?.intern_id || intern_id;
      const studentEmail = (currentUser.email || appResult.application.email || "").trim();
      const domainObj = getDomain(currentDomain);
      const domainName = domainObj?.name ?? currentDomain;

      if (studentEmail) {
        toast.loading(`Sending your Offer Letter to ${studentEmail}...`, { id: "offer-letter-delivery" });
        try {
          const { sendOfferLetterEmail } = await import("@/lib/email-helpers");
          const result = await sendOfferLetterEmail({
            to: studentEmail,
            studentName: appResult.application.full_name,
            studentId: currentUser.id,
            internId: assignedInternId,
            domainName,
            duration: applyDuration,
          });
          if (result.success) {
            await (supabase.from("applications" as any) as any).update({
              email_status: "sent",
              email_sent_at: new Date().toISOString(),
              email_error: null,
              offer_issued_at: new Date().toISOString(),
            }).eq("intern_id", assignedInternId);
            toast.success("Application submitted successfully! Your Offer Letter has been sent to your registered email address.", { id: "offer-letter-delivery", duration: 8000 });
          } else {
            console.warn("[Email] Delivery warning:", result.error);
            await (supabase.from("applications" as any) as any).update({
              email_status: "failed",
              email_error: result.error || "Email delivery failed",
            }).eq("intern_id", assignedInternId);
            toast.success("Application submitted successfully! You can view and download your Offer Letter from your Dashboard.", { id: "offer-letter-delivery", duration: 8000 });
          }
        } catch (e: any) {
          console.warn("[Email] Failed to send offer letter:", e);
          await (supabase.from("applications" as any) as any).update({
            email_status: "failed",
            email_error: e?.message || "Email delivery failed",
          }).eq("intern_id", intern_id);
          toast.success("Application submitted successfully! You can view and download your Offer Letter from your Dashboard.", { id: "offer-letter-delivery", duration: 8000 });
        }
      } else {
        toast.success("Application submitted successfully! Your Offer Letter has been sent to your registered email address.", { duration: 8000 });
      }

      onOpenChange(false);
      reset();
      onSuccess?.();

      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = (err as any)?.message || (err as any)?.error_description || "Something went wrong.";
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  const domainName = defaultDomain
    ? DOMAINS.find((d) => d.slug === defaultDomain)?.name ?? defaultDomain
    : applyDomain
      ? DOMAINS.find((d) => d.slug === applyDomain)?.name ?? applyDomain
      : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onOpenChange(false); reset(); } }}>
      <DialogContent className="sm:max-w-lg max-h-[90dvh] sm:max-h-[85dvh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-1 sm:mb-0">
          <DialogTitle className="text-base sm:text-xl font-bold">
            Apply for {domainName || "Internship"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Fill in your details. You'll get your offer letter and ID card instantly.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submitApplication} className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          {feeSettings?.certificateOffer?.isActive && (
            <div className="col-span-2 rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white dark:from-emerald-950/30 dark:to-slate-900/40 p-3 flex items-start gap-2.5">
              <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-emerald-900 dark:text-emerald-300">
                  🎉 Certificate Free Offer Active
                </p>
                <p className="text-emerald-800/80 dark:text-emerald-400/80 text-[11px] mt-0.5 leading-relaxed">
                  Applications submitted now qualify for a <strong>₹0 Free Certificate</strong> upon successful admin verification of required tasks.
                </p>
              </div>
            </div>
          )}
          <div className="col-span-2">
            <Label className="text-xs sm:text-sm">Full Name</Label>
            <Input name="full_name" defaultValue={user?.user_metadata?.full_name ?? ""} required className="mt-1 rounded-xl h-9 sm:h-10 text-sm" />
          </div>
          <div>
            <Label className="text-xs sm:text-sm">Email</Label>
            <Input name="email" type="email" defaultValue={user?.email ?? ""} required={!user} disabled={!!user} className="mt-1 rounded-xl h-9 sm:h-10 text-sm" />
          </div>
          {!user && (
            <div>
              <Label className="text-xs sm:text-sm">Password</Label>
              <Input name="password" type="password" minLength={6} required={!user} className="mt-1 rounded-xl h-9 sm:h-10 text-sm" />
            </div>
          )}
          <div>
            <Label className="text-xs sm:text-sm">Phone</Label>
            <Input name="phone" type="tel" required className="mt-1 rounded-xl h-9 sm:h-10 text-sm" />
          </div>
          <div>
            <Label className="text-xs sm:text-sm">College / University</Label>
            <Input name="college" required className="mt-1 rounded-xl h-9 sm:h-10 text-sm" />
          </div>
          <div>
            <Label className="text-xs sm:text-sm">Course / Branch</Label>
            <Input name="course" required className="mt-1 rounded-xl h-9 sm:h-10 text-sm" />
          </div>
          <div>
            <Label className="text-xs sm:text-sm font-semibold text-foreground">Year *</Label>
            <Input name="year" placeholder="e.g. 3rd year" required className="mt-1 rounded-xl h-9 sm:h-10 text-sm" />
          </div>

          {/* Location details */}
          <div className="col-span-2 border-t border-border/40 pt-3 mt-1">
            <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">📍 Location Details</h4>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <div>
                <Label className="text-xs sm:text-sm font-semibold text-foreground">Country *</Label>
                <Select value={country} onValueChange={setCountry} required>
                  <SelectTrigger className="mt-1 rounded-xl h-9 sm:h-10 text-sm bg-background/50 border-border/60">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">🇮🇳 India</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-semibold text-foreground">State / Union Territory *</Label>
                <div className="mt-1">
                  <SearchableSelect
                    options={INDIA_STATES}
                    value={state}
                    onChange={(val) => {
                      setState(val);
                      setDistrict("");
                    }}
                    placeholder="Select State"
                    searchPlaceholder="Search State..."
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 mt-3">
              <div>
                <Label className="text-xs sm:text-sm font-semibold text-foreground">District *</Label>
                <div className="mt-1">
                  <SearchableSelect
                    options={state ? STATE_DISTRICTS[state] || [] : []}
                    value={district}
                    onChange={setDistrict}
                    placeholder="Select District"
                    searchPlaceholder="Search District..."
                    disabled={!state}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-semibold text-foreground">City / Town *</Label>
                <Input
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="City / Town"
                  className="mt-1 rounded-xl h-9 sm:h-10 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm font-semibold text-foreground">PIN Code *</Label>
                <Input
                  name="pincode"
                  type="number"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                  placeholder="6 Digit PIN"
                  className="mt-1 rounded-xl h-9 sm:h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Discovery Source */}
          <div className="col-span-2 border-t border-border/40 pt-3 mt-1">
            <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">❓ Discovery</h4>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <div>
                <Label className="text-xs sm:text-sm font-semibold text-foreground">How did you hear about Skyrovix? *</Label>
                <div className="mt-1">
                  <SearchableSelect
                    options={[
                      "Google Search",
                      "Instagram",
                      "LinkedIn",
                      "YouTube",
                      "Facebook",
                      "WhatsApp",
                      "Telegram",
                      "Friend / Classmate",
                      "Existing Skyrovix Intern",
                      "Other"
                    ]}
                    value={hearAbout}
                    onChange={setHearAbout}
                    placeholder="Select Source"
                    searchPlaceholder="Search options..."
                  />
                </div>
              </div>

              {(hearAbout === "Friend / Classmate" || hearAbout === "Existing Skyrovix Intern") && (
                <div className="animate-fade-in">
                  <Label className="text-xs sm:text-sm font-semibold text-foreground">Referral Name *</Label>
                  <Input
                    name="referral_name"
                    value={referralName}
                    onChange={(e) => setReferralName(e.target.value)}
                    required
                    placeholder="Friend/Intern's full name"
                    className="mt-1 rounded-xl h-9 sm:h-10 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
          {!defaultDomain && (
            <div>
              <Label className="text-xs sm:text-sm">Domain</Label>
              <Select
                value={applyDomain}
                onValueChange={(val) => {
                  setApplyDomain(val);
                  if (isPremiumPlanGlobalEnabled && val === "fullstack" && (applyDuration === 3 || applyDuration === 6)) {
                    setPlanType("premium");
                  } else {
                    setPlanType("standard");
                  }
                }}
                required
              >
                <SelectTrigger className="mt-1 rounded-xl h-9 sm:h-10 text-sm">
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d.slug} value={d.slug}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="col-span-2">
            <Label className="text-xs sm:text-sm font-semibold">
              Internship Duration
            </Label>
            <div className="mt-1 grid gap-1.5 sm:gap-2 grid-cols-2 sm:grid-cols-4">
              {availableDurations.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => handleDurationChange(d.value)}
                  className={`rounded-xl border p-2 sm:p-3 text-left transition-all cursor-pointer ${
                    applyDuration === d.value
                      ? "border-[#f95c4b] bg-[#f95c4b]/10 dark:border-[#ee9590] dark:bg-[#f95c4b]/15 ring-1 ring-[#f95c4b]/30"
                      : "border-border/60 bg-white/50 dark:bg-[#0f172a]/50 hover:border-border"
                  }`}
                >
                  <p className="text-xs sm:text-sm font-semibold">{d.label}</p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ─── Choose Your Internship Plan Section ─── */}
          <div className="col-span-2 border-t border-border/40 pt-3 mt-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary" /> Internship Plan &amp; Benefits
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isPremiumPlanGlobalEnabled && currentDomain === "fullstack" && (applyDuration === 3 || applyDuration === 6)
                    ? `₹${premiumFee} Full Stack Intensive Track with 25/50 Real-World Deployed Projects & LOR for Selected Students.`
                    : `₹${standardFee} Common Standard Track with sequential tasks, mentor review & official certificate.`}
                </p>
              </div>
              {isPremiumTrack && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-xs">
                  <Crown className="size-3" /> Full Stack Intensive
                </span>
              )}
            </div>

            {isPremiumPlanGlobalEnabled && currentDomain === "fullstack" ? (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {/* Standard Plan Card */}
                <div
                  onClick={() => setPlanType("standard")}
                  className={`rounded-2xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between ${
                    !isPremiumTrack
                      ? "border-[#f95c4b] bg-gradient-to-br from-[#f95c4b]/5 via-white to-orange-50/30 dark:from-[#f95c4b]/10 dark:via-slate-900 dark:to-slate-800 ring-2 ring-[#f95c4b]/25 shadow-sm"
                      : "border-border/60 bg-white/40 dark:bg-slate-900/40 hover:border-border"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-blue-600/10 text-[#f95c4b] dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          S
                        </div>
                        <span className="font-bold text-sm text-foreground">Standard Track (₹{standardFee} Common)</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{standardFee}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-foreground mt-2">
                      {applyDuration === 1
                        ? "5 structured tasks"
                        : applyDuration === 2
                        ? "8 structured tasks"
                        : applyDuration === 3
                        ? "10 structured tasks"
                        : "12 structured tasks"}
                    </p>

                    <ul className="mt-2 space-y-1 text-[10.5px] text-muted-foreground leading-snug">
                      <li className="flex items-center gap-1.5">
                        <Check className="size-3 text-emerald-600 shrink-0" />
                        <span>Official Offer Letter &amp; Student ID Card</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="size-3 text-emerald-600 shrink-0" />
                        <span>Task verification &amp; mentor evaluation</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="size-3 text-emerald-600 shrink-0" />
                        <span>QR-Verified Certificate upon completion &amp; approval</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[10.5px]">
                    <span className="text-muted-foreground">Standard Curriculum:</span>
                    <span className="font-semibold text-foreground">₹{standardFee} Common</span>
                  </div>
                </div>

                {/* Full Stack 3M & 6M Premium Intensive Track Card */}
                <div
                  onClick={() => {
                    if (applyDuration === 1 || applyDuration === 2) {
                      toast.info(`Select 3-Month or 6-Month duration above to unlock the ₹${premiumFee} Intensive Track with 25/50 Projects & LOR.`);
                      return;
                    }
                    setPlanType("premium");
                  }}
                  className={`rounded-2xl border p-3.5 transition-all flex flex-col justify-between ${
                    applyDuration === 1 || applyDuration === 2
                      ? "border-border/40 bg-slate-100/50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed"
                      : isPremiumTrack
                      ? "border-indigo-500 bg-gradient-to-br from-indigo-50/70 via-purple-50/30 to-white dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 ring-2 ring-indigo-500/40 shadow-md cursor-pointer"
                      : "border-border/60 bg-white/40 dark:bg-slate-900/40 hover:border-indigo-300 dark:hover:border-indigo-800 cursor-pointer"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-gradient-to-br from-amber-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          <Crown className="size-4" />
                        </div>
                        <span className="font-bold text-sm text-foreground flex items-center gap-1">
                          Full Stack Intensive Track (3M / 6M)
                        </span>
                      </div>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        ₹{premiumFee}
                      </span>
                    </div>

                    {applyDuration === 1 || applyDuration === 2 ? (
                      <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10.5px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5 leading-snug">
                        <Lock className="size-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <span>Select 3-Month (25 tasks) or 6-Month (50 tasks) above to unlock the ₹{premiumFee} Track with LOR.</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-[11px] font-semibold text-foreground mt-2">
                          {applyDuration === 3 ? "25 Real-World Deployed Projects" : "50 Real-World Deployed Projects"}
                        </p>

                        <ul className="mt-2 space-y-1 text-[10.5px] text-muted-foreground leading-snug">
                          <li className="flex items-center gap-1.5">
                            <Check className="size-3 text-indigo-600 shrink-0 font-bold" />
                            <span className="font-bold text-foreground">
                              {applyDuration === 3 ? "25 Real-World Deployment Tasks (Live URL)" : "50 Real-World Deployment Tasks (Live URL)"}
                            </span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="size-3 text-amber-600 shrink-0 font-bold" />
                            <span className="font-bold text-foreground">
                              Letter of Recommendation (LOR) for Selected Top Performers
                            </span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="size-3 text-indigo-600 shrink-0 font-bold" />
                            <span className="font-bold text-foreground">Complete Architecture Blueprints &amp; Live Deployment</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="size-3 text-indigo-600 shrink-0 font-bold" />
                            <span className="font-bold text-foreground">Curated Course References &amp; Top YouTube Channel Guides</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="size-3 text-indigo-600 shrink-0" />
                            <span>Production Deployment Verified Credential</span>
                          </li>
                        </ul>
                      </>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[10.5px]">
                    <span className="text-muted-foreground">Full Stack Exclusive Fee:</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">₹{premiumFee} Only</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Standard Plan Card for non-fullstack */}
                <div className="rounded-2xl border border-[#f95c4b]/30 bg-gradient-to-br from-[#f95c4b]/5 via-white to-orange-50/20 dark:from-[#f95c4b]/10 dark:via-slate-900 dark:to-slate-800 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-xl bg-[#f95c4b]/15 text-[#f95c4b] flex items-center justify-center font-bold text-sm">
                        S
                      </div>
                      <div>
                        <span className="font-bold text-sm text-foreground">Standard Curriculum Track</span>
                        <p className="text-[11px] text-muted-foreground">
                          {applyDuration === 1 ? "1 Month · 5 Structured Tasks" :
                           applyDuration === 2 ? "2 Months · 8 Structured Tasks" :
                           applyDuration === 3 ? "3 Months · 10 Structured Tasks" :
                           "6 Months · 12 Structured Tasks"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{standardFee}
                    </span>
                  </div>

                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px] text-muted-foreground border-t border-border/40 pt-2.5">
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-emerald-600 shrink-0" />
                      <span>Official Offer Letter &amp; ID</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-emerald-600 shrink-0" />
                      <span>Sequential Task Verification</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-emerald-600 shrink-0" />
                      <span>MSME-Registered Certificate</span>
                    </li>
                  </ul>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/50 border border-border/40 text-[11px] text-muted-foreground flex items-center gap-2">
                  <Sparkles className="size-3.5 text-amber-500 shrink-0" />
                  <span>
                    <strong>Fee:</strong> Common registration fee is ₹{standardFee} for all standard domains.
                    {isPremiumPlanGlobalEnabled && (
                      <> The ₹{premiumFee} fee applies strictly to Full Stack 3M &amp; 6M intensive tracks (25/50 tasks + LOR).</>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs sm:text-sm">Profile Photo</Label>
            <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} className="mt-1 rounded-xl h-9 sm:h-10 text-sm file:truncate" />
          </div>

          <div className="col-span-2">
            {couponApplied ? (
              <div className="flex items-center justify-between rounded-xl border border-green-200 dark:border-green-800/30 bg-green-50 dark:bg-green-950/20 p-2.5 sm:p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 sm:size-4 text-green-500" />
                  <span className="text-[11px] sm:text-xs font-semibold text-green-700 dark:text-green-300">Coupon {couponApplied.code} — {couponApplied.discount}</span>
                </div>
                <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={handleRemoveCoupon}>Remove</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Have a coupon code?"
                  className="mt-1 flex-1 rounded-xl h-9 sm:h-10 text-sm"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); } }}
                />
                <Button type="button" size="sm" variant="outline" className="mt-1 h-9 sm:h-10 rounded-xl gap-1 shrink-0 text-xs sm:text-sm" onClick={handleApplyCoupon} disabled={!couponCode.trim() || validatingCoupon}>
                  {validatingCoupon ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                  Apply
                </Button>
              </div>
            )}
          </div>

          {/* ─── Dynamic Live Fee & Coupon Summary ─── */}
          <div className="col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-muted-foreground pb-1 border-b border-border/40">
              <span className="font-medium">Selected Duration:</span>
              <span className="font-semibold text-foreground">
                {applyDuration} Month{applyDuration > 1 ? "s" : ""} • {isPremiumTrack ? `Intensive Track (₹${premiumFee})` : `Standard Track (₹${standardFee})`} ({dur?.tasks ?? 5} Tasks)
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground pb-1 border-b border-border/40">
              <span className="font-medium">Upfront Registration:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">₹0 (Free to Start)</span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground pb-1 border-b border-border/40">
              <span className="font-medium">Completion &amp; Certificate Fee:</span>
              <span className="font-semibold text-foreground">
                {finalPayable === 0 ? "₹0 (Free Waiver)" : `₹${finalPayable} (Payable after task completion)`}
              </span>
            </div>

            {couponApplied && couponDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 pb-1 border-b border-border/40">
                <span className="font-medium">Coupon Discount ({couponApplied.code}):</span>
                <span className="font-bold">-₹{couponDiscount}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 text-sm font-extrabold text-foreground">
              <span>Pay Today:</span>
              <span className="text-base text-emerald-600 dark:text-emerald-400 flex items-center font-black">
                ₹0 (Instant Offer Letter)
              </span>
            </div>
          </div>

          <Button type="submit" className="w-full col-span-2 rounded-xl bg-[#f95c4b] hover:bg-[#e04b3a] text-white font-bold shadow-md shadow-[#f95c4b]/25 hover:-translate-y-0.5 active:translate-y-0 transition-all border-0 h-10 sm:h-11 text-sm cursor-pointer" disabled={applying}>
            {applying ? "Submitting & Sending Offer Letter..." : "Submit Application & Get Instant Offer Letter"}
          </Button>
          <p className="col-span-2 text-[11px] text-center text-muted-foreground mt-0.5">
            Your official Offer Letter will be emailed automatically. Post-completion fee of ₹{finalPayable} unlocks only after admin approves all tasks.
          </p>
        </form>
      </DialogContent>

      {/* Cashfree Payment Gateway Trigger */}
      {pendingPayment && (
        <PaymentSummaryDialog
          open={pendingPayment.open}
          onOpenChange={(op) => {
            if (!op) {
              setPendingPayment(null);
              reset();
              navigate({ to: "/dashboard" });
            }
          }}
          productType={pendingPayment.productType || "premium_plan"}
          productService={pendingPayment.productService}
          amount={pendingPayment.amount}
          discountAmount={pendingPayment.discountAmount}
          customerName={pendingPayment.customerName}
          customerEmail={pendingPayment.customerEmail}
          customerPhone={pendingPayment.customerPhone}
          userId={user?.id}
          applicationId={pendingPayment.applicationId}
          couponCode={pendingPayment.couponCode}
          onSuccess={() => {
            setPendingPayment(null);
            reset();
            onSuccess?.();
            toast.success("Payment verified! Welcome to Skyrovix Virtual Internship.");
            navigate({ to: "/dashboard" });
          }}
        />
      )}
    </Dialog>
  );
}
