"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

const products = [
    { id: "prod-dumbbell-001", name: "Adjustable Dumbbell", price: 89, image: "/adjustabble dumbble.jpg", category: "Equipment", badge: "Best Seller" },
    { id: "prod-protein-001", name: "Whey Protein Powder", price: 49, image: "/protien powder.jpg", category: "Supplements", badge: null },
    { id: "prod-bands-001", name: "Resistance Bands Set", price: 29, image: "/adjustabble dumbble.jpg", category: "Equipment", badge: "New" },
    { id: "prod-yoga-001", name: "Premium Yoga Mat", price: 39, image: "/muscle building.jpg", category: "Equipment", badge: null },
];

export default function DashboardShopPage() {
    const { addToCart, totalItems } = useCart();

    const handleAddToCart = (product: typeof products[number]) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category.toLowerCase(),
        });
        toast.success(`${product.name} added to cart!`);
    };

    return (
        <div className="flex flex-col h-full bg-[#f4f7f4] rounded-3xl p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Shop</h1>
                    <p className="text-muted-foreground mt-1">Equipment and supplements for your fitness journey.</p>
                </div>
                <Button asChild variant="outline" className="rounded-full gap-2">
                    <Link href="/cart">
                        <ShoppingCart className="w-4 h-4" />
                        Cart {totalItems > 0 && <span className="bg-[#5d8b63] text-white rounded-full px-1.5 py-0.5 text-xs ml-1">{totalItems}</span>}
                    </Link>
                </Button>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {["All", "Equipment", "Supplements", "Apparel"].map((cat) => (
                    <button key={cat} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${cat === "All" ? "bg-[#5d8b63] text-white" : "bg-white text-muted-foreground hover:bg-neutral-100 border border-border/60"}`}>
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="relative h-40 w-full bg-neutral-100">
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                            {product.badge && (
                                <Badge className="absolute top-3 left-3 bg-[#5d8b63] text-white text-xs border-0">{product.badge}</Badge>
                            )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                            <h3 className="font-semibold text-foreground text-sm flex-1">{product.name}</h3>
                            <p className="text-base font-bold text-foreground mt-2 mb-3">${product.price.toFixed(2)}</p>
                            <Button
                                size="sm"
                                onClick={() => handleAddToCart(product)}
                                className="rounded-full bg-[#5d8b63] hover:bg-[#4a724f] text-white text-xs w-full"
                            >
                                Add to Cart
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
