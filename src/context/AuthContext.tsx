"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
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

const API_PROXY_BASE = "/api/proxy";

async function parseResponse(res: Response) {
  const raw = await res.text();
  try {
    return (raw ? JSON.parse(raw) : {}) as Record<string, unknown>;
  } catch {
    return { message: raw } as Record<string, unknown>;
  }
}

function toNetworkMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Request timed out. Please try again.";
  }
  if (error instanceof TypeError) {
    return "Cannot reach server. Please check internet/API URL and try again.";
  }
  return error instanceof Error ? error.message : "Request failed";
}

async function fetchFromProxy(path: string, init: RequestInit) {
  return fetch(`${API_PROXY_BASE}${path}`, init);
}

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
    } catch {
      // Ignore this error because they might be an old user who is only registered in MongoDB.
    }

    // 2. Try standard Backend Login
    let res: Response;
    let data: Record<string, unknown>;
    try {
      res = await fetchFromProxy("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      data = await parseResponse(res);
    } catch (error) {
      throw new Error(toNetworkMessage(error));
    }

    // 3. Fallback: If Firebase succeeded but Backend failed (User reset their password in Firebase!)
    if (!res.ok && fbSuccess) {
      // Tell backend to update MongoDB password directly to solve sync mismatch 
      try {
        res = await fetchFromProxy("/auth/firebase-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        data = await parseResponse(res);
      } catch (error) {
        throw new Error(toNetworkMessage(error));
      }
    }

    if (!res.ok) {
      const message = typeof data.message === "string" ? data.message : "Login failed";
      throw new Error(message);
    }

    const authData = data.data as { user: User; token: string; refreshToken: string } | undefined;
    if (!authData?.token || !authData?.user) {
      throw new Error("Invalid login response from server");
    }

    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem("fithome-refresh-token", authData.refreshToken || "");
    return authData.user;
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    // 1. Save user in Firebase for future password resets
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      const message = typeof error === "object" && error && "message" in error ? String(error.message) : "Firebase registration failed";
      if (code !== "auth/email-already-in-use") {
        throw new Error(message);
      }
    }

    // 2. Save user in our custom backend Database
    let res: Response;
    let data: Record<string, unknown>;
    try {
      res = await fetchFromProxy("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      data = await parseResponse(res);
    } catch (error) {
      throw new Error(toNetworkMessage(error));
    }

    if (!res.ok) {
      const message = typeof data.message === "string" ? data.message : "Registration failed";
      throw new Error(message);
    }

    const authData = data.data as { user: User; token: string; refreshToken: string } | undefined;
    if (!authData?.token || !authData?.user) {
      throw new Error("Invalid registration response from server");
    }

    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem("fithome-refresh-token", authData.refreshToken || "");
    return authData.user;
  };

  const googleLogin = async (payload: GoogleAuthPayload): Promise<User> => {
    let res: Response;
    let data: Record<string, unknown>;
    try {
      res = await fetchFromProxy("/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      data = await parseResponse(res);
    } catch (error) {
      throw new Error(toNetworkMessage(error));
    }

    if (!res.ok) {
      const message = typeof data.message === "string" ? data.message : "Google login failed";
      throw new Error(message);
    }

    const authData = data.data as { user: User; token: string; refreshToken: string } | undefined;
    if (!authData?.token || !authData?.user) {
      throw new Error("Invalid Google login response from server");
    }

    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem("fithome-refresh-token", authData.refreshToken || "");
    return authData.user;
  };

  const forgotPassword = async (email: string): Promise<void> => {
    let res: Response;
    let data: Record<string, unknown>;
    try {
      res = await fetchFromProxy("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      data = await parseResponse(res);
    } catch (error) {
      throw new Error(toNetworkMessage(error));
    }
    if (!res.ok) {
      const message = typeof data.message === "string" ? data.message : "Failed to send password reset email";
      throw new Error(message);
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
