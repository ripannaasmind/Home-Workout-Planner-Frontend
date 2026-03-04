import Image from "next/image";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function RecentActivity() {
    const activities = [
        {
            title: "Supplements",
            subtitle: "Order #FH1834",
            action: "Order Details",
            image: "/images/products/whey-protein.png", // Using a product image
        },
        {
            title: "Muscle Building",
            subtitle: "Workout Completed",
            action: "View Workout",
            image: "/images/workouts/muscle-building.jpg", // Using a workout image
        },
        {
            title: "Protein Powder",
            subtitle: "Order #FH1817",
            action: "Order Details",
            image: "/images/products/whey-protein-2.png", // Alternative product image maybe or same
        },
    ];

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-border mb-8">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h3>
            <div className="space-y-4">
                {activities.map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 p-2 hover:bg-neutral-50 rounded-2xl transition-colors group">
                        <div className="w-12 h-12 bg-neutral-100 rounded-xl overflow-hidden relative flex-shrink-0">
                            <Image
                                src={activity.image}
                                alt={activity.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-foreground text-sm">{activity.title}</h4>
                            <p className="text-xs text-muted-foreground mb-1">{activity.subtitle}</p>
                            <Link href="#" className="text-xs font-medium text-primary flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                {activity.action} <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
