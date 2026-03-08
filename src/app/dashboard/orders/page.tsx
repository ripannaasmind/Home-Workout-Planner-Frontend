"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";


// ------- Orders Page Component -------
export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="My Workout Sessions"
        description="View your workout session history and progress"
      />
      <RecentOrdersTable />
    </div>
  );
}
