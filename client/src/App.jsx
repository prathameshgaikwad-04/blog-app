import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NewPost from "./pages/NewPost";
import PostDetail from "./pages/PostDetail";
import EditPost from "./pages/EditPost";
import History from "./pages/History";
import { useAuth } from "./context/AuthContext";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Accounts";
import Toast from "./components/Toast";

export default function App() {
  const { isLoggedIn } = useAuth();

  // Toasts state
  const [toasts, setToasts] = useState([]);

  // showToast helper: message, type ("success" | "error"), duration optional
  const showToast = (message, type = "success", duration = 2500) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type, duration }]);
    // cleanup scheduled in setTimeout to keep simple
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, duration + 50);
  };

  // expose a global helper so pages can call window.showToast(...) without prop drilling
  useEffect(() => {
    window.showToast = showToast;
    return () => {
      try {
        delete window.showToast;
      } catch (e) { /* ignore */ }
    };
  }, []);

  return (
    <div>
      <header className="app-header">
        <div className="header-inner">
          <div style={{ flex: 1 }} />
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div className="brand">Blog App</div>
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
            <Navbar />
          </div>
        </div>
      </header>

      <main className="container">
        <section className="main-card">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={isLoggedIn ? <Navigate to="/" /> : <Register />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/new" element={isLoggedIn ? <NewPost /> : <Navigate to="/login" />} />
            <Route path="/posts/:id/edit" element={isLoggedIn ? <EditPost /> : <Navigate to="/login" />} />
            <Route path="/history/:userId" element={<History />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/account/:id" element={<Account />} />
          </Routes>
        </section>

        <aside className="sidebar">
          <div className="card">
            <div className="title">Welcome</div>
            <div className="small">Share your thoughts — create content, stay connected and keep learning!!</div>
          </div>
        </aside>
      </main>

      {/* Toast container (top-right) */}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            duration={t.duration}
            onClose={() => setToasts((s) => s.filter((x) => x.id !== t.id))}
          />
        ))}
      </div>
    </div>
  );
}


