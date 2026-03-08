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
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-3 sm:p-5 flex items-center gap-2 sm:gap-4 overflow-hidden"
          >
            <div
              className={`h-9 w-9 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 ${
                stat.iconBg ?? "bg-primary/10"
              }`}
            >
              <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.iconColor ?? "text-primary"}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium leading-tight truncate">{stat.label}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mt-0.5">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
