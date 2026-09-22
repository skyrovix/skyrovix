import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DOMAINS, DURATIONS, durationConfig, generateInternId, getDomain } from "@/lib/constants";
import { validateCoupon } from "@/lib/coupons";
import { getPublicFeeSettings, submitApplicationServer, type PublicFeeSettings } from "@/lib/fee-service";
import { ManualUpiPaymentDialog } from "@/components/ManualUpiPaymentDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { ArrowRight, ShieldCheck, Clock, Users, Eye, EyeOff, Sparkles, CheckCircle2, Loader2, Upload, Lock, ChevronRight } from "lucide-react";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FadeUp, SlideLeft, SlideRight } from "@/components/motion";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { INDIA_STATES, STATE_DISTRICTS } from "@/lib/india-locations";

export const Route = createFileRoute("/domains/")({
  head: () => ({
    meta: [
      { title: "Apply for Virtual Internship | Full Stack, AI, Python, Data Science & More | Skyrovix" },
      { name: "description", content: "Apply for a virtual internship at Skyrovix and gain hands-on experience through real-world projects. Choose from Full Stack, Data Science, AI/ML, UI/UX, Cyber Security, Python, Java, Cloud Computing and more. Get an instant offer letter, digital ID card, and QR-verified certificate. 100% online, work from home, summer internship 2026." },
      { name: "keywords", content: "apply internship online, internship application form, virtual internship India, full stack internship apply, AI ML internship apply, Python internship apply, data science internship apply, internship with offer letter, internship with certificate, project based internship online, work from home internship, summer internship 2026, internship for CSE students, internship for IT students, internship for engineering students, internship for final year students, MERN stack internship apply, Skyrovix internship registration" },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Skyrovix" },
      { property: "og:title", content: "Apply for Virtual Internship — Skyrovix" },
      { property: "og:description", content: "Apply for a virtual internship in 10+ domains. Get an instant offer letter, digital ID card, complete 5 tasks, earn a QR-verified certificate. Only ₹100 certification fee." },
      { property: "og:url", content: "https://skyrovix.online/domains" },
      { property: "og:image", content: "https://skyrovix.online/og-default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Apply for Virtual Internship — Skyrovix" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@skyrovix" },
      { name: "twitter:title", content: "Apply for Virtual Internship — Skyrovix" },
      { name: "twitter:description", content: "Apply for a virtual internship in Full Stack, AI/ML, Data Science, UI/UX and more. Get instant offer letter. Only ₹100 certification fee." },
      { name: "twitter:image", content: "https://skyrovix.online/og-default.png" },
      { name: "twitter:image:alt", content: "Apply for Virtual Internship — Skyrovix" },
      { rel: "canonical", href: "https://skyrovix.online/domains" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { apply?: string } => ({
    apply: typeof search.apply === "string" ? search.apply : undefined,
  }),
  component: DomainsPage,
});

function DomainsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [applyDomain, setApplyDomain] = useState(search.apply ?? "");
  const [applyDuration, setApplyDuration] = useState(1);
  const [applying, setApplying] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: string } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");

  // Location and Hear about us fields
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [hearAbout, setHearAbout] = useState("");
  const [referralName, setReferralName] = useState("");
  const [showGuestPassword, setShowGuestPassword] = useState(false);

  // Fetch profile if user is logged in
  const { data: profile } = useQuery({
    queryKey: ["user-profile-domains", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data ?? null;
    }
  });

  // Fetch existing applications
  const { data: myApps } = useQuery({
    queryKey: ["user-enrolled-apps", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("domain").eq("user_id", user!.id);
      return data ?? [];
    }
  });

  const enrolledSlugs = new Set(myApps?.map(a => a.domain) ?? []);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setCollege(profile.college ?? "");
      setCourse(profile.course ?? "");
      setYear(profile.year ?? "");
    }
  }, [profile]);

  const { data: feeSettings } = useQuery<PublicFeeSettings>({
    queryKey: ["public-fee-settings"],
    queryFn: () => getPublicFeeSettings(),
    staleTime: 30_000,
  });

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [createdAppId, setCreatedAppId] = useState<string | null>(null);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (search.apply && DOMAINS.some((d) => d.slug === search.apply)) {
      setApplyDomain(search.apply);
    }
  }, [search.apply]);

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

  const submitApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!applyDomain) return toast.error("Please select a domain");
    
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
      const studentFullName = String(fd.get("full_name"));
      const studentPhone = String(fd.get("phone"));
      const studentCollege = String(fd.get("college"));
      const studentCourse = String(fd.get("course"));
      const studentYear = String(fd.get("year"));

      const appResult = await submitApplicationServer({
        data: {
          userId: currentUser.id,
          domain: applyDomain,
          duration: applyDuration,
          totalTasks: dur?.tasks ?? 5,
          internId: intern_id,
          fullName: studentFullName,
          email: currentUser.email ?? "",
          phone: studentPhone,
          college: studentCollege,
          course: studentCourse,
          year: studentYear,
          photoUrl: photo_url,
          couponCode: couponApplied?.code ?? null,
          country,
          state,
          district,
          city,
          pincode,
          hearAbout,
          referralName: (hearAbout === "Friend / Classmate" || hearAbout === "Existing Skyrovix Intern") ? referralName : null,
        },
      });

      if (!appResult.success) {
        throw new Error("Application creation failed on server.");
      }

      const appId = appResult.application.id;
      const requiresAppFee = appResult.requiresAppFee;

      if (requiresAppFee) {
        setCreatedAppId(appId);
        setCreatedUserId(currentUser.id);
        setPaymentDialogOpen(true);
        toast.info(`Application submitted! Please complete the ₹${feeSettings?.applicationFee?.amount} application fee payment.`);
        return;
      }

      const studentEmail = (currentUser.email || "").trim();
      const domainObj = getDomain(applyDomain);
      const domainName = domainObj?.name ?? applyDomain;

      if (studentEmail) {
        toast.loading(`Sending your Offer Letter to ${studentEmail}...`, { id: "offer-letter-delivery" });
        try {
          const { sendOfferLetterEmail } = await import("@/lib/email-helpers");
          const result = await sendOfferLetterEmail({
            to: studentEmail,
            studentName: studentFullName,
            studentId: currentUser.id,
            internId: intern_id,
            domainName,
            duration: applyDuration,
          });
          if (result.success) {
            await (supabase.from("applications") as any).update({
              email_status: "sent",
              email_sent_at: new Date().toISOString(),
              email_error: null,
              offer_issued_at: new Date().toISOString(),
            }).eq("intern_id", intern_id);
            toast.success("Application submitted successfully! Your Offer Letter has been sent to your registered email address.", { id: "offer-letter-delivery", duration: 8000 });
          } else {
            console.warn("[Email] Delivery warning:", result.error);
            await (supabase.from("applications") as any).update({
              email_status: "failed",
              email_error: result.error || "Email delivery failed",
            }).eq("intern_id", intern_id);
            toast.success("Application submitted successfully! You can view and download your Offer Letter from your Dashboard.", { id: "offer-letter-delivery", duration: 8000 });
          }
        } catch (e: any) {
          console.warn("[Email] Failed to send offer letter:", e);
          await (supabase.from("applications") as any).update({
            email_status: "failed",
            email_error: e?.message || "Email delivery failed",
          }).eq("intern_id", intern_id);
          toast.success("Application submitted successfully! You can view and download your Offer Letter from your Dashboard.", { id: "offer-letter-delivery", duration: 8000 });
        }
      } else {
        toast.success("Application submitted successfully! Your Offer Letter has been sent to your registered email address.", { duration: 8000 });
      }

      navigate({ to: "/dashboard", search: {} as any });

    } catch (err) {
      const msg = (err as any)?.message || (err as any)?.error_description || "Something went wrong.";
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  const selectedDomainObj = DOMAINS.find(d => d.slug === applyDomain);

  return (
    <div className="w-full">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://skyrovix.online/" },
          { name: "Apply for Internship", url: "https://skyrovix.online/domains" },
        ]}
      />
      <WebPageJsonLd
        title="Apply for Virtual Internship — Select Domain & Start Today | Skyrovix"
        description="Apply for a virtual internship at Skyrovix. Select your domain and duration, fill the form, and get an instant offer letter."
        url="https://skyrovix.online/domains"
      />
      <Navbar />
      <AuroraBackground>
        <div className="mx-auto max-w-7xl px-4 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Platform info & Live preview */}
            <SlideLeft delay={0.05} className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
              <div>
                <Badge variant="outline" className="mb-3 border-slate-200 dark:border-[#07284a]/15 bg-white/65 dark:bg-[#0f172a]/60 text-[#07284a] dark:text-[#60a5fa] px-3 py-1 font-semibold shadow-sm backdrop-blur">
                  <ShieldCheck className="mr-1.5 size-3.5" /> MSME Registered Platform
                </Badge>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#07284a] dark:text-white leading-[1.15]">
                  Start Your <span className="brand-text">Virtual Internship</span>
                </h1>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Join task-based remote internships designed to build real portfolio skills. Earn offer letters, digital ID cards, and QR-verified certificates.
                </p>
              </div>

              {/* Dynamic preview card */}
              {selectedDomainObj ? (
                <div className={`rounded-3xl bg-gradient-to-br ${selectedDomainObj.color ?? "from-[#07284a] to-blue-600"} p-6 text-white shadow-xl space-y-4`}>
                  <div className="flex items-center gap-3">
                    <div className="grid size-14 place-items-center rounded-2xl bg-white/20 text-white text-3xl shadow-inner font-black">
                      {selectedDomainObj.icon ?? "🎓"}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-snug">{selectedDomainObj.name}</h4>
                      <p className="text-[10px] text-blue-200 uppercase font-bold tracking-widest">Selected Internship Stream</p>
                    </div>
                  </div>
                  <p className="text-xs text-blue-100/90 leading-relaxed">
                    {selectedDomainObj.description || "Learn industry-grade tools and complete real-world tasks in this internship domain."}
                  </p>
                  <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-center text-xs">
                    <div className="bg-white/10 rounded-2xl p-2.5">
                      <span className="text-[9px] text-blue-200 block uppercase font-bold tracking-widest">Syllabus</span>
                      <span className="font-extrabold text-sm mt-0.5 block">{DURATIONS.find(d => d.value === applyDuration)?.tasks ?? 5} Projects</span>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-2.5">
                      <span className="text-[9px] text-blue-200 block uppercase font-bold tracking-widest">Credential Status</span>
                      <span className="font-extrabold text-sm mt-0.5 block">QR Verified</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 dark:border-border/40 p-8 flex flex-col items-center justify-center text-center bg-white/60 dark:bg-slate-900/10 shadow-sm backdrop-blur-sm min-h-[200px]">
                  <Sparkles className="size-10 text-amber-500 mb-3 animate-bounce" />
                  <h4 className="font-bold text-sm text-[#07284a] dark:text-white">Select an Internship Domain</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 max-w-xs leading-relaxed font-medium">Choose your preferred stream on the right to preview task scope, curriculum workloads, and verified certificates.</p>
                </div>
              )}

              {/* Core Features */}
              <div className="space-y-3.5 pt-2">
                <h4 className="font-bold text-xs uppercase text-[#07284a] dark:text-slate-400 tracking-widest">Internship Inclusions</h4>
                <div className="grid gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium"><strong className="text-slate-800 dark:text-white font-bold">Offer Letter:</strong> Dispatched to email instantly upon registration.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium"><strong className="text-slate-800 dark:text-white font-bold">Student ID Card:</strong> Issued digitally in your dashboard immediately.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium"><strong className="text-slate-800 dark:text-white font-bold">Verified Certificates:</strong> QR-linked and searchable credentials portal.</span>
                  </div>
                </div>
              </div>
            </SlideLeft>

            {/* Right Column: Premium Form */}
            <SlideRight delay={0.1} className="lg:col-span-7">
              <div className="rounded-3xl border border-border/40 bg-white/60 pt-9 pb-6 px-6 sm:pt-12 sm:pb-8 sm:px-8 backdrop-blur-xl dark:bg-slate-900/60 dark:border-white/5 shadow-xl">
                <form onSubmit={submitApplication} className="space-y-6">
                  
                  {/* Select Domain Dropdown */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-foreground">Select Internship Domain *</Label>
                    <Select value={applyDomain} onValueChange={setApplyDomain} required>
                      <SelectTrigger className="rounded-xl h-11 bg-background/50 border-border/60">
                        <SelectValue placeholder="Choose a learning stream..." />
                      </SelectTrigger>
                      <SelectContent>
                        {DOMAINS.map((d) => {
                          const isEnrolled = enrolledSlugs.has(d.slug);
                          return (
                            <SelectItem key={d.slug} value={d.slug} disabled={isEnrolled}>
                              {d.name} {isEnrolled && "(Already Enrolled)"}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Personal details info */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-foreground">Full Name *</Label>
                      <Input name="full_name" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Enter your full name" className="h-11 rounded-xl bg-background/50 border-border/60" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-foreground">Phone Number *</Label>
                      <Input name="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="Enter mobile number" className="h-11 rounded-xl bg-background/50 border-border/60" />
                    </div>
                  </div>

                  {/* Auth fields (only if guest) */}
                  {!user && (
                    <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-2xl bg-[#07284a]/5 border border-border/40">
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-bold text-foreground">Email Address *</Label>
                        <Input name="email" type="email" required placeholder="name@domain.com" className="h-11 rounded-xl bg-white border-border/60" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-bold text-foreground">Account Password *</Label>
                        <div className="relative">
                          <Input
                            name="password"
                            type={showGuestPassword ? "text" : "password"}
                            required
                            placeholder="Choose password (min 6 chars)"
                            className="h-11 rounded-xl bg-white border-border/60 pr-10"
                          />
                          <button
                            type="button"
                            aria-label={showGuestPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowGuestPassword(!showGuestPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                          >
                            {showGuestPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Academic Info */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs sm:text-sm font-bold text-foreground">College / University Name *</Label>
                      <Input name="college" value={college} onChange={e => setCollege(e.target.value)} required placeholder="Enter institution name" className="h-11 rounded-xl bg-background/50 border-border/60" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-foreground">Year of Study *</Label>
                      <Input name="year" value={year} onChange={e => setYear(e.target.value)} required placeholder="e.g. 3rd Year" className="h-11 rounded-xl bg-background/50 border-border/60" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-foreground">Course / Branch *</Label>
                      <Input name="course" value={course} onChange={e => setCourse(e.target.value)} required placeholder="e.g. B.Tech CSE" className="h-11 rounded-xl bg-background/50 border-border/60" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-foreground">Profile Photo (Optional)</Label>
                      <div className="flex gap-2">
                        <Input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] ?? null)} className="h-11 file:text-xs rounded-xl bg-background/50 border-border/60 file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-[#07284a] file:text-white hover:file:bg-[#07284a]/90 file:cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  {/* Location Details section */}
                  <div className="border-t border-border/40 pt-4 mt-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-foreground mb-3 flex items-center gap-1.5">
                      📍 Location Details
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-bold text-foreground">Country *</Label>
                        <Select value={country} onValueChange={setCountry} required>
                          <SelectTrigger className="rounded-xl h-11 bg-background/50 border-border/60">
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="India">🇮🇳 India</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-bold text-foreground">State / Union Territory *</Label>
                        <SearchableSelect
                          options={INDIA_STATES}
                          value={state}
                          onChange={(val) => {
                            setState(val);
                            setDistrict("");
                          }}
                          placeholder="Select State / UT"
                          searchPlaceholder="Search State..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 mt-3">
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-foreground">District *</Label>
                      <SearchableSelect
                        options={state ? STATE_DISTRICTS[state] || [] : []}
                        value={district}
                        onChange={setDistrict}
                        placeholder="Select District"
                        searchPlaceholder="Search District..."
                        disabled={!state}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-foreground">City / Town *</Label>
                      <Input
                        name="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        placeholder="Enter your City / Town"
                        className="h-11 rounded-xl bg-background/50 border-border/60"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-bold text-foreground">PIN Code *</Label>
                      <Input
                        name="pincode"
                        type="number"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        required
                        placeholder="6 Digit PIN Code"
                        className="h-11 rounded-xl bg-background/50 border-border/60"
                      />
                    </div>
                  </div>

                  {/* Discovery / Referral Section */}
                  <div className="border-t border-border/40 pt-4 mt-2">
                    <h3 className="text-xs sm:text-sm font-extrabold text-foreground mb-3 flex items-center gap-1.5">
                      ❓ Discovery
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-bold text-foreground">How did you hear about Skyrovix? *</Label>
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

                      {(hearAbout === "Friend / Classmate" || hearAbout === "Existing Skyrovix Intern") && (
                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm font-bold text-foreground">Referral Name *</Label>
                          <Input
                            name="referral_name"
                            value={referralName}
                            onChange={(e) => setReferralName(e.target.value)}
                            required
                            placeholder="Enter friend/intern's full name"
                            className="h-11 rounded-xl bg-background/50 border-border/60"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Duration Button Grid */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-foreground">Internship Duration *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DURATIONS.map((d) => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => setApplyDuration(d.value)}
                          className={`rounded-2xl border p-3.5 text-left transition-all ${
                            applyDuration === d.value
                              ? "border-[#07284a] bg-[#07284a]/5 dark:border-blue-500 dark:bg-blue-500/10 ring-1 ring-[#07284a]/10 dark:ring-blue-500/10"
                              : "border-border/60 bg-background/30 hover:border-border"
                          }`}
                        >
                          <p className="text-xs sm:text-sm font-extrabold text-foreground">{d.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{d.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Coupon Code section */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-foreground">Promo / Coupon Code (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!couponApplied}
                        className="rounded-xl h-11 bg-background/50 border-border/60"
                      />
                      {couponApplied ? (
                        <Button type="button" variant="outline" className="rounded-xl h-11 px-4 text-red-500" onClick={handleRemoveCoupon}>
                          Remove
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl h-11 px-5"
                          onClick={handleApplyCoupon}
                          disabled={validatingCoupon || !couponCode.trim()}
                        >
                          {validatingCoupon ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                        </Button>
                      )}
                    </div>
                    {couponApplied && (
                      <p className="text-xs text-emerald-600 font-bold mt-1">Coupon applied successfully: {couponApplied.discount}</p>
                    )}
                  </div>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    className="w-full brand-gradient text-white border-0 rounded-2xl h-12 text-sm font-extrabold shadow-lg shadow-[#07284a]/15 hover:shadow-xl hover:shadow-[#07284a]/25 transition-all mt-4"
                    disabled={applying}
                  >
                    {applying ? (
                      <span className="flex items-center gap-2 justify-center">
                        <Loader2 className="size-4 animate-spin" /> Starting Your Internship...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 justify-center">
                        Apply & Launch Internship <ArrowRight className="size-4" />
                      </span>
                    )}
                  </Button>

                </form>
              </div>
            </SlideRight>

          </div>
        </div>
      </AuroraBackground>

      {paymentDialogOpen && createdAppId && createdUserId && feeSettings && (
        <ManualUpiPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={(o) => {
            setPaymentDialogOpen(o);
            if (!o) navigate({ to: "/dashboard" });
          }}
          title="Application Fee Payment"
          description={`Please complete the ₹${feeSettings.applicationFee.amount} application fee payment to proceed with admin verification.`}
          paymentType="application"
          amount={feeSettings.applicationFee.amount}
          upiId={feeSettings.upi.upiId}
          payeeName={feeSettings.upi.payeeName}
          qrCodeUrl={feeSettings.upi.qrCodeUrl}
          applicationId={createdAppId}
          userId={createdUserId}
          customerName={fullName}
          customerEmail={user?.email || ""}
          customerPhone={phone}
          onSuccess={() => {
            navigate({ to: "/dashboard" });
          }}
        />
      )}

      <Footer />
    </div>
  );
}
