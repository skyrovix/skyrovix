import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, ListChecks,
  Briefcase, Award, CreditCard, User, Crown, ChevronLeft,
  ChevronRight, ExternalLink, HelpCircle, Sparkles, LogOut,
  CheckCircle2, Laptop
} from "lucide-react";

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface StudentDashboardSidebarProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
  app: any;
  domainName?: string;
  isPremium: boolean;
  onUpgradeToPremium?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  isMobileSheet?: boolean;
  premiumFee?: number;
  isPremiumPlanEnabled?: boolean;
}

export const DASHBOARD_NAV_GROUPS: { group: string; items: NavItemConfig[] }[] = [
  {
    group: "Workspace",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "tasks", label: "My Tasks", icon: ListChecks },
    ],
  },
  {
    group: "Academic & Records",
    items: [
      { id: "internships", label: "My Internships", icon: Briefcase },
      { id: "certificates", label: "Certificates", icon: Award },
      { id: "payment", label: "Payment", icon: CreditCard },
      { id: "profile", label: "Profile", icon: User },
    ],
  },
];

export function StudentDashboardSidebar({
  activeTab,
  onSelectTab,
  app,
  domainName,
  isPremium,
  onUpgradeToPremium,
  collapsed = false,
  onToggleCollapsed,
  isMobileSheet = false,
  premiumFee = 200,
  isPremiumPlanEnabled = true,
}: StudentDashboardSidebarProps) {
  const isFullStack = app?.domain === "fullstack";
  const isPremiumFeatureActive = Boolean(isPremiumPlanEnabled);

  const containerClasses = isMobileSheet
    ? "flex flex-col h-full select-none justify-between space-y-3"
    : `hidden lg:flex flex-col shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] z-30 transition-all duration-300 rounded-3xl border border-border/70 bg-white/95 backdrop-blur-2xl p-3 shadow-md select-none justify-between overflow-hidden ${
        collapsed ? "w-20" : "w-64 xl:w-72"
      }`;

  const visibleNavGroups = DASHBOARD_NAV_GROUPS;

  return (
    <aside className={containerClasses}>
      <div className="space-y-3 overflow-y-auto scrollbar-none flex-1 pr-0.5">
        {/* Student Profile Snapshot Header */}
        {!collapsed ? (
          <div className="rounded-2xl border border-border/60 bg-[#faf8f2] p-3 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-2xl brand-gradient text-white grid place-items-center font-black text-xs shadow-md shadow-[#f95c4b]/20 shrink-0">
                {app?.photo_url ? (
                  <img
                    src={app.photo_url}
                    alt={app.full_name || "Student"}
                    className="size-full rounded-2xl object-cover"
                  />
                ) : (
                  (app?.full_name || "S").slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-xs text-[#181619] truncate leading-tight">
                  {app?.full_name || "Student Intern"}
                </p>
                <p className="text-[10px] font-mono font-bold text-[#f95c4b] truncate mt-0.5">
                  {app?.intern_id || "SKY-INTERN"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                  {domainName || app?.domain || "Full Stack Development"}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-1 text-[10px]">
              {isPremium && isPremiumFeatureActive ? (
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[9.5px] font-black uppercase tracking-wider py-0.5 px-2">
                  <Crown className="size-3 mr-1 text-amber-500" /> Premium Track (₹{premiumFee})
                </Badge>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <Badge variant="secondary" className="text-[9.5px] font-bold">
                    Standard Track
                  </Badge>
                  {isPremiumFeatureActive && isFullStack && onUpgradeToPremium && (app?.duration === 3 || app?.duration === 6) && (
                    <button
                      type="button"
                      onClick={onUpgradeToPremium}
                      className="text-[10px] font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                    >
                      Upgrade ₹{premiumFee}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-2 border-b border-border/40">
            <div className="size-10 rounded-xl brand-gradient text-white grid place-items-center font-black text-xs shadow-sm">
              {app?.photo_url ? (
                <img
                  src={app.photo_url}
                  alt={app.full_name || "Student"}
                  className="size-full rounded-xl object-cover"
                />
              ) : (
                (app?.full_name || "S").slice(0, 2).toUpperCase()
              )}
            </div>
            {isPremium && isPremiumFeatureActive && (
              <Crown className="size-3 text-amber-500 mt-1" />
            )}
          </div>
        )}

        {/* Navigation Item Groups */}
        {visibleNavGroups.map((group) => (
          <div key={group.group} className="space-y-0.5">
            {!collapsed && (
              <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-muted-foreground/75 px-2.5 block mb-1">
                {group.group}
              </span>
            )}
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeTab === item.id ||
                  (item.id === "tasks" && activeTab === "overview");

                const badgeLabel = item.badge;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#181619] text-white shadow-md shadow-[#181619]/15"
                        : "text-[#181619]/75 hover:text-[#181619] hover:bg-[#faf8f2]"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                  >
                    <Icon
                      className={`size-4 shrink-0 transition-colors ${
                        isActive ? "text-[#f95c4b]" : "text-muted-foreground group-hover:text-[#181619]"
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!collapsed && badgeLabel && (
                      <span
                        className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-extrabold shrink-0 ${
                          isActive
                            ? "bg-amber-400 text-slate-950"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}
                      >
                        {badgeLabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Sidebar Footer Area */}
      <div className="pt-2 border-t border-border/50 space-y-1.5 mt-auto shrink-0">
        {/* Upgrade Callout Card (only when fullstack & not premium & premium plan enabled) */}
        {!collapsed && isPremiumFeatureActive && !isPremium && isFullStack && onUpgradeToPremium && (app?.duration === 3 || app?.duration === 6) && (
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-2 space-y-1">
            <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-amber-800 dark:text-amber-300">
              <Crown className="size-3 text-amber-600" />
              <span>Full Stack Premium (₹{premiumFee})</span>
            </div>
            <p className="text-[9.5px] text-muted-foreground leading-snug">
              Unlock 50+ project resources & priority review.
            </p>
            <Button
              size="sm"
              onClick={onUpgradeToPremium}
              className="w-full h-6 rounded-lg text-[9.5px] font-black brand-gradient text-white shadow-xs"
            >
              Upgrade Now
            </Button>
          </div>
        )}

        {/* Collapse / Expand Toggle Button (only on desktop) */}
        {!isMobileSheet && onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={`w-full flex items-center gap-2 py-1.5 px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-[#faf8f2] transition-all cursor-pointer ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!collapsed && <span>Collapse Sidebar</span>}
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
