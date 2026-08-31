import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    const token = localStorage.getItem("sevenpros_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await client.get("/auth/me");
      setUser(res.data);
    } catch {
      localStorage.removeItem("sevenpros_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("sevenpros_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("sevenpros_token");
    setUser(null);
  };

  const becomeProvider = async () => {
    const res = await client.post("/auth/become-provider");
    setUser(res.data);
    return res.data;
  };

  const switchMode = async (mode) => {
    const res = await client.post(`/auth/switch-mode?mode=${mode}`);
    setUser(res.data);
    return res.data;
  };

  const refreshUser = async () => {
    const res = await client.get("/auth/me");
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, becomeProvider, switchMode, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
