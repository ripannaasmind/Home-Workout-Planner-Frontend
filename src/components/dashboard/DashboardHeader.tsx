import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  description,
  action,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-6", className)}>
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {description && (
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
