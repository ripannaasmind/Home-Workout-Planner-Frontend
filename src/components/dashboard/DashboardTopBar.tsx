"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface DashboardTopBarProps {
  title?: string;
}

export function DashboardTopBar({ title = "Dashboard" }: DashboardTopBarProps) {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between gap-4 px-1 mb-6">
      {}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h1>
      </div>

      {}
      <div className="hidden md:flex flex-1 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-9 bg-white dark:bg-card border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
          />
        </div>
      </div>

      {}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary border-0">
            3
          </Badge>
        </Button>
        <Link href="/dashboard/profile">
          <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-gray-200 hover:ring-primary transition-all">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary text-white text-xs">
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </div>
  );
}
