"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  ShoppingBag,
  Package,
  CreditCard,
  User,
  Settings,
  LogOut,
  Leaf
} from "lucide-react";

export function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workouts", href: "/dashboard/workouts", icon: Activity },
    { name: "Shop", href: "/dashboard/shop", icon: ShoppingBag },
    { name: "Orders", href: "/dashboard/orders", icon: Package },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white/80 backdrop-blur-md rounded-3xl p-6 flex flex-col h-[calc(100vh-2rem)] sticky top-4 shadow-sm border border-border">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-4">
        <div className="bg-primary/20 p-2 rounded-lg">
          <Leaf className="w-6 h-6 text-primary" />
        </div>
        <span className="text-xl font-bold text-foreground">FitHome</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="pt-6 border-t border-border mt-auto">
        <button className="flex items-center gap-4 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 w-full text-left">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}
