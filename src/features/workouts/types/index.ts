export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number;
  notes?: string;
}

export type Category = "strength" | "cardio" | "flexibility" | "balance" | "hiit" | "other";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Workout {
  _id: string;
  user: string;
  title: string;
  description?: string;
  category: Category;
  exercises: Exercise[];
  duration: number;
  difficulty: Difficulty;
  isCompleted: boolean;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutFormData {
  title: string;
  description?: string;
  category: Category;
  exercises: Exercise[];
  duration?: number;
  difficulty: Difficulty;
  scheduledDate?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
