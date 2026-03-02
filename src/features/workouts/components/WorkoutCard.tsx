"use client";

import Link from "next/link";
import { Workout } from "../types";

interface WorkoutCardProps {
  workout: Workout;
  onDelete?: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  strength: "bg-blue-500/20 text-blue-400",
  cardio: "bg-red-500/20 text-red-400",
  flexibility: "bg-green-500/20 text-green-400",
  balance: "bg-yellow-500/20 text-yellow-400",
  hiit: "bg-purple-500/20 text-purple-400",
  other: "bg-gray-500/20 text-gray-400",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/20 text-emerald-400",
  intermediate: "bg-amber-500/20 text-amber-400",
  advanced: "bg-rose-500/20 text-rose-400",
};

export default function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Link href={`/dashboard/workouts/${workout._id}`}>
            <h3 className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
              {workout.title}
            </h3>
          </Link>
          {workout.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{workout.description}</p>
          )}
        </div>
        {workout.isCompleted && (
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
            Completed
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[workout.category]}`}>
          {workout.category}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[workout.difficulty]}`}>
          {workout.difficulty}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>{workout.exercises.length} exercises</span>
          {workout.duration > 0 && <span>{workout.duration} min</span>}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/workouts/${workout._id}`}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(workout._id)}
              className="text-red-400 hover:text-red-300 text-sm cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
