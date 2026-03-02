import apiClient from "@/lib/apiClient";
import { Workout, WorkoutFormData, PaginatedResponse } from "../types";

export const workoutService = {
  async getAll(params?: Record<string, string>): Promise<PaginatedResponse<Workout>> {
    const { data } = await apiClient.get("/workouts", { params });
    return data;
  },

  async getById(id: string): Promise<{ success: boolean; data: Workout }> {
    const { data } = await apiClient.get(`/workouts/${id}`);
    return data;
  },

  async create(workout: WorkoutFormData): Promise<{ success: boolean; data: Workout }> {
    const { data } = await apiClient.post("/workouts", workout);
    return data;
  },

  async update(id: string, workout: Partial<WorkoutFormData>): Promise<{ success: boolean; data: Workout }> {
    const { data } = await apiClient.put(`/workouts/${id}`, workout);
    return data;
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.delete(`/workouts/${id}`);
    return data;
  },
};
