import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // false = not authed, object = { role, ... }
  const [auth, setAuth] = useState(() => {
    try {
      const t = localStorage.getItem("auth_token");
      const u = JSON.parse(localStorage.getItem("auth_user"));
      return t && u ? u : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!localStorage.getItem("auth_token")) return;
    api
      .get("/auth/me")
      .then((res) => {
        setAuth(res.data);
        localStorage.setItem("auth_user", JSON.stringify(res.data));
      })
      .catch((err) => {
        // Only force logout when the token is actually rejected (401/403).
        // On network/offline errors (no response) keep the cached session so
        // the app still opens and shows saved data while offline.
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          localStorage.removeItem("cached_device");
          localStorage.removeItem("cached_device_at");
          setAuth(false);
        }
      });
  }, []);

  const login = async (identifier, password) => {
    const res = await api.post("/auth/login", { identifier, password });
    const { token, ...user } = res.data;
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
    localStorage.removeItem("cached_device");
    setAuth(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("cached_device");
    localStorage.removeItem("cached_device_at");
    setAuth(false);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
