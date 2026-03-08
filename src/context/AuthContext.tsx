"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  isVerified: boolean;
}

interface GoogleAuthPayload {
  googleId: string;
  email: string;
  name: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  googleLogin: (payload: GoogleAuthPayload) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    const savedToken = localStorage.getItem("fithome-token");
    const savedUser = localStorage.getItem("fithome-user");
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse auth data", e);
        localStorage.removeItem("fithome-token");
        localStorage.removeItem("fithome-user");
      }
    }
    setIsLoading(false);
  }, []);

  
  useEffect(() => {
    if (token && user) {
      localStorage.setItem("fithome-token", token);
      localStorage.setItem("fithome-user", JSON.stringify(user));
    }
  }, [token, user]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    setToken(data.data.token);
    setUser(data.data.user);
    localStorage.setItem("fithome-refresh-token", data.data.refreshToken);
    return data.data.user;
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    setToken(data.data.token);
    setUser(data.data.user);
    localStorage.setItem("fithome-refresh-token", data.data.refreshToken);
    return data.data.user;
  };

  const googleLogin = async (payload: GoogleAuthPayload): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Google login failed");
    }

    setToken(data.data.token);
    setUser(data.data.user);
    localStorage.setItem("fithome-refresh-token", data.data.refreshToken);
    return data.data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("fithome-token");
    localStorage.removeItem("fithome-user");
    localStorage.removeItem("fithome-refresh-token");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
