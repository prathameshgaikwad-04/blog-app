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
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <ThemeToggle />
      {isLoggedIn ? (
        // parent container must be positioned so absolute dropdown can anchor to it
        <div style={{ position: "relative" }} ref={ref}>
          <div
            className="avatar"
            onClick={() => setOpen(o => !o)}
            style={{ display: "inline-block" }}
            role="button"
            aria-haspopup="true"
            aria-expanded={open}
          >
            {(user && user.username && user.username[0]) ? user.username[0].toUpperCase() : "U"}
          </div>

          {/* render ProfileDropdown directly — it positions itself using calc(100% + 8px) */}
          {open && (
            <ProfileDropdown user={user} onSignOut={handleSignOut} onClose={() => setOpen(false)} />
          )}
        </div>
      ) : (
        <>
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn">Register</Link>
        </>
      )}
    </div>
  );
}








