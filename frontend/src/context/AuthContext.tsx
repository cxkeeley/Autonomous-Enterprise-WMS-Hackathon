import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { UserResponse } from "../types/api";
import { login as apiLogin, getMe } from "../api/auth";

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("wms_token"));
  const [user, setUser] = useState<UserResponse | null>(() => {
    const stored = localStorage.getItem("wms_user");
    return stored ? (JSON.parse(stored) as UserResponse) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const tokenRes = await apiLogin({ username, password });
      localStorage.setItem("wms_token", tokenRes.access_token);
      setToken(tokenRes.access_token);

      // Fetch user profile
      const userRes = await getMe();
      localStorage.setItem("wms_user", JSON.stringify(userRes));
      setUser(userRes);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("wms_token");
    localStorage.removeItem("wms_user");
    setToken(null);
    setUser(null);
  }, []);

  const restoreSession = useCallback(async () => {
    const storedToken = localStorage.getItem("wms_token");
    if (!storedToken) {
      setToken(null);
      setUser(null);
      return;
    }
    setIsLoading(true);
    try {
      const userRes = await getMe();
      setUser(userRes);
      localStorage.setItem("wms_user", JSON.stringify(userRes));
    } catch {
      // Token invalid — clear
      localStorage.removeItem("wms_token");
      localStorage.removeItem("wms_user");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
