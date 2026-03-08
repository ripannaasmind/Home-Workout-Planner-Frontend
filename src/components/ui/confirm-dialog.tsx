"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";
import { useCallback, useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
}

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  const confirmColors = {
    danger: "bg-red-500 hover:bg-red-600 text-white",
    warning: "bg-secondary hover:bg-secondary-dark text-white",
    default: "bg-primary hover:bg-primary-dark text-white",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-card rounded-2xl shadow-xl border border-border p-6 w-full max-w-md mx-4 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 text-text-muted transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            variant === "danger" ? "bg-red-50 text-red-500" : variant === "warning" ? "bg-yellow-50 text-yellow-600" : "bg-primary/10 text-primary"
          )}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            <p className="text-sm text-text-muted mt-1">{description}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-xl transition-colors">
            {cancelText}
          </button>
          <button onClick={onConfirm} disabled={loading} className={cn("px-4 py-2 text-sm font-medium rounded-xl transition-all shadow-sm", confirmColors[variant], loading && "opacity-50 cursor-not-allowed")}>
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
export { ConfirmDialog };
