import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function RecentOrdersTable() {
    const orders = [
        {
            id: "FH1834",
            date: "Apr 23, 2024",
            status: "Shipped",
            total: "$89.00",
        },
        {
            id: "FH1817",
            date: "Apr 18, 2024",
            status: "Delivered",
            total: "$49.00",
        },
        {
            id: "FH1795",
            date: "Apr 04, 2024",
            status: "Canceled",
            total: "$39.00",
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Shipped":
            case "Delivered":
                return <Badge className="bg-[#5d8b63]/10 text-[#5d8b63] hover:bg-[#5d8b63]/20 border-0">{status}</Badge>;
            case "Canceled":
                return <Badge variant="secondary" className="bg-gray-100 text-gray-500 hover:bg-gray-200 border-0">{status}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-border mb-8">
            <h3 className="text-xl font-semibold mb-6">Recent Orders</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border/50 text-muted-foreground text-sm">
                            <th className="pb-3 font-medium">Order ID</th>
                            <th className="pb-3 font-medium text-center">Date</th>
                            <th className="pb-3 font-medium text-center">Status</th>
                            <th className="pb-3 font-medium text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, i) => (
                            <tr key={order.id} className="border-b border-border/50 hover:bg-neutral-50/50 transition-colors">
                                <td className="py-4 font-medium text-foreground">{order.id}</td>
                                <td className="py-4 text-muted-foreground text-sm text-center">{order.date}</td>
                                <td className="py-4 text-center">{getStatusBadge(order.status)}</td>
                                <td className="py-4 font-medium text-right text-foreground">{order.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 text-right">
                <Link href="/dashboard/orders" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group">
                    View All Orders <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}
