"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
}

function ProgressBar({ value, max = 100, className, showLabel = false, variant = "default" }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const barColors = {
    default: "bg-gradient-to-r from-primary to-primary-dark",
    success: "bg-gradient-to-r from-green-400 to-green-600",
    warning: "bg-gradient-to-r from-secondary to-secondary-dark",
    danger: "bg-gradient-to-r from-red-400 to-red-600",
  };

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-text-muted">
          <span>Progress</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", barColors[variant])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
export { ProgressBar };
