"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dumbbell, Menu, Search, ShoppingCart, X, LayoutDashboard, LogOut, Sun, Moon } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ALL_CURRENCIES } from "@/context/ThemeContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/workouts", label: "Workouts" },
  { href: "/shop", label: "Shop" },
  { href: "/testimonials", label: "Testimonials" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, setTheme, currency, setCurrency } = useTheme();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary">
            <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-foreground">FitHome</span>
        </Link>

        {}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-primary"
                  : "text-text-secondary hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {}
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2" ref={searchContainerRef}>
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 lg:w-56 h-9 text-sm"
              />
              <Button type="submit" size="sm" className="h-9 bg-primary hover:bg-primary-dark">
                Search
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Currency selector */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="h-9 px-2 text-xs rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
            title="Select currency"
          >
            {ALL_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {!isAuthenticated && (
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary-dark text-white font-medium px-4 lg:px-5 text-sm">
                Get Started
              </Button>
            </Link>
          )}

          {}
          {isAuthenticated && user && (
            <Popover>
              <PopoverTrigger asChild>
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <Avatar size="default">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-2">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground rounded-md hover:bg-muted transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {}
        <div className="flex md:hidden items-center gap-1 sm:gap-2">
          {}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Dark mode toggle - mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[9px] sm:text-[10px] bg-primary text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-70 sm:w-[320px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6 mt-6">
                {}
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                      <Dumbbell className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">FitHome</span>
                  </Link>
                </div>

                {}
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-base font-medium transition-colors py-2 px-3 rounded-lg ${
                        isActive(link.href)
                          ? "text-primary bg-primary/10"
                          : "text-text-secondary hover:text-primary hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Currency selector - mobile */}
                <div className="px-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full h-9 px-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none"
                  >
                    {ALL_CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {}
                <div className="flex flex-col gap-3 mt-4">
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted">
                        <Avatar size="sm">
                          {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.name} />
                          ) : null}
                          <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full h-11 gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        onClick={() => { handleLogout(); setIsOpen(false); }}
                        variant="outline"
                        className="w-full h-11 gap-2 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button variant="outline" className="w-full h-11">
                          Login
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button className="w-full bg-primary hover:bg-primary-dark text-white h-11">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {}
      {isSearchOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-10 text-sm"
            />
            <Button type="submit" className="h-10 px-4 bg-primary hover:bg-primary-dark text-sm">
              Search
            </Button>
          </form>
        </div>
      )}
    </header>
  );
}
