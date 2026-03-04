import Image from "next/image";
import { Button } from "@/components/ui/button";

export function RecommendedForYouGrid() {
    const rec = {
        title: "Adjustable Dumbbell",
        price: "$89.00",
        image: "/images/products/dumbbells.jpg",
        action: "Add to Cart",
    };

    return (
        <div className="bg-[#f9fbf9] rounded-3xl p-6 border border-border/50 h-full flex flex-col justify-between">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Recommended for You</h3>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex-1 flex flex-col justify-center items-center text-center gap-3">
                <div className="w-24 h-24 bg-neutral-100 rounded-xl overflow-hidden relative flex-shrink-0 mb-2">
                    <Image src={rec.image} alt={rec.title} fill className="object-cover" />
                </div>
                <div>
                    <h4 className="font-semibold text-foreground text-sm">{rec.title}</h4>
                    <p className="text-sm font-bold text-foreground mt-0.5 mb-3">{rec.price}</p>
                </div>
                <Button size="sm" className="bg-[#5d8b63] hover:bg-[#4a724f] text-white rounded-full h-8 px-6 text-xs font-medium w-auto">
                    {rec.action}
                </Button>
            </div>
        </div>
    );
}
