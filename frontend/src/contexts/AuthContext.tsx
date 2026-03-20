import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getPlayer } from "../api/player";
import { login as apiLogin, register as apiRegister, type AuthResponse } from "../api/auth";
import { clearToken, getToken, setToken } from "../shared/token";

export type AuthUser = { id: string; username: string };

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const USER_KEY = "lg_user";

const readStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "id" in parsed &&
      "username" in parsed &&
      typeof (parsed as { id: unknown }).id === "string" &&
      typeof (parsed as { username: unknown }).username === "string"
    ) {
      return parsed as AuthUser;
    }
  } catch {
    // ignore
  }
  return null;
};

const storeAuth = (res: AuthResponse) => {
  setToken(res.token);
  localStorage.setItem(USER_KEY, JSON.stringify(res.user));
};

const clearAuth = () => {
  clearToken();
  localStorage.removeItem(USER_KEY);
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    getPlayer()
      .then(() => {
        if (!cancelled) setLoading(false);
      })
      .catch(() => {
        clearAuth();
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    storeAuth(res);
    setUser(res.user);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const res = await apiRegister(username, password);
    storeAuth(res);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    window.location.assign("/login");
  }, []);

  const token = getToken();
  const isAuthenticated = Boolean(token);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated, loading, login, register, logout }),
    [user, isAuthenticated, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

