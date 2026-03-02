"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="text-xl font-bold text-white">
            💪 Workout Planner
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/workouts" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Workouts
                </Link>
                <span className="text-sm text-gray-400">Hi, {user.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
