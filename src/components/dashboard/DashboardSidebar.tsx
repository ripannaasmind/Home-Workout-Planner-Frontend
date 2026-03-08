"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/dashboard/shop", label: "Shop", icon: ShoppingBag },
  { href: "/dashboard/orders", label: "Sessions", icon: ShoppingCart },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex flex-col w-52 shrink-0 bg-white dark:bg-card border-r border-gray-200 dark:border-gray-800 sticky top-16 h-[calc(100vh-80px)] overflow-y-auto py-4">
      {}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group overflow-hidden",
              isActive(href)
                ? "bg-primary text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
            )}
          >
            <span className={cn(
              "absolute left-0 top-0 w-[3px] rounded-r-full transition-all duration-300",
              isActive(href) ? "h-full bg-white/50" : "h-0 group-hover:h-full bg-primary"
            )} />
            <Icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            {label}
          </Link>
        ))}
      </nav>

      {}
      <div className="px-3 mt-2 border-t border-gray-100 dark:border-gray-800 pt-2">
        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="relative flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 hover:translate-x-1 transition-all duration-200 mb-1 group overflow-hidden"
          >
            <span className="absolute left-0 top-0 w-[3px] rounded-r-full h-0 group-hover:h-full bg-primary transition-all duration-300" />
            <Shield className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            Admin Panel
          </Link>
        )}
        <button
          onClick={logout}
          className="relative flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 hover:translate-x-1 transition-all duration-200 group overflow-hidden"
        >
          <span className="absolute left-0 top-0 w-[3px] rounded-r-full h-0 group-hover:h-full bg-red-400 transition-all duration-300" />
          <LogOut className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
