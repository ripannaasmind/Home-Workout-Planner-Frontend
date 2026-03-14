"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
  forgotPassword: (email: string) => Promise<void>;
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
    const id = requestAnimationFrame(() => {
      const savedToken = localStorage.getItem("fithome-token");
      const savedUser = localStorage.getItem("fithome-user");
      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("fithome-token");
          localStorage.removeItem("fithome-user");
        }
      }
      setIsLoading(false);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  
  useEffect(() => {
    if (token && user) {
      localStorage.setItem("fithome-token", token);
      localStorage.setItem("fithome-user", JSON.stringify(user));
    }
  }, [token, user]);

  const login = async (email: string, password: string): Promise<User> => {
    let fbSuccess = false;

    // 1. Try Firebase Auth First
    try {
      await signInWithEmailAndPassword(auth, email, password);
      fbSuccess = true;
    } catch (error: any) {
      // Ignore this error because they might be an old user who is only registered in MongoDB.
    }

    // 2. Try standard Backend Login
    let res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    let data = await res.json();

    // 3. Fallback: If Firebase succeeded but Backend failed (User reset their password in Firebase!)
    if (!res.ok && fbSuccess) {
      // Tell backend to update MongoDB password directly to solve sync mismatch 
      res = await fetch(`${API_URL}/auth/firebase-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      data = await res.json();
    }

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    setToken(data.data.token);
    setUser(data.data.user);
    localStorage.setItem("fithome-refresh-token", data.data.refreshToken);
    return data.data.user;
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    // 1. Save user in Firebase for future password resets
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code !== "auth/email-already-in-use") {
        throw new Error(error.message || "Firebase registration failed");
      }
    }

    // 2. Save user in our custom backend Database
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

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || "Failed to send password reset email");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("fithome-token");
    localStorage.removeItem("fithome-user");
    localStorage.removeItem("fithome-refresh-token");
    localStorage.removeItem("fithome-active-session");
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
        forgotPassword,
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
