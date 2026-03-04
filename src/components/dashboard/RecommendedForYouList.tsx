import Image from "next/image";
import { Button } from "@/components/ui/button";

export function RecommendedForYouList() {
    const recommendations = [
        {
            title: "Adjustable Dumbbell",
            price: "$39.00",
            image: "/images/products/dumbbells.jpg",
            action: "Add to Cart",
            btnClass: "bg-[#5d8b63] hover:bg-[#4a724f] text-white",
        },
        {
            title: "Whey Protein Powder",
            price: "$49.00",
            image: "/images/products/whey-protein.png",
            action: "View Workout", // The design shows view workout for the second one
            btnClass: "bg-white hover:bg-neutral-50 text-foreground border border-border",
        },
    ];

    return (
        <div className="bg-[#f9fbf9] rounded-3xl p-6 mb-8 border border-border/50">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Recommended for You</h3>
            <div className="space-y-4">
                {recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-4 p-3 bg-white rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
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
                            <Button size="sm" className={`h-7 px-3 text-xs rounded-full shadow-none ${rec.btnClass}`}>
                                {rec.action}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
