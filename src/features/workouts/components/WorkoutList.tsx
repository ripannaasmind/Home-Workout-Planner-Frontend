"use client";

import WorkoutCard from "./WorkoutCard";
import { useWorkouts, useDeleteWorkout } from "../hooks/useWorkouts";

export default function WorkoutList() {
  const { workouts, isLoading, error, refetch } = useWorkouts();
  const { deleteWorkout } = useDeleteWorkout();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this workout?")) {
      const success = await deleteWorkout(id);
      if (success) refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-5 bg-gray-800 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-800 rounded-full w-16"></div>
              <div className="h-6 bg-gray-800 rounded-full w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
        <button onClick={refetch} className="mt-4 text-blue-400 hover:text-blue-300 cursor-pointer">
          Try again
        </button>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No workouts yet</p>
        <p className="text-gray-500 text-sm mt-2">Create your first workout to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workouts.map((workout) => (
        <WorkoutCard key={workout._id} workout={workout} onDelete={handleDelete} />
      ))}
    </div>
  );
}
