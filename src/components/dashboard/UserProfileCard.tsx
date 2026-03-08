"use client";

import { PenLine } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export function UserProfileCard() {
  const { user } = useAuth();

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14 ring-2 ring-primary/20 shrink-0">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="bg-primary text-white text-lg font-bold">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">{user?.name ?? "User"}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{user?.email ?? "user@example.com"}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-primary rounded-full" />
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i === 0 ? "bg-gray-400 dark:bg-gray-500" : "bg-gray-200 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      <Link
        href="/dashboard/profile"
        className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
      >
        <PenLine className="h-3.5 w-3.5" />
        Edit Profile
      </Link>
    </div>
  );
}
