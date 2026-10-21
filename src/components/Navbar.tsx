import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { NotificationMenu } from "./NotificationMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut,
  LayoutDashboard,
  Shield,
  Menu,
  X,
  BookOpen,
  ListChecks,
  Award,
  User,
  Home,
  Briefcase,
  Mail,
  BadgeCheck,
  Info,
  Share2,
  CreditCard,
  MessageSquare,
  Rocket,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getPublicSiteUrl } from "@/lib/constants";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { transitions, easings, durations } from "@/lib/symboolic.com-motion.framer";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/internship", label: "Internship", icon: Briefcase },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/projects", label: "Projects", icon: Rocket },
  { to: "/about", label: "About", icon: Info },
  { to: "/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/contact", label: "Contact", icon: Mail },
  { to: "/verify-certificate", label: "Verify", icon: BadgeCheck },
] as const;

const NAV_BADGES: Record<string, { text: string; variant: "coral" | "emerald" }> = {
  Internship: { text: "Popular", variant: "coral" },
  Verify: { text: "Instant", variant: "emerald" },
};

const DASHBOARD_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "My Tasks", icon: ListChecks, search: { tab: "tasks" } },
  { to: "/dashboard", label: "My Internships", icon: Briefcase, search: { tab: "internships" } },
  { to: "/dashboard", label: "Payment", icon: CreditCard, search: { tab: "payment" } },
  { to: "/dashboard", label: "Certificates", icon: Award, search: { tab: "certificates" } },
  { to: "/dashboard", label: "Profile", icon: User, search: { tab: "profile" } },
  { to: "/review", label: "Review", icon: MessageSquare },
] as const;

function UserDropdown({
  user,
  isAdmin,
  signOut,
  isDashboardPage,
}: {
  user: any;
  isAdmin?: boolean;
  signOut: () => void;
  isDashboardPage: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const name = user.email?.split("@")[0] || "User";
  const initial = user.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="relative" ref={dropRef}>
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={transitions.fast}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f95c4b]"
        aria-label="User menu"
        aria-expanded={open}
      >
        <span className="flex size-7 sm:size-8 items-center justify-center rounded-full brand-gradient text-xs font-bold text-white shadow-xs">
          {initial}
        </span>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate hidden md:inline">
          {name}
        </span>
        <ChevronDown
          className={`size-3.5 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={transitions.fast}
            className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl backdrop-blur-2xl dark:bg-[#0F172A] dark:border-slate-800 overflow-hidden"
          >
            {/* User Info Header */}
            <div className="px-3 py-2.5 mb-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-foreground truncate">{name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </div>

            <div className="space-y-0.5 text-xs font-medium">
              {!isDashboardPage && (
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f95c4b]"
                >
                  <LayoutDashboard className="size-4 text-blue-600" /> Student Dashboard
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f95c4b]"
                >
                  <Shield className="size-4 text-amber-500" /> Admin Control Panel
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  const url = getPublicSiteUrl();
                  if (navigator.share) {
                    navigator.share({
                      title: "Skyrovix Internship",
                      text: "Check out this internship platform!",
                      url,
                    });
                  } else {
                    navigator.clipboard.writeText(url);
                    toast.success("Platform link copied to clipboard!");
                  }
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f95c4b]"
              >
                <Share2 className="size-4 text-violet-500" /> Share Platform
              </button>

              <div className="my-1 border-t border-border/40" />

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f95c4b]"
              >
                <LogOut className="size-4" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar({ variant }: { variant?: "public" | "auto" } = {}) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const router = useRouterState();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll listener with robust scroll container checking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY =
        window.scrollY ||
        document.documentElement?.scrollTop ||
        document.body?.scrollTop ||
        0;
      const isScrolled = scrollY > 20;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Keyboard accessibility: ESC closes mobile menu
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const pathname = router.location.pathname;
  const currentTab = (router.location.search as Record<string, string | undefined>)?.tab;
  const isDashboardPage =
    variant === "public"
      ? false
      : pathname === "/dashboard" || pathname.startsWith("/review");
  const itemsToRender = isDashboardPage ? DASHBOARD_ITEMS : NAV;

  const isItemActive = (
    item: (typeof DASHBOARD_ITEMS)[number] | (typeof NAV)[number]
  ) => {
    if (isDashboardPage) {
      if (item.to === "/") {
        return false;
      }
      if (item.to === "/review") {
        return pathname.startsWith("/review");
      }
      if (item.to === "/dashboard") {
        if (pathname !== "/dashboard") return false;
        const targetTab =
          "search" in item && item.search?.tab ? item.search.tab : "tasks";
        const activeTab = currentTab || "tasks";
        return targetTab === activeTab;
      }
      return false;
    }
    if (item.to === "/internship") {
      return pathname.startsWith("/internship") || pathname.startsWith("/domains");
    }
    return item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const goTo = (to: string, search?: Record<string, string>) => {
    navigate({ to, search });
    setOpen(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("dark");
      localStorage.removeItem("theme");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
    return () => {
      if (typeof window !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [open]);

  // Motion transitions matching Symboolic design lang: easeOut [0.22, 1, 0.36, 1], 0.3s
  const navTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: durations.md, ease: easings.easeOut };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 w-full flex justify-center pointer-events-none"
        initial={false}
        animate={{
          paddingTop: scrolled ? 16 : 0,
          paddingLeft: scrolled ? 16 : 0,
          paddingRight: scrolled ? 16 : 0,
        }}
        transition={navTransition}
      >
        <motion.nav
          role="navigation"
          aria-label="Main Navigation"
          initial={false}
          animate={{
            borderRadius: scrolled ? 9999 : 0,
            height: scrolled ? 54 : 72,
            boxShadow: scrolled
              ? "0 12px 32px -8px rgba(0, 0, 0, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06)"
              : "0 0 0 0 transparent",
          }}
          transition={navTransition}
          className={cn(
            "pointer-events-auto transition-all duration-300 flex items-center backdrop-blur-xl",
            scrolled
              ? "w-[calc(100%-24px)] max-w-md lg:w-auto lg:max-w-fit mx-auto justify-between lg:justify-center gap-2 sm:gap-4 lg:gap-5 px-4 sm:px-5 lg:px-4.5 py-1.5 rounded-full border border-black/[0.08] bg-white/95 shadow-md shadow-black/[0.04]"
              : "w-full max-w-7xl mx-auto justify-between px-4 sm:px-6 lg:px-8 bg-transparent border-b border-transparent"
          )}
        >
          {/* Logo / Scrolled Emblem */}
          <Link
            to="/"
            className="shrink-0 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f95c4b] rounded-full group"
            onClick={() => setOpen(false)}
            aria-label="Skyrovix Home"
          >
            {scrolled ? (
              <div className="flex items-center gap-2 group-hover:scale-[1.02] transition-transform">
                <Logo short className="h-7 sm:h-8 w-auto object-contain" />
                <span className="lg:hidden font-extrabold text-[15px] tracking-tight text-[#181619]">
                  SKYROVIX
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <Logo className="h-8.5 sm:h-10 w-auto object-contain" />
              </div>
            )}
          </Link>

          {/* Center Desktop Navigation Tabs with Symboolic Mouse Hover Dot */}
          <div
            className={cn(
              "hidden lg:flex items-center shrink-0",
              scrolled ? "gap-1 xl:gap-2" : "gap-1.5 xl:gap-3"
            )}
            onMouseLeave={() => setHoveredNav(null)}
          >
            {itemsToRender.map((n) => {
              const isActive = isItemActive(n);
              const isSelected = hoveredNav ? hoveredNav === n.label : isActive;

              return (
                <div
                  key={n.label}
                  className="relative"
                  onMouseEnter={() => setHoveredNav(n.label)}
                >
                  <Link
                    to={n.to}
                    search={"search" in n ? n.search : undefined}
                    activeOptions={{ exact: n.to === "/" }}
                    className={cn(
                      "relative inline-flex flex-col items-center justify-center whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f95c4b] rounded-lg",
                      scrolled
                        ? "px-2.5 xl:px-3 py-1.5 text-xs xl:text-[13px]"
                        : "px-3 xl:px-3.5 py-2 text-xs xl:text-sm",
                      "font-medium",
                      isSelected
                        ? "text-[#181619] dark:text-white font-semibold"
                        : "text-[#181619]/75 dark:text-[#f2f0e9]/75 hover:text-[#181619] dark:hover:text-white"
                    )}
                  >
                    <span>{n.label}</span>
                    {isSelected && (
                      <motion.span
                        layoutId="navbar-hover-dot"
                        className="absolute bottom-0 size-[5px] rounded-full bg-[#181619] dark:bg-white"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {user ? (
              <>
                <NotificationMenu />
                <UserDropdown
                  user={user}
                  isAdmin={isAdmin}
                  signOut={signOut}
                  isDashboardPage={isDashboardPage}
                />
              </>
            ) : (
              <motion.div
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={transitions.fast}
                className="hidden lg:inline-flex"
              >
                <Button
                  asChild
                  size="sm"
                  className={`rounded-full ${
                    scrolled
                      ? "h-8 px-3.5 text-xs font-semibold"
                      : "h-9 sm:h-9.5 px-4.5 sm:px-5 text-xs sm:text-sm font-semibold"
                  } bg-[#181619] hover:bg-[#f95c4b] text-white transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f95c4b]`}
                >
                  <Link to="/auth">
                    Login / Register
                  </Link>
                </Button>
              </motion.div>
            )}

            {/* Mobile Hamburger Toggle */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              transition={transitions.fast}
              type="button"
              onClick={() => setOpen(true)}
              className={cn(
                "flex lg:hidden items-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f95c4b]",
                scrolled
                  ? "gap-1.5 px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 active:bg-black/15 text-[#181619]"
                  : "justify-center size-9.5 rounded-full bg-black/5 hover:bg-black/10 active:bg-black/15 text-[#181619]"
              )}
              aria-label="Open navigation menu"
              aria-expanded={open}
            >
              <Menu className={scrolled ? "size-4" : "size-5"} />
              {scrolled && <span className="text-xs font-semibold">Menu</span>}
            </motion.button>
          </div>
        </motion.nav>
      </motion.header>

      {/* Mobile Menu — Fullscreen Sleek Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] lg:hidden bg-[#faf8f2] flex flex-col"
          >
            {/* Seamless Integrated Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-black/[0.06] bg-[#faf8f2] shrink-0">
              <Link to="/" onClick={() => setOpen(false)} aria-label="Skyrovix Home">
                <Logo className="h-8.5 w-auto object-contain" />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="size-9 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f95c4b]"
                aria-label="Close navigation menu"
              >
                <X className="size-5 text-[#181619]" />
              </button>
            </div>

            {/* Scrollable Navigation List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {user && (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs mb-3">
                  <span className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-[#f95c4b] to-[#ee9590] text-white text-sm font-bold shadow-xs shrink-0">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#181619] truncate">
                      {user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              {itemsToRender.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);
                const badge = NAV_BADGES[item.label];

                return (
                  <button
                    key={item.label}
                    onClick={() =>
                      goTo(item.to, "search" in item ? item.search : undefined)
                    }
                    className={cn(
                      "w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-left transition-all duration-150 cursor-pointer group active:scale-[0.99]",
                      active
                        ? "bg-[#f95c4b]/10 text-[#f95c4b] font-bold"
                        : "text-[#181619] hover:bg-black/[0.04] font-medium"
                    )}
                  >
                    <div
                      className={cn(
                        "size-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
                        active
                          ? "bg-[#f95c4b] text-white shadow-xs"
                          : "bg-white text-slate-600 border border-black/[0.06] group-hover:text-[#181619] group-hover:border-black/10"
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <span className="text-[15px]">{item.label}</span>
                    {badge && (
                      <span
                        className={cn(
                          "ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                          badge.variant === "coral"
                            ? "bg-[#f95c4b]/12 text-[#f95c4b]"
                            : "bg-emerald-500/12 text-emerald-600"
                        )}
                      >
                        {badge.text}
                      </span>
                    )}
                    <ChevronRight
                      className={cn(
                        "size-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                        badge ? "ml-1.5" : "ml-auto",
                        active ? "text-[#f95c4b]" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                  </button>
                );
              })}

              {user && (
                <div className="pt-2 mt-2 border-t border-black/[0.06] space-y-1">
                  {!isDashboardPage && (
                    <button
                      onClick={() => goTo("/dashboard")}
                      className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-left text-[#181619] hover:bg-black/[0.04] font-medium transition-all cursor-pointer"
                    >
                      <div className="size-9 rounded-xl flex items-center justify-center shrink-0 bg-white border border-black/[0.06] text-slate-600">
                        <LayoutDashboard className="size-4" />
                      </div>
                      <span className="text-[15px]">Dashboard</span>
                      <ChevronRight className="size-4 ml-auto text-slate-400" />
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => goTo("/admin")}
                      className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-left text-[#181619] hover:bg-black/[0.04] font-medium transition-all cursor-pointer"
                    >
                      <div className="size-9 rounded-xl flex items-center justify-center shrink-0 bg-white border border-black/[0.06] text-slate-600">
                        <Shield className="size-4" />
                      </div>
                      <span className="text-[15px]">Admin Panel</span>
                      <ChevronRight className="size-4 ml-auto text-slate-400" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-left text-red-600 hover:bg-red-50 font-medium transition-all cursor-pointer"
                  >
                    <div className="size-9 rounded-xl flex items-center justify-center shrink-0 bg-red-50 text-red-500">
                      <LogOut className="size-4" />
                    </div>
                    <span className="text-[15px]">Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions Area */}
            <div className="px-5 pt-3 pb-8 border-t border-black/[0.06] bg-[#faf8f2] shrink-0 space-y-3">
              {!user && (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-full bg-[#181619] hover:bg-[#f95c4b] active:scale-[0.98] text-white text-sm font-bold shadow-md shadow-black/10 transition-all text-center"
                >
                  <User className="size-4" />
                  <span>Login / Register</span>
                </Link>
              )}
              <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
                <span>MSME Registered</span>
                <span>•</span>
                <span>Verified Certificates</span>
                <span>•</span>
                <span>100% Online</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
