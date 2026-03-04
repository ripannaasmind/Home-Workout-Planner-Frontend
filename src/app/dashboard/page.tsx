import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { UpcomingWorkout } from "@/components/dashboard/UpcomingWorkout";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { RecentOrdersGrid } from "@/components/dashboard/RecentOrdersGrid";
import { UserProfileCard } from "@/components/dashboard/UserProfileCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RecommendedForYouList } from "@/components/dashboard/RecommendedForYouList";
import { RecommendedForYouGrid } from "@/components/dashboard/RecommendedForYouGrid";
import { Bell, Search, ShoppingCart } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="flex flex-col h-full bg-[#f4f7f4] rounded-3xl p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[url('/images/decor/leaf-pattern.png')] bg-no-repeat bg-right-top opacity-10 pointer-events-none -z-10 mix-blend-multiply"></div>

            {/* Top action bar right aligned */}
            <div className="flex justify-end items-center gap-6 mb-2">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Search className="w-5 h-5" />
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#f4f7f4]"></span>
                    </span>
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content Area (Left/Center) */}
                <div className="flex-1 min-w-0">
                    <DashboardHeader />
                    <StatCards />
                    <UpcomingWorkout />
                    <RecentOrdersTable />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <RecentOrdersGrid />
                        </div>
                        <div className="lg:col-span-1">
                            <RecommendedForYouGrid />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Area */}
                <div className="w-full lg:w-80 shrink-0">
                    <UserProfileCard />
                    <RecentActivity />
                    <RecommendedForYouList />
                </div>
            </div>
        </div>
    );
}
