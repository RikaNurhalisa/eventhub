import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Muat dari localStorage saat pertama kali
  useEffect(() => {
    const storedToken = localStorage.getItem("eventhub_token");
    const storedUser = localStorage.getItem("eventhub_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("eventhub_token");
        localStorage.removeItem("eventhub_user");
      }
    }

    setLoading(false);
  }, []);

  /**
   * Simpan token dan data user ke state + localStorage
   */
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("eventhub_token", jwtToken);
    localStorage.setItem("eventhub_user", JSON.stringify(userData));
  };

  /**
   * Hapus sesi login
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("eventhub_token");
    localStorage.removeItem("eventhub_user");
  };

  const isAuthenticated = () => !!token && !!user;
  const isAdmin = () => user?.role === "admin";
  const isUser = () => user?.role === "user";

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, isAuthenticated, isAdmin, isUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook untuk konsumsi context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}

export default AuthContext;
