"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Link from "next/link";

export function RecommendedForYouList() {
    const { addToCart } = useCart();

    const recommendations = [
        {
            id: "prod-dumbbell-002",
            title: "Adjustable Dumbbell",
            price: "$39.00",
            image: "/adjustabble dumbble.jpg",
            category: "equipment",
            type: "cart" as const,
        },
        {
            id: "prod-protein-001",
            title: "Whey Protein Powder",
            price: "$49.00",
            image: "/protien powder.jpg",
            category: "supplement",
            type: "workout" as const,
        },
    ];

    const handleAddToCart = (rec: typeof recommendations[number]) => {
        addToCart({
            id: rec.id,
            name: rec.title,
            price: parseFloat(rec.price.replace("$", "")),
            image: rec.image,
            category: rec.category,
        });
        toast.success(`${rec.title} added to cart!`);
    };

    return (
        <div className="bg-[#f9fbf9] rounded-3xl p-6 mb-8 border border-border/50">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Recommended for You</h3>
            <div className="space-y-4">
                {recommendations.map((rec) => (
                    <div key={rec.id} className="flex gap-4 p-3 bg-white rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 bg-neutral-100 rounded-xl overflow-hidden relative flex-shrink-0">
                            <Image
                                src={rec.image}
                                alt={rec.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col justify-between py-1">
                            <div>
                                <h4 className="font-semibold text-foreground text-sm">{rec.title}</h4>
                                <p className="text-sm font-bold text-foreground mt-0.5">{rec.price}</p>
                            </div>
                            {rec.type === "cart" ? (
                                <Button
                                    size="sm"
                                    onClick={() => handleAddToCart(rec)}
                                    className="h-7 px-3 text-xs rounded-full shadow-none bg-[#5d8b63] hover:bg-[#4a724f] text-white"
                                >
                                    Add to Cart
                                </Button>
                            ) : (
                                <Button asChild size="sm" className="h-7 px-3 text-xs rounded-full shadow-none bg-white hover:bg-neutral-50 text-foreground border border-border">
                                    <Link href="/dashboard/workouts">View Workout</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
