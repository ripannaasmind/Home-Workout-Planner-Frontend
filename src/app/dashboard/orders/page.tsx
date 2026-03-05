import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import Link from "next/link";

const orders = [
    { id: "FH1834", date: "Apr 23, 2024", status: "Shipped", total: "$89.00", items: ["Adjustable Dumbbell"] },
    { id: "FH1817", date: "Apr 18, 2024", status: "Delivered", total: "$49.00", items: ["Whey Protein Powder"] },
    { id: "FH1795", date: "Apr 04, 2024", status: "Canceled", total: "$39.00", items: ["Resistance Bands Set"] },
    { id: "FH1760", date: "Mar 28, 2024", status: "Delivered", total: "$129.00", items: ["Yoga Mat", "Foam Roller"] },
    { id: "FH1742", date: "Mar 15, 2024", status: "Delivered", total: "$59.00", items: ["Jump Rope Pro"] },
];

const statusStyles: Record<string, string> = {
    Shipped: "bg-blue-50 text-blue-600 border-blue-200",
    Delivered: "bg-[#5d8b63]/10 text-[#5d8b63] border-[#5d8b63]/20",
    Canceled: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function OrdersPage() {
    return (
        <div className="flex flex-col h-full bg-[#f4f7f4] rounded-3xl p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-foreground">Orders</h1>
                <p className="text-muted-foreground mt-1">View and track all your orders.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Total Orders", value: "5" },
                    { label: "Delivered", value: "3" },
                    { label: "Total Spent", value: "$365.00" },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-3xl p-5 border border-border/50 shadow-sm">
                        <p className="text-2xl font-bold text-foreground">{s.value}</p>
                        <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Orders list */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/50 text-muted-foreground text-sm">
                                <th className="pb-3 font-medium">Order ID</th>
                                <th className="pb-3 font-medium">Items</th>
                                <th className="pb-3 font-medium text-center">Date</th>
                                <th className="pb-3 font-medium text-center">Status</th>
                                <th className="pb-3 font-medium text-right">Total</th>
                                <th className="pb-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="border-b border-border/50 hover:bg-neutral-50/50 transition-colors">
                                    <td className="py-4 font-medium text-foreground flex items-center gap-2">
                                        <Package className="w-4 h-4 text-muted-foreground" />
                                        {order.id}
                                    </td>
                                    <td className="py-4 text-sm text-muted-foreground">{order.items.join(", ")}</td>
                                    <td className="py-4 text-muted-foreground text-sm text-center">{order.date}</td>
                                    <td className="py-4 text-center">
                                        <Badge className={`border text-xs ${statusStyles[order.status]}`}>{order.status}</Badge>
                                    </td>
                                    <td className="py-4 font-medium text-right text-foreground">{order.total}</td>
                                    <td className="py-4 text-right">
                                        <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 rounded-full" asChild>
                                            <Link href="#">View</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
