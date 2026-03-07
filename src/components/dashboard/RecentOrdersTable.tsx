import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Order {
  id: string;
  date: string;
  total: string;
  status: "Delivered" | "Shipped" | "Processing" | "Cancelled";
}

const defaultOrders: Order[] = [
  { id: "FH1834", date: "Apr 23, 2024", total: "$89.00", status: "Shipped" },
  { id: "FH1817", date: "Apr 18, 2024", total: "$49.00", status: "Delivered" },
  { id: "FH1795", date: "Apr 04, 2024", total: "$39.00", status: "Cancelled" },
];

const statusStyle = {
  Delivered: "bg-green-100 text-green-700 hover:bg-green-100",
  Shipped: "bg-green-600 text-white hover:bg-green-600",
  Processing: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  Cancelled: "bg-gray-100 text-gray-500 hover:bg-gray-100",
};

interface RecentOrdersTableProps {
  orders?: Order[];
}

export function RecentOrdersTable({ orders = defaultOrders }: RecentOrdersTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-gray-400 font-medium pb-3 pr-4">Order ID</th>
              <th className="text-left text-gray-400 font-medium pb-3 pr-4">Date</th>
              <th className="text-left text-gray-400 font-medium pb-3 pr-4">Status</th>
              <th className="text-left text-gray-400 font-medium pb-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4 font-semibold text-gray-800">{order.id}</td>
                <td className="py-3 pr-4 text-gray-500">{order.date}</td>
                <td className="py-3 pr-4">
                  <Badge className={cn("border-0 text-xs rounded-md", statusStyle[order.status])}>
                    {order.status}
                  </Badge>
                </td>
                <td className="py-3 font-semibold text-gray-800">{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex justify-end">
        <Link
          href="/dashboard/orders"
          className="text-xs text-gray-500 hover:text-primary flex items-center gap-0.5 transition-colors"
        >
          View All Orders <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
