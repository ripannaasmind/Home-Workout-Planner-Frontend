import { Dumbbell, Calendar, Package, DollarSign } from "lucide-react";

export function StatCards() {
    const stats = [
        {
            title: "Workouts Completed",
            value: "12",
            icon: Dumbbell,
            bgColor: "bg-emerald-50",
            iconColor: "text-emerald-500",
        },
        {
            title: "Active Programs",
            value: "2",
            icon: Calendar,
            bgColor: "bg-blue-50",
            iconColor: "text-blue-500",
        },
        {
            title: "Orders Placed",
            value: "5",
            icon: Package,
            bgColor: "bg-green-50",
            iconColor: "text-green-600",
        },
        {
            title: "Total Spend",
            value: "$299.00",
            icon: DollarSign,
            bgColor: "bg-teal-50",
            iconColor: "text-teal-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className={`${stat.bgColor} p-6 rounded-3xl flex flex-col justify-between  border border-border/50 transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer`}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                        <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                        <div className={`p-1.5 rounded-full bg-white/50 backdrop-blur-sm shadow-sm ${stat.iconColor}`}>
                            <stat.icon className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
