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

export default apiRequest;
