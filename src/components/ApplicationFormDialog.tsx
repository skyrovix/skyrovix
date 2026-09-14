import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DOMAINS, DURATIONS, durationConfig, generateInternId, getDomain } from "@/lib/constants";
import { validateCoupon } from "@/lib/coupons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { INDIA_STATES, STATE_DISTRICTS } from "@/lib/india-locations";

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
  const [applying, setApplying] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: string } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Location and Hear about us fields
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [hearAbout, setHearAbout] = useState("");
  const [referralName, setReferralName] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const result = await validateCoupon(couponCode.trim(), applyDomain || undefined);
      if (result.valid) {
        setCouponApplied({ code: result.code!, discount: result.discountType === "percentage" ? `${result.discountValue}% OFF` : `₹${result.discountValue} OFF` });
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
    setPhotoFile(null);
    setCouponCode("");
    setCouponApplied(null);
    setCountry("India");
    setState("");
    setDistrict("");
    setCity("");
    setPincode("");
    setHearAbout("");
    setReferralName("");
  };

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
      const dur = durationConfig(applyDuration);
      const payload: Record<string, any> = {
        user_id: currentUser.id,
        domain,
        duration: applyDuration,
        total_tasks: dur?.tasks ?? 5,
        intern_id,
        full_name: String(fd.get("full_name")),
        email: currentUser.email ?? "",
        phone: String(fd.get("phone")),
        college: String(fd.get("college")),
        course: String(fd.get("course")),
        year: String(fd.get("year")),
        photo_url,
        coupon_code: couponApplied?.code ?? null,
        status: "approved",
        submission_status: "in_progress",
        country,
        state,
        district,
        city,
        pincode,
        hear_about: hearAbout,
        referral_name: (hearAbout === "Friend / Classmate" || hearAbout === "Existing Skyrovix Intern") ? referralName : null,
      };
      const { error: insertError } = await (supabase.from("applications" as any) as any).insert(payload);
      if (insertError) throw insertError;

      await supabase.from("profiles").upsert({
        id: currentUser.id,
        full_name: payload.full_name,
        phone: payload.phone,
        college: payload.college,
        course: payload.course,
        year: payload.year,
        photo_url,
      });

      const studentEmail = (currentUser.email || payload.email || "").trim();
      const domainObj = getDomain(domain);
      const domainName = domainObj?.name ?? domain;

      if (studentEmail) {
        toast.loading(`Sending your Offer Letter to ${studentEmail}...`, { id: "offer-letter-delivery" });
        try {
          const { sendOfferLetterEmail } = await import("@/lib/email-helpers");
          const result = await sendOfferLetterEmail({
            to: studentEmail,
            studentName: payload.full_name,
            studentId: currentUser.id,
            internId: intern_id,
            domainName,
            duration: applyDuration,
          });
          if (result.success) {
            toast.success(`Application submitted! Official Offer Letter sent to ${studentEmail}`, { id: "offer-letter-delivery" });
          } else {
            toast.error(`Application submitted, but offer letter delivery failed: ${result.error}`, { id: "offer-letter-delivery", duration: 8000 });
          }
        } catch (e: any) {
          console.warn("[Email] Failed to send offer letter:", e);
          toast.error(`Application submitted, but email error: ${e.message}`, { id: "offer-letter-delivery" });
        }
      } else {
        toast.success("Application submitted! Your internship has started.");
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
              <Select value={applyDomain} onValueChange={setApplyDomain} required>
                <SelectTrigger className="mt-1 rounded-xl h-9 sm:h-10 text-sm">
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d.slug} value={d.slug}>{d.icon} {d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="col-span-2">
            <Label className="text-xs sm:text-sm">Duration</Label>
            <div className="mt-1 grid grid-cols-2 gap-1.5 sm:gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setApplyDuration(d.value)}
                  className={`rounded-xl border p-2 sm:p-3 text-left transition-all ${
                    applyDuration === d.value
                      ? "border-[#07284a] bg-[#07284a]/10 dark:border-[#60a5fa] dark:bg-[#60a5fa]/10 ring-1 ring-[#07284a]/20"
                      : "border-border/60 bg-white/50 dark:bg-[#0f172a]/50 hover:border-border"
                  }`}
                >
                  <p className="text-xs sm:text-sm font-semibold">{d.label}</p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{d.desc}</p>
                </button>
              ))}
            </div>
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
          <Button type="submit" className="w-full col-span-2 rounded-xl bg-[#07284a] hover:bg-[#07284a]/90 text-white border-0 h-10 sm:h-11 text-sm" disabled={applying}>
            {applying ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
