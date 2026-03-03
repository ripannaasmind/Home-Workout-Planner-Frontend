"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

function Spinner({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

function PageSpinner({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-[60vh]",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-text-muted animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

export { Spinner, PageSpinner };
