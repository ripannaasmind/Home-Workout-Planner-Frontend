"use client";

import Image from "next/image";
import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserProfileCard() {
    const router = useRouter();
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-border mb-8 text-center flex flex-col items-center">
            <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-primary/20">
                <Image
                    src="/profile.jpg"
                    alt="Justin Carter"
                    fill
                    className="object-cover"
                />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Justin Carter</h3>
            <p className="text-sm text-muted-foreground mb-6">justin@example.com</p>

            {/* Progress tracking fake */}
            <div className="w-full flex items-center justify-between gap-1 mb-8">
                <div className="h-1.5 flex-1 bg-primary rounded-full"></div>
                <div className="h-1.5 flex-[0.3] bg-primary rounded-full"></div>
                <div className="h-1.5 w-1.5 bg-border rounded-full"></div>
                <div className="h-1.5 w-1.5 bg-border rounded-full"></div>
            </div>

            <button
                onClick={() => router.push("/dashboard/profile")}
                className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors w-full border border-border/60 hover:border-primary/30 rounded-2xl py-2.5"
            >
                <CreditCard className="w-4 h-4" />
                Edit Profile
            </button>
        </div>
    );
}
