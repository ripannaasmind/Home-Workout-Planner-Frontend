"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useWorkout } from "@/features/workouts";

export default function WorkoutDetailPage() {
  const params = useParams();
  const { workout, isLoading, error } = useWorkout(params.id as string);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-800 rounded w-1/3"></div>
        <div className="h-4 bg-gray-800 rounded w-1/2"></div>
        <div className="h-64 bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error || "Workout not found"}</p>
        <Link href="/dashboard/workouts" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          Back to Workouts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/workouts" className="text-sm text-gray-400 hover:text-gray-300 mb-2 inline-block">
            ← Back to Workouts
          </Link>
          <h1 className="text-2xl font-bold text-white">{workout.title}</h1>
          {workout.description && <p className="text-gray-400 mt-1">{workout.description}</p>}
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full ${
            workout.isCompleted ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {workout.isCompleted ? "Completed" : "In Progress"}
        </span>
      </div>

      <div className="flex gap-3">
        <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">{workout.category}</span>
        <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">{workout.difficulty}</span>
        {workout.duration > 0 && (
          <span className="text-xs px-3 py-1 rounded-full bg-gray-500/20 text-gray-400">{workout.duration} min</span>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Exercises ({workout.exercises.length})</h2>
        <div className="space-y-3">
          {workout.exercises.map((exercise, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{exercise.name}</p>
                <p className="text-sm text-gray-400">
                  {exercise.sets} sets × {exercise.reps} reps
                  {exercise.weight ? ` @ ${exercise.weight}kg` : ""}
                </p>
              </div>
              {exercise.restTime && <span className="text-xs text-gray-500">{exercise.restTime}s rest</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
