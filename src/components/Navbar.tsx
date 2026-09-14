import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { NotificationMenu } from "./NotificationMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, LayoutDashboard, Shield, Menu, X, BookOpen, ListChecks, Award, User, Home, Briefcase, Mail, BadgeCheck, Info, Moon, Sparkles, Code2, Share2, HelpCircle, Package, CreditCard, MessageSquare, Rocket, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getPublicSiteUrl } from "@/lib/constants";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/domains", label: "Internship", icon: Briefcase },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/projects", label: "Projects", icon: Rocket },
  { to: "/about", label: "About", icon: Info },
  { to: "/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/contact", label: "Contact", icon: Mail },
  { to: "/verify-certificate", label: "Verify", icon: BadgeCheck },
] as const;

const DASHBOARD_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "My Tasks", icon: ListChecks, search: { tab: "tasks" } },
  { to: "/dashboard", label: "My Internships", icon: Briefcase, search: { tab: "internships" } },
  { to: "/dashboard", label: "Payment", icon: CreditCard, search: { tab: "payment" } },
  { to: "/dashboard", label: "Certificates", icon: Award, search: { tab: "certificates" } },
  { to: "/dashboard", label: "Profile", icon: User, search: { tab: "profile" } },
  { to: "/review", label: "Review", icon: MessageSquare },
] as const;

function UserDropdown({ user, isAdmin, signOut, isDashboardPage }: { user: any; isAdmin?: boolean; signOut: () => void; isDashboardPage: boolean }) {
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
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
        aria-label="User menu"
      >
        <span className="flex size-7 sm:size-8 items-center justify-center rounded-lg brand-gradient text-xs font-bold text-white shadow-xs">
          {initial}
        </span>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate hidden md:inline">
          {name}
        </span>
        <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl backdrop-blur-2xl dark:bg-[#0F172A] dark:border-slate-800 animate-in zoom-in-95 overflow-hidden">
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
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <LayoutDashboard className="size-4 text-blue-600" /> Student Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
                  navigator.share({ title: "Skyrovix Internship", text: "Check out this internship platform!", url });
                } else {
                  navigator.clipboard.writeText(url);
                  toast.success("Platform link copied to clipboard!");
                }
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
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
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition text-left"
            >
              <LogOut className="size-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({ variant }: { variant?: "public" | "auto" } = {}) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const router = useRouterState();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const pathname = router.location.pathname;
  const currentTab = (router.location.search as Record<string, string | undefined>)?.tab;
  const isDashboardPage = variant === "public" ? false : (pathname === "/dashboard" || pathname.startsWith("/review"));
  const itemsToRender = isDashboardPage ? DASHBOARD_ITEMS : NAV;

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const goTo = (to: string, search?: Record<string, string>) => {
    navigate({ to, search });
    setOpen(false);
  };

  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-b ${
          scrolled 
            ? "bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-gray-200/80 dark:border-slate-800/80 shadow-xs"
            : "bg-white dark:bg-[#0f172a] border-gray-150 dark:border-slate-850"
        }`}
      >
        <nav className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex h-16 sm:h-20 items-center justify-between gap-3 w-full">
          {/* Logo */}
          <Link to="/" className="shrink-0 animate-fade-in" onClick={() => setOpen(false)}>
             <Logo />
          </Link>

          {/* Center Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center justify-center gap-1 xl:gap-1.5 shrink-0">
            {itemsToRender.map((n) => {
              const isActive = isDashboardPage
                ? (n.to === "/" ? false : (n.search?.tab ? currentTab === n.search.tab : !currentTab))
                : (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to));
              const Icon = n.icon;
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  search={"search" in n ? n.search : undefined}
                  activeOptions={{ exact: n.to === "/" }}
                  className={`whitespace-nowrap px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 rounded-xl ${
                    isActive
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`size-3.5 xl:size-4 shrink-0 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <NotificationMenu />
                <button 
                  onClick={() => setDark(!dark)}
                  aria-label="Toggle theme"
                  title="Toggle theme"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-slate-700 size-8 sm:size-9 text-gray-700 dark:text-slate-350 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                >
                  {dark ? <Sparkles className="size-3.5 sm:size-4 text-amber-400" /> : <Moon className="size-3.5 sm:size-4" />}
                </button>
                <UserDropdown user={user} isAdmin={isAdmin} signOut={signOut} isDashboardPage={isDashboardPage} />
              </>
            ) : (
              <>
                <button 
                  onClick={() => setDark(!dark)}
                  aria-label="Toggle theme"
                  title="Toggle theme"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-slate-700 size-8 sm:size-9 text-gray-700 dark:text-slate-350 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  {dark ? <Sparkles className="size-3.5 sm:size-4 text-amber-400" /> : <Moon className="size-3.5 sm:size-4" />}
                </button>
                <div className="inline-flex">
                  <Button asChild size="sm" className="rounded-xl h-9 sm:h-10 px-3 sm:px-5 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 flex items-center gap-1.5">
                    <Link to="/auth"><User className="size-3.5 sm:size-4 shrink-0" />Login / Register</Link>
                  </Button>
                </div>
              </>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex lg:hidden items-center justify-center size-9 rounded-xl border border-border hover:bg-[#07284a]/5 dark:hover:bg-white/5 transition-all touch-target cursor-pointer"
              aria-label="Toggle menu"
            >
              <span className={`transition-transform duration-300 ${open ? "rotate-90" : ""}`}>
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile backdrop */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden" onClick={() => setOpen(false)} />}

      {/* Mobile Menu — premium drawer */}
      {open && (
        <div
          ref={menuRef}
          className="fixed left-0 right-0 z-50 xl:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-b-3xl shadow-2xl border-b border-slate-100 dark:border-slate-800 overflow-y-auto"
          style={{
            top: "64px",
            maxHeight: "calc(100dvh - 64px)",
            animation: "fade-in-down 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          <div className="px-5 pt-4 pb-8 flex flex-col gap-2">
            {user ? (
              <>
                {/* User Profile */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 mb-2 border border-blue-100/50 dark:border-slate-700/50 shadow-sm">
                  <span className="flex items-center justify-center size-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 shrink-0">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.email?.split("@")[0]}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button onClick={() => setDark(!dark)} className="size-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 transition-all shrink-0">
                    {dark ? <Sparkles className="size-4" /> : <Moon className="size-4" />}
                  </button>
                </div>

                {/* Section label */}
                <div className="flex items-center gap-2 px-1 py-1.5">
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-200/50 to-transparent dark:from-blue-800/30" />
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">{isDashboardPage ? "Dashboard" : "Navigation"}</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-blue-200/50 to-transparent dark:from-blue-800/30" />
                </div>

                {/* Nav items */}
                <div className="flex flex-col gap-1">
                  {itemsToRender.map((item, i) => {
                    const Icon = item.icon;
                    const active = isDashboardPage
                      ? (item.to === "/" ? false : (item.search?.tab ? currentTab === item.search.tab : !currentTab))
                      : (item.to === "/" ? pathname === "/" : pathname.startsWith(item.to));
                    return (
                      <button
                        key={item.label}
                        onClick={() => goTo(item.to, "search" in item ? item.search : undefined)}
                        className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all duration-200 text-sm font-semibold active:scale-[0.98] ${
                          active
                            ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-sm"
                            : "bg-slate-50/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80"
                        }`}
                        style={{ opacity: 0, animation: `fade-in-up 0.2s ease-out ${0.04 * i}s forwards` }}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                        )}
                        <div className={`size-9 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/20"
                            : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:scale-105"
                        }`}>
                          <Icon className="size-4" />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

                {/* Section label */}
                <div className="flex items-center gap-2 px-1 py-1.5">
                  <div className="h-px flex-1 bg-gradient-to-r from-red-200/30 to-transparent dark:from-red-800/20" />
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Account</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-red-200/30 to-transparent dark:from-red-800/20" />
                </div>

                <div className="flex flex-col gap-1">
                  {user && !isDashboardPage && (
                    <Link to="/dashboard" onClick={() => setOpen(false)}
                      className="group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-350 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all active:scale-[0.98]">
                      <div className="size-9 shrink-0 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 text-slate-500 group-hover:scale-105 transition-all">
                        <LayoutDashboard className="size-4" />
                      </div>
                      <span>Dashboard</span>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setOpen(false)}
                      className="group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all active:scale-[0.98]">
                      <div className="size-9 shrink-0 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 text-slate-500 group-hover:scale-105 transition-all">
                        <Shield className="size-4" />
                      </div>
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button onClick={() => { signOut(); setOpen(false); }}
                    className="group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-all active:scale-[0.98]">
                    <div className="size-9 shrink-0 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 text-red-500 group-hover:scale-105 transition-all">
                      <LogOut className="size-4" />
                    </div>
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Section label */}
                <div className="flex items-center gap-2 px-1 py-1.5">
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-200/50 to-transparent dark:from-blue-800/30" />
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">Menu</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-blue-200/50 to-transparent dark:from-blue-800/30" />
                </div>

                {/* Public Nav Items */}
                <div className="flex flex-col gap-1">
                  {NAV.map((n, i) => {
                    const Icon = n.icon;
                    const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
                    return (
                      <button
                        key={n.to}
                        onClick={() => goTo(n.to)}
                        className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all duration-200 text-sm font-semibold active:scale-[0.98] ${
                          active
                            ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-sm"
                            : "bg-slate-50/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80"
                        }`}
                        style={{ opacity: 0, animation: `fade-in-up 0.2s ease-out ${0.04 * i}s forwards` }}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                        )}
                        <div className={`size-9 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/20"
                            : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:scale-105"
                        }`}>
                          <Icon className="size-4" />
                        </div>
                        <span className="truncate">{n.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile-only: theme toggle + auth */}
                <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
                <div className="flex items-center gap-2">
                  <button onClick={() => setDark(!dark)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold bg-slate-50/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all active:scale-[0.98]">
                    {dark ? <Sparkles className="size-4" /> : <Moon className="size-4" />}
                    <span>{dark ? "Light Mode" : "Dark Mode"}</span>
                  </button>
                  <Link
                    to="/auth"
                    onClick={() => setOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white py-3.5 text-sm font-bold shadow-md shadow-blue-500/20 active:scale-[0.97] transition-all"
                  >
                    <User className="size-4" />
                    <span>Login / Register</span>
                  </Link>
                </div>
              </>
            )}

            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-3 pt-2 border-t border-slate-100/50 dark:border-slate-800/50">
              © {new Date().getFullYear()} Skyrovix IT Solutions.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
