"use client";

import { Dumbbell, Plus, Search, Filter } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const workouts = [
  { id: 1, title: "Full Body HIIT", duration: 40, calories: 350, difficulty: "Intermediate", category: "HIIT", lastDone: "2 days ago" },
  { id: 2, title: "Upper Body Blast", duration: 45, calories: 280, difficulty: "Advanced", category: "Strength", lastDone: "4 days ago" },
  { id: 3, title: "Morning Yoga Flow", duration: 30, calories: 120, difficulty: "Beginner", category: "Yoga", lastDone: "Today" },
  { id: 4, title: "Core Crusher", duration: 25, calories: 200, difficulty: "Intermediate", category: "Core", lastDone: "6 days ago" },
  { id: 5, title: "Leg Day Power", duration: 50, calories: 400, difficulty: "Advanced", category: "Strength", lastDone: "1 week ago" },
  { id: 6, title: "Cardio Burnout", duration: 35, calories: 320, difficulty: "Intermediate", category: "Cardio", lastDone: "3 days ago" },
];

const difficultyColor: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-yellow-100 text-yellow-700",
  Advanced: "bg-red-100 text-red-600",
};

export default function WorkoutsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="My Workouts"
        description="Manage and track your workout routines"
        action={
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus className="h-4 w-4" /> New Workout
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search workouts..." className="pl-9 bg-white border-gray-200 text-gray-800 placeholder:text-gray-400" />
        </div>
        <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-100 gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {workouts.map((workout) => (
          <div
            key={workout.id}
            className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <Badge className={`border-0 ${difficultyColor[workout.difficulty]}`}>
                {workout.difficulty}
              </Badge>
            </div>
            <div>
              <h3 className="text-gray-800 font-semibold">{workout.title}</h3>
              <p className="text-gray-500 text-sm">{workout.category}</p>
            </div>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>{workout.duration} min</span>
              <span>~{workout.calories} kcal</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400">Last: {workout.lastDone}</span>
              <Button size="sm" className="bg-primary/80 hover:bg-primary text-white h-7 px-3">
                Start
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
