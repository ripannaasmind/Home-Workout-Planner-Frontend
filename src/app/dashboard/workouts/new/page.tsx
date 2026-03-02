import { WorkoutForm } from "@/features/workouts";

export default function NewWorkoutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Create New Workout</h1>
      <WorkoutForm />
    </div>
  );
}
