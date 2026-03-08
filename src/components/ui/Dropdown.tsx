"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function Dropdown({ options, value, onChange, placeholder = "Select...", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2.5 bg-white dark:bg-card border border-border rounded-xl text-sm text-text-primary hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      >
        <span className={selected ? "text-text-primary" : "text-text-muted"}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-card border border-border rounded-xl shadow-lg py-1 animate-scale-in max-h-60 overflow-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange?.(opt.value);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-2 text-sm hover:bg-primary/5 transition-colors",
                opt.value === value ? "text-primary font-medium bg-primary/5" : "text-text-primary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { Dropdown };
export default Dropdown;
