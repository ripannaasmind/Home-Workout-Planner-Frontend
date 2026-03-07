"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="My Orders"
        description="Track your purchase history and order status"
      />
      <RecentOrdersTable />
    </div>
  );
}
