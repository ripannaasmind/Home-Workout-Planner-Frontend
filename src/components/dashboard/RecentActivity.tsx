import { ChevronRight, Dumbbell, ShoppingBag, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "order" | "workout" | "purchase";
  title: string;
  subtitle: string;
  linkLabel: string;
  linkHref: string;
  iconBg: string;
  icon: React.ElementType;
  iconColor: string;
}

const defaultActivities: ActivityItem[] = [
  {
    id: "1",
    type: "order",
    title: "Supplements",
    subtitle: "Order #FH1834",
    linkLabel: "Order Details",
    linkHref: "/dashboard/orders",
    iconBg: "bg-amber-100",
    icon: Package,
    iconColor: "text-amber-600",
  },
  {
    id: "2",
    type: "workout",
    title: "Muscle Building",
    subtitle: "Workout Completed",
    linkLabel: "View Workout",
    linkHref: "/dashboard/workouts",
    iconBg: "bg-green-100",
    icon: Dumbbell,
    iconColor: "text-green-700",
  },
  {
    id: "3",
    type: "purchase",
    title: "Protein Powder Purchased",
    subtitle: "Order #FH1817",
    linkLabel: "Order Details",
    linkHref: "/dashboard/orders",
    iconBg: "bg-blue-100",
    icon: ShoppingBag,
    iconColor: "text-blue-600",
  },
];

export function RecentActivity({ activities = defaultActivities }: { activities?: ActivityItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-start gap-3">
              {/* Icon square */}
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  item.iconBg
                )}
              >
                <Icon className={cn("h-5 w-5", item.iconColor)} />
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                <p className="text-xs text-gray-500">{item.subtitle}</p>
                <a
                  href={item.linkHref}
                  className="text-xs text-gray-400 hover:text-primary flex items-center gap-0.5 mt-0.5 transition-colors"
                >
                  {item.linkLabel}
                  <ChevronRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
