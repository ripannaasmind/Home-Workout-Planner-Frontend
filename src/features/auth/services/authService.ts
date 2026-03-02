import apiClient from "@/lib/apiClient";
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from "../types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post("/auth/login", credentials);
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post("/auth/register", credentials);
    return data;
  },

  async getMe(): Promise<{ success: boolean; data: User }> {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },
};
