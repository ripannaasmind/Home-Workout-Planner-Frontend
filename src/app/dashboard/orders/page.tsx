"use client";

import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <DashboardTopBar title="Orders" />
      <DashboardHeader
        title="My Orders"
        description="Track your purchase history and order status"
      />
      <RecentOrdersTable />
    </div>
  );
}
