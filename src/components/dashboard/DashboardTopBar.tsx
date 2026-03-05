"use client";

import { Bell, Search, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";

export function DashboardTopBar() {
    const router = useRouter();
    const { totalItems } = useCart();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery("");
        }
    };

    return (
        <div className="flex justify-end items-center gap-4 mb-2">
            {/* Search */}
            {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                    <Input
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => { setSearchOpen(false); setSearchQuery(""); }}
                        placeholder="Search workouts, products..."
                        className="h-8 text-sm w-48 rounded-full border-border/60 focus-visible:ring-primary/30"
                    />
                </form>
            ) : (
                <button
                    onClick={() => setSearchOpen(true)}
                    title="Search"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Search className="w-5 h-5" />
                </button>
            )}

            {/* Notifications */}
            <button
                title="Notifications"
                className="text-muted-foreground hover:text-foreground transition-colors relative"
            >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#f4f7f4]"></span>
                </span>
            </button>

            {/* Cart */}
            <button
                onClick={() => router.push("/cart")}
                title="Cart"
                className="text-muted-foreground hover:text-foreground transition-colors relative"
            >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#5d8b63] text-white text-[10px] font-bold leading-none">
                        {totalItems > 9 ? "9+" : totalItems}
                    </span>
                )}
            </button>
        </div>
    );
}
