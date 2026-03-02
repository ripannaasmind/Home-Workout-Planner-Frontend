"use client";

import { useState, useEffect, useCallback } from "react";
import { workoutService } from "../services/workoutService";
import { Workout, WorkoutFormData } from "../types";

export function useWorkouts(params?: Record<string, string>) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await workoutService.getAll(params);
      setWorkouts(response.data);
      setPagination(response.pagination);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to fetch workouts");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return { workouts, isLoading, error, pagination, refetch: fetchWorkouts };
}

export function useWorkout(id: string) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await workoutService.getById(id);
        setWorkout(response.data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Failed to fetch workout");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchWorkout();
  }, [id]);

  return { workout, isLoading, error };
}

export function useCreateWorkout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWorkout = async (data: WorkoutFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await workoutService.create(data);
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to create workout");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createWorkout, isLoading, error };
}

export function useDeleteWorkout() {
  const [isLoading, setIsLoading] = useState(false);

  const deleteWorkout = async (id: string) => {
    setIsLoading(true);
    try {
      await workoutService.delete(id);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteWorkout, isLoading };
}
