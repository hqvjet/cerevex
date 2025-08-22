"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { userService, type UserOut } from "../api/userService";
import { getToken, setToken, clearToken } from "./token";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: UserOut | null;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<UserOut>;
  signout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserOut | null>(null);
  const [initialized, setInitialized] = useState(false);

  const refreshMe = useCallback(async () => {
    try {
      const me = await userService.me();
      setUser(me);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    // On mount, if token exists, hydrate user; else mark unauthenticated
    (async () => {
      if (getToken()) {
        await refreshMe();
      } else {
        setStatus("unauthenticated");
      }
      setInitialized(true);
    })();
  }, [refreshMe]);

  const signin = useCallback(async (email: string, password: string) => {
    setStatus("loading");
    const res = await userService.signin({ email, password });
    if (res?.access_token) {
      setToken(res.access_token);
      if (res.user) {
        setUser(res.user);
        setStatus("authenticated");
        return;
      }
      const me = await userService.me();
      setUser(me);
      setStatus("authenticated");
      return;
    }
    setStatus("unauthenticated");
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const created = await userService.signup({ email, password });
    // Not automatically authenticated; require sign-in to get token
    setUser(created);
    setStatus("unauthenticated");
    return created;
  }, []);

  const signout = useCallback(async () => {
    try {
      await userService.signout();
    } finally {
      clearToken();
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ status, user, signin, signup, signout, refreshMe, initialized }), [status, user, signin, signup, signout, refreshMe, initialized]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
