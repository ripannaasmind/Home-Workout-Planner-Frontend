const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data;
}

// Products API
export const productsApi = {
  getAll: (params?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return apiRequest<{
      success: boolean;
      data: Product[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/products${query ? `?${query}` : ""}`);
  },

  getById: (id: string) =>
    apiRequest<{ success: boolean; data: Product }>(`/products/${id}`),

  getCategories: () =>
    apiRequest<{ success: boolean; data: string[] }>("/products/categories"),
};

// Testimonials API
export const testimonialsApi = {
  getAll: () =>
    apiRequest<{ success: boolean; data: Testimonial[] }>("/testimonials"),
};

// Workouts API
export const workoutsApi = {
  getAll: (params?: { category?: string; difficulty?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return apiRequest<{
      success: boolean;
      data: Workout[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/workouts${query ? `?${query}` : ""}`);
  },

  // Public library endpoint (no auth required)
  getLibrary: () =>
    apiRequest<{
      success: boolean;
      data: Workout[];
    }>("/workouts/library"),

  // Public library workout by ID (no auth required)
  getLibraryById: (id: string) =>
    apiRequest<{ success: boolean; data: Workout }>(`/workouts/library/${id}`),

  getById: (id: string) =>
    apiRequest<{ success: boolean; data: Workout }>(`/workouts/${id}`),
};

// Exercises API
export const exercisesApi = {
  getAll: (params?: { muscleGroup?: string; equipment?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return apiRequest<{
      success: boolean;
      data: Exercise[];
    }>(`/exercises${query ? `?${query}` : ""}`);
  },
};

// Types
export interface Product {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images?: string[];
  stock?: number;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
}

export interface Testimonial {
  _id?: string;
  id?: number;
  name: string;
  role: string;
  rating: number;
  avatar: string;
  comment: string;
  size: "small" | "medium" | "large";
}

export interface Workout {
  _id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number;
  category: string;
  image?: string;
  targetMuscleGroups?: string[];
  estimatedCalories?: number;
  isDefault?: boolean;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  duration: number;
  restTime: number;
  order: number;
}

export interface Exercise {
  _id: string;
  name: string;
  description: string;
  muscleGroup: string;
  equipment: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  image?: string;
  video?: string;
}

// User / Profile API
export const userApi = {
  updateProfile: (data: { name: string; avatar?: string }, token: string) =>
    apiRequest<{ success: boolean; data: { _id: string; name: string; email: string; avatar?: string; role: "user" | "admin"; isVerified: boolean } }>(
      "/auth/profile",
      { method: "PUT", body: data, token }
    ),

  changePassword: (data: { currentPassword: string; newPassword: string }, token: string) =>
    apiRequest<{ success: boolean; message: string }>(
      "/auth/change-password",
      { method: "PUT", body: data, token }
    ),

  deleteAccount: (token: string) =>
    apiRequest<{ success: boolean; message: string }>(
      "/auth/account",
      { method: "DELETE", token }
    ),
};

// Dashboard API
export const dashboardApi = {
  getData: (token: string) =>
    apiRequest<{
      success: boolean;
      data: {
        user: { name: string; avatar: string };
        todayWorkout: Workout | null;
        weeklyProgress: {
          workoutsCompleted: number;
          totalCalories: number;
          activeMinutes: number;
        };
        currentStreak: number;
        recentAchievements: { name: string; icon: string; unlockedAt: string }[];
        recommendedWorkout: Workout | null;
        quoteOfTheDay: string;
      };
    }>("/dashboard", { token }),
};

// Subscription API
export const subscriptionApi = {
  getPlans: (token: string) =>
    apiRequest<{
      success: boolean;
      data: SubscriptionPlan[];
    }>("/subscription/plans", { token }),

  getCurrent: (token: string) =>
    apiRequest<{
      success: boolean;
      data: Subscription | null;
    }>("/subscription", { token }),

  subscribe: (planId: string, token: string) =>
    apiRequest<{ success: boolean; data: Subscription }>(
      "/subscription",
      { method: "POST", body: { planId }, token }
    ),

  cancel: (token: string) =>
    apiRequest<{ success: boolean; message: string }>(
      "/subscription/cancel",
      { method: "PUT", token }
    ),
};

// Sessions API
export const sessionsApi = {
  getStats: (token: string) =>
    apiRequest<{
      success: boolean;
      data: {
        totalSessions: number;
        totalDuration: number;
        totalCalories: number;
        averageDuration: number;
        currentStreak: number;
      };
    }>("/sessions/stats", { token }),

  getAll: (token: string) =>
    apiRequest<{ success: boolean; data: WorkoutSession[] }>("/sessions", { token }),

  getActive: (token: string) =>
    apiRequest<{ success: boolean; data: WorkoutSession | null }>("/sessions/active", { token }),

  start: (workoutId: string, token: string) =>
    apiRequest<{ success: boolean; data: WorkoutSession }>("/sessions/start", {
      method: "POST",
      body: { workout: workoutId },
      token,
    }),

  complete: (sessionId: string, data: { caloriesBurned?: number; notes?: string }, token: string) =>
    apiRequest<{ success: boolean; data: WorkoutSession }>(`/sessions/${sessionId}/complete`, {
      method: "PUT",
      body: data,
      token,
    }),

  cancel: (sessionId: string, token: string) =>
    apiRequest<{ success: boolean; data: WorkoutSession }>(`/sessions/${sessionId}/cancel`, {
      method: "PUT",
      token,
    }),

  pause: (sessionId: string, token: string) =>
    apiRequest<{ success: boolean; data: WorkoutSession }>(`/sessions/${sessionId}/pause`, {
      method: "PUT",
      token,
    }),

  resume: (sessionId: string, token: string) =>
    apiRequest<{ success: boolean; data: WorkoutSession }>(`/sessions/${sessionId}/resume`, {
      method: "PUT",
      token,
    }),
};

// Admin API
export const adminApi = {
  getDashboard: (token: string) =>
    apiRequest<{
      success: boolean;
      data: {
        totalUsers: number;
        totalWorkouts: number;
        totalSessions: number;
        activeSubscriptions: number;
        newUsersLast7Days: number;
        revenueSummary: { _id: string; count: number }[];
      };
    }>("/admin/dashboard", { token }),

  getUsers: (token: string, params?: { search?: string; role?: string; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    return apiRequest<{ success: boolean; data: AdminUser[]; pagination: { page: number; limit: number; total: number; pages: number } }>(
      `/admin/users${query ? `?${query}` : ""}`,
      { token }
    );
  },

  updateUser: (id: string, data: { role?: string; isEmailVerified?: boolean }, token: string) =>
    apiRequest<{ success: boolean; data: AdminUser }>(`/admin/users/${id}`, {
      method: "PUT",
      body: data,
      token,
    }),

  deleteUser: (id: string, token: string) =>
    apiRequest<{ success: boolean; message: string }>(`/admin/users/${id}`, {
      method: "DELETE",
      token,
    }),

  banUser: (id: string, reason: string, token: string) =>
    apiRequest<{ success: boolean; data: AdminUser }>(`/admin/users/${id}/ban`, {
      method: "PUT",
      body: { reason },
      token,
    }),

  unbanUser: (id: string, token: string) =>
    apiRequest<{ success: boolean; data: AdminUser }>(`/admin/users/${id}/unban`, {
      method: "PUT",
      token,
    }),

  getWorkouts: (token: string) =>
    apiRequest<{ success: boolean; data: Workout[] }>("/admin/workouts", { token }),

  createWorkout: (data: Partial<Workout>, token: string) =>
    apiRequest<{ success: boolean; data: Workout }>("/admin/workouts", {
      method: "POST",
      body: data,
      token,
    }),

  updateWorkout: (id: string, data: Partial<Workout>, token: string) =>
    apiRequest<{ success: boolean; data: Workout }>(`/workouts/${id}`, {
      method: "PUT",
      body: data,
      token,
    }),

  deleteWorkout: (id: string, token: string) =>
    apiRequest<{ success: boolean; message: string }>(`/workouts/${id}`, {
      method: "DELETE",
      token,
    }),

  getExercises: (token: string) =>
    apiRequest<{ success: boolean; data: Exercise[] }>("/exercises", { token }),

  createExercise: (data: Partial<Exercise>, token: string) =>
    apiRequest<{ success: boolean; data: Exercise }>("/exercises", {
      method: "POST",
      body: data,
      token,
    }),

  updateExercise: (id: string, data: Partial<Exercise>, token: string) =>
    apiRequest<{ success: boolean; data: Exercise }>(`/exercises/${id}`, {
      method: "PUT",
      body: data,
      token,
    }),

  deleteExercise: (id: string, token: string) =>
    apiRequest<{ success: boolean; message: string }>(`/exercises/${id}`, {
      method: "DELETE",
      token,
    }),

  createProduct: (data: Partial<Product>, token: string) =>
    apiRequest<{ success: boolean; data: Product }>("/products", {
      method: "POST",
      body: data,
      token,
    }),

  updateProduct: (id: string, data: Partial<Product>, token: string) =>
    apiRequest<{ success: boolean; data: Product }>(`/products/${id}`, {
      method: "PUT",
      body: data,
      token,
    }),

  deleteProduct: (id: string, token: string) =>
    apiRequest<{ success: boolean; message: string }>(`/products/${id}`, {
      method: "DELETE",
      token,
    }),

  getTestimonials: () =>
    apiRequest<{ success: boolean; data: Testimonial[] }>("/testimonials"),

  createTestimonial: (data: Partial<Testimonial>, token: string) =>
    apiRequest<{ success: boolean; data: Testimonial }>("/testimonials", {
      method: "POST",
      body: data,
      token,
    }),

  updateTestimonial: (id: string, data: Partial<Testimonial>, token: string) =>
    apiRequest<{ success: boolean; data: Testimonial }>(`/testimonials/${id}`, {
      method: "PUT",
      body: data,
      token,
    }),

  deleteTestimonial: (id: string, token: string) =>
    apiRequest<{ success: boolean; message: string }>(`/testimonials/${id}`, {
      method: "DELETE",
      token,
    }),
};

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isEmailVerified: boolean;
  isBanned?: boolean;
  bannedReason?: string;
  createdAt: string;
  fitnessLevel?: string;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

export interface Subscription {
  _id: string;
  plan: SubscriptionPlan;
  status: string;
  startDate: string;
  endDate: string;
}

export interface WorkoutSession {
  _id: string;
  workout: string | Workout;
  status: string;
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  caloriesBurned?: number;
  totalPausedMs?: number;
  pausedAt?: string;
}

export default apiRequest;
