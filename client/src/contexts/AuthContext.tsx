"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  authApi,
  getToken,
  setToken,
  removeToken,
  KaderInfo,
} from "../lib/api";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface AuthUser extends KaderInfo {
  posyandu: { id: string; nama: string };
}

interface AuthContextValue {
  user: AuthUser | null;
  posyanduId: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerPosyandu: (data: {
    namaPosyandu: string;
    desa: string;
    kecamatan: string;
    alamat: string;
    namaKader: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

// ─────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: verify stored token via /api/auth/me
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .getMe()
      .then((res) => {
        if (res.success) {
          setUser(res.data as AuthUser);
        } else {
          removeToken();
        }
      })
      .catch(() => removeToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Login gagal");
    }
    setToken(res.data.token);
    setUser(res.data.kader as AuthUser);
  }, []);

  const registerPosyandu = useCallback(async (data: Parameters<typeof authApi.registerPosyandu>[0]) => {
    const res = await authApi.registerPosyandu(data);
    if (!res.success || !res.data) {
      throw new Error(res.message || "Registrasi gagal");
    }
    setToken(res.data.token);
    setUser(res.data.kader as AuthUser);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    posyanduId: user?.posyandu?.id ?? null,
    isLoading,
    login,
    registerPosyandu,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
