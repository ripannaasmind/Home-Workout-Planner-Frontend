"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export function RecentOrdersGrid() {
    const { addToCart } = useCart();

    const orders = [
        {
            id: "FH1834",
            date: "Apr 25, 2024",
            image: "/protien powder.jpg",
            title: "Whey Protein Powder",
            price: "$49.00",
            status: "Shipped" as const,
        },
        {
            id: "FH1817",
            date: "Apr 20, 2024",
            image: "/protien powder.jpg",
            title: "Whey Protein Powder",
            price: "$49.00",
            status: null,
        },
    ];

    const handleAddToCart = (order: typeof orders[number]) => {
        addToCart({
            id: order.id,
            name: order.title,
            price: parseFloat(order.price.replace("$", "")),
            image: order.image,
            category: "supplement",
        });
    };

    return (
        <div className="bg-[#f9fbf9] rounded-3xl p-6 border border-border/50 h-full">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Orders</h3>
            <div className="grid grid-cols-2 gap-4 items-stretch">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-col min-w-0">
                        {/* Image + Info row */}
                        <div className="flex flex-col items-start gap-3 mb-auto">
                            <div className="w-14 h-14 bg-neutral-100 rounded-xl overflow-hidden relative flex-shrink-0">
                                <Image src={order.image} alt={order.title} fill className="object-cover" />
                            </div>
                            <div className="flex flex-col justify-center min-h-[56px] w-full">
                                <h4 className="font-semibold text-foreground text-sm leading-tight">{order.id}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">{order.date}</p>
                                <p className="text-sm font-bold text-foreground mt-1">{order.price}</p>
                            </div>
                        </div>

                        {/* Action */}
                        <div className="mt-4 pt-3 border-t border-border/40">
                            {order.status ? (
                                <Badge className="bg-[#5d8b63]/10 text-[#5d8b63] border-[#5d8b63]/20 hover:bg-[#5d8b63]/20 text-xs px-3 py-1 rounded-full">
                                    {order.status}
                                </Badge>
                            ) : (
                                <Button
                                    size="sm"
                                    className="bg-[#5d8b63] hover:bg-[#4a724f] text-white rounded-full h-8 px-4 text-xs font-medium"
                                    onClick={() => handleAddToCart(order)}
                                >
                                    Add to Cart
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 text-right">
                <Link href="/dashboard/orders" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                    View All Orders →
                </Link>
            </div>
        </div>
    );
}
