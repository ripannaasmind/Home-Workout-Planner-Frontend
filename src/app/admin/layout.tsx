"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Activity,
  ShoppingBag,
  MessageSquare,
  LogOut,
  Settings,
  Tag,
  Package,
  Layers,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/workouts", label: "Workouts", icon: Dumbbell, exact: false },
  { href: "/admin/exercises", label: "Exercises", icon: Activity, exact: false },
  { href: "/admin/products", label: "Products", icon: ShoppingBag, exact: false },
  { href: "/admin/orders", label: "Orders", icon: Package, exact: false },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquare, exact: false },
  { href: "/admin/features", label: "Features Page", icon: Layers, exact: false },
  { href: "/admin/promo-codes", label: "Promo Codes", icon: Tag, exact: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
];

function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const navContent = (onNavigate?: () => void) => (
    <>
      <nav className="flex-1 px-3 space-y-0.5">
        {adminNav.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group overflow-hidden",
              isActive(href, exact)
                ? "bg-primary text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
            )}
          >
            <span className={cn(
              "absolute left-0 top-0 w-0.75 rounded-r-full transition-all duration-300",
              isActive(href, exact) ? "h-full bg-white/50" : "h-0 group-hover:h-full bg-primary"
            )} />
            <Icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 mt-2 border-t border-gray-100 dark:border-gray-800 pt-2 space-y-0.5">
        <button
          onClick={() => { onNavigate?.(); logout(); }}
          className="relative flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 hover:translate-x-1 transition-all duration-200 group overflow-hidden"
        >
          <span className="absolute left-0 top-0 w-0.75 rounded-r-full h-0 group-hover:h-full bg-red-400 transition-all duration-300" />
          <LogOut className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger trigger + Sheet drawer */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin sidebar menu"
        className="lg:hidden fixed top-14 sm:top-16 left-0 z-40 h-9 w-9 rounded-none rounded-br-md border-b border-r border-gray-200 dark:border-gray-800 bg-background/95 backdrop-blur shadow-sm"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-56 p-0 flex flex-col pt-6">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          {navContent(() => setMobileOpen(false))}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 bg-white dark:bg-card border-r border-gray-200 dark:border-gray-800 sticky top-16 h-[calc(100vh-80px)] overflow-y-auto py-4">
        {navContent()}
      </aside>
    </>
  );
}


// ------- Admin Layout Component -------
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") return null;

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-50 dark:bg-background">
      <div className="flex flex-col flex-1">
        <Header />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 min-w-0 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
