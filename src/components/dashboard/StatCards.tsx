import { LucideIcon } from "lucide-react";

interface StatCard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

interface StatCardsProps {
  stats: StatCard[];
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                stat.iconBg ?? "bg-primary/10"
              }`}
            >
              <Icon className={`h-6 w-6 ${stat.iconColor ?? "text-primary"}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
