"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, login, logout, register, UserResponse } from "@/lib/auth";

interface AuthState {
  user: UserResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const u = await getCurrentUser();
    setUser(u);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    await refresh();
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    await register(name, email, password);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: handleLogin, logout: handleLogout, register: handleRegister, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
