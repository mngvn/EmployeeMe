"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { store, type MockUser } from "@/lib/local-store";

type AuthContextType = {
  user: MockUser | null;
  login: (user: MockUser) => void;
  logout: () => void;
  ready: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  ready: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(store.getUser());
    setReady(true);
  }, []);

  const login = useCallback((u: MockUser) => {
    store.setUser(u);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    store.clearUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
