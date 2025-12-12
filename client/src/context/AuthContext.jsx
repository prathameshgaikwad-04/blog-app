// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user")) ||
    null
  );
  const [token, setToken] = useState(
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------
   * LOGIN — unchanged except internal code cleanup
   * ------------------------------------------------------ */
  const login = (userData, tokenValue, persist = true) => {
    setUser(userData);
    setToken(tokenValue);

    if (persist) {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", tokenValue);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    } else {
      sessionStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.setItem("token", tokenValue);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  /* ------------------------------------------------------
   * LOGOUT — stable cleanup
   * ------------------------------------------------------ */
  const logout = () => {
    setUser(null);
    setToken("");

    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    } catch (e) {
      console.warn("logout cleanup failed", e);
    }
  };

  /* ------------------------------------------------------
   * REFRESH USER — the new required method
   * Called after creating posts, updating profile, etc.
   * GET /auth/me MUST return { user } or user object.
   * ------------------------------------------------------ */
  const refreshUser = async () => {
    if (!token) return null;

    try {
      const res = await api.get("/auth/me"); // adjust endpoint if needed
      const freshUser = res.data.user || res.data;

      setUser(freshUser);

      // persist updated user in correct storage
      if (localStorage.getItem("token") === token) {
        localStorage.setItem("user", JSON.stringify(freshUser));
      } else {
        sessionStorage.setItem("user", JSON.stringify(freshUser));
      }

      return freshUser;
    } catch (err) {
      console.warn("refreshUser failed:", err);
      logout();
      return null;
    }
  };

  /* ------------------------------------------------------
   * On first load: validate token & populate user
   * ------------------------------------------------------ */
  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        refreshUser,       // <--- NEW (required for dropdown & account page)
        setUser,           // used by profile updates, optional
        isLoggedIn: !!token,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



