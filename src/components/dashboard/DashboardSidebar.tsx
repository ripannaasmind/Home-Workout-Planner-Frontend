"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  ShoppingBag,
  ShoppingCart,
  User,
  Settings,
  CreditCard,
  LogOut,
  Shield,
  Activity,
  Ticket,
  HelpCircle,
  Menu,
  X,
  Brain,
  Trophy,
  Calculator,
  CalendarDays,
  Crown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const navGroups = [
  {
    label: null,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, premium: false },
    ],
  },
  {
    label: "Fitness",
    items: [
      { href: "/dashboard/workouts", label: "Workouts", icon: Dumbbell, premium: false },
      { href: "/dashboard/ai-workout", label: "AI Workout", icon: Brain, premium: true },
      { href: "/dashboard/sessions", label: "My Sessions", icon: Activity, premium: false },
      { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays, premium: true },
      { href: "/dashboard/challenges", label: "Challenges", icon: Trophy, premium: true },
      { href: "/dashboard/calculators", label: "Calculators", icon: Calculator, premium: true },
    ],
  },
  {
    label: "Store",
    items: [
      { href: "/dashboard/shop", label: "Shop", icon: ShoppingBag, premium: false },
      { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart, premium: false },
      { href: "/dashboard/coupons", label: "Coupons", icon: Ticket, premium: false },
      { href: "/dashboard/billing", label: "Billing", icon: CreditCard, premium: false },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/support", label: "Support", icon: HelpCircle, premium: false },
      { href: "/dashboard/profile", label: "Profile", icon: User, premium: false },
      { href: "/dashboard/settings", label: "Settings", icon: Settings, premium: false },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMobileOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };

    let id: number | null = null;
    if (media.matches && mobileOpen) {
      id = requestAnimationFrame(() => setMobileOpen(false));
    }

    if (media.addEventListener) {
      media.addEventListener("change", onDesktop);
      return () => {
        if (id !== null) cancelAnimationFrame(id);
        media.removeEventListener("change", onDesktop);
      };
    }

    media.addListener(onDesktop);
    return () => {
      if (id !== null) cancelAnimationFrame(id);
      media.removeListener(onDesktop);
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const navContent = (onNavigate?: () => void) => (
    <>
      {onNavigate && (
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-linear-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-sm shadow-primary/30">
              <Dumbbell className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">FitHome</span>
          </div>
          <button
            onClick={onNavigate}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      )}

      <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-4">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, premium }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden",
                      active
                        ? premium
                          ? "bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/30"
                          : "bg-linear-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/30"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100 hover:translate-x-0.5"
                    )}
                  >
                    {/* Active left-edge glow */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/40" />
                    )}

                    <div className={cn(
                      "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                      active
                        ? "bg-white/20"
                        : premium
                          ? "bg-violet-50 dark:bg-violet-500/10 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20"
                          : "bg-gray-100 dark:bg-white/5 group-hover:bg-primary/10"
                    )}>
                      <Icon className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110",
                        active ? "text-white" : premium ? "text-violet-500" : "text-gray-500 dark:text-gray-400 group-hover:text-primary"
                      )} />
                    </div>

                    <span className="flex-1 truncate">{label}</span>

                    {premium && !active && (
                      <Crown className="h-3 w-3 text-amber-400 shrink-0" />
                    )}
                    {active && premium && (
                      <Sparkles className="h-3 w-3 text-white/70 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-2.5 pb-3 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-0.5 shrink-0">
        {user?.role === "admin" && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 hover:translate-x-0.5 transition-all duration-200 group"
          >
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            Admin Panel
          </Link>
        )}
        <button
          onClick={() => {
            onNavigate?.();
            logout();
            router.replace("/login");
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 hover:translate-x-0.5 transition-all duration-200 group"
        >
          <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-500/10 transition-colors">
            <LogOut className="h-3.5 w-3.5 group-hover:scale-110 transition-transform group-hover:text-red-500" />
          </div>
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar menu"
        className="lg:hidden fixed top-14 sm:top-16 left-0 z-50 flex items-center gap-1.5 h-9 px-3 bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-md rounded-br-xl transition-all"
      >
        <Menu className="h-4 w-4 shrink-0" />
        <span>Menu</span>
      </button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col" showCloseButton={false}>
          <SheetTitle className="sr-only">Dashboard Navigation</SheetTitle>
          {navContent(() => setMobileOpen(false))}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white/90 dark:bg-card border-r border-gray-200/80 dark:border-gray-800 sticky top-16 h-[calc(100vh-64px)] overflow-hidden py-0 backdrop-blur-sm">
        {navContent()}
      </aside>
    </>
  );
}



