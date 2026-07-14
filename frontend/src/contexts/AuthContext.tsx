import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { backendBaseUrl } from "../services/api";
import { getCurrentUser, logout as logoutRequest } from "../services/auth";
import type { AuthUser } from "../types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setUser(null);
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(() => {
    window.location.assign(`${backendBaseUrl}/api/login/github`);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      window.location.assign("/");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      login,
      logout,
      refreshUser,
    }),
    [loading, login, logout, refreshUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
