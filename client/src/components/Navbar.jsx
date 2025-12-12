// client/src/components/Navbar.jsx
import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const nav = useNavigate();

  const handleSignOut = async () => {
    try {
      // call context logout which clears state/storage
      logout();
      setOpen(false);
      nav("/");
    } catch (err) {
      console.error("handleSignOut", err);
    }
  };

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <nav className="nav-inline" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <ThemeToggle />

      {isLoggedIn ? (
        <>
          {/* New post button - visible, uses primary styling */}
          <Link to="/new" className="btn new-post-btn" title="Create new post" aria-label="Create new post">
            {/* icon + label */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span className="small-label">New</span>
          </Link>

          {/* optional quick history link (small) */}
          <Link to={`/history/${user?._id}`} className="btn" title="Your history">History</Link>

          {/* Avatar & dropdown */}
          <div style={{ position: "relative" }} ref={ref}>
            <div
              className="avatar avatar-button"
              onClick={() => setOpen(o => !o)}
              style={{ display: "inline-block" }}
              role="button"
              aria-haspopup="true"
              aria-expanded={open}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(o => !o); }}
            >
              {(user && user.username && user.username[0]) ? user.username[0].toUpperCase() : "U"}
            </div>

            {open && (
              <ProfileDropdown user={user} onSignOut={handleSignOut} onClose={() => setOpen(false)} />
            )}
          </div>
        </>
      ) : (
        <>
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn">Register</Link>
        </>
      )}
    </nav>
  );
}








