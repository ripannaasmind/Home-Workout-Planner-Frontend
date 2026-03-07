import { Badge } from "@/components/ui/badge";
import { Package, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Order {
  id: string;
  date: string;
  product: string;
  total: string;
  status: "Delivered" | "Shipped" | "Processing" | "Cancelled";
  iconBg: string;
  icon: React.ElementType;
  iconColor: string;
}

const defaultOrders: Order[] = [
  {
    id: "FH1834",
    date: "Apr 25, 2024",
    product: "Supplement Pack",
    total: "$89.00",
    status: "Shipped",
    iconBg: "bg-amber-50",
    icon: Package,
    iconColor: "text-amber-600",
  },
  {
    id: "FH1817",
    date: "Apr 18, 2024",
    product: "Whey Protein Powder",
    total: "$49.00",
    status: "Delivered",
    iconBg: "bg-blue-50",
    icon: ShoppingBag,
    iconColor: "text-blue-600",
  },
];

const statusStyle = {
  Delivered: "bg-green-100 text-green-700 hover:bg-green-100",
  Shipped: "bg-green-600 text-white hover:bg-green-600",
  Processing: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  Cancelled: "bg-gray-100 text-gray-500 hover:bg-gray-100",
};

interface RecentOrdersGridProps {
  orders?: Order[];
}

export function RecentOrdersGrid({ orders = defaultOrders }: RecentOrdersGridProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Orders</h3>
      <div className="space-y-3">
        {orders.map((order) => {
          const Icon = order.icon;
          return (
            <div
              key={order.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${order.iconBg}`}
              >
                <Icon className={`h-6 w-6 ${order.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{order.product}</p>
                <p className="text-xs text-gray-500">{order.id} · {order.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-800">{order.total}</p>
                <Badge className={cn("border-0 text-xs mt-1", statusStyle[order.status])}>
                  {order.status}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-right">
        <Link href="/dashboard/orders" className="text-xs text-gray-500 hover:text-primary transition-colors">
          View All
        </Link>
      </div>
    </div>
  );
}
