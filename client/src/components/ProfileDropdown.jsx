// client/src/components/ProfileDropdown.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function ProfileDropdown({ user: propUser, onSignOut, onClose, style }) {
  const { user: ctxUser, refreshUser } = useAuth();
  const user = ctxUser || propUser;

  const [postsCount, setPostsCount] = useState(user?.postsCount ?? null);
  const [loadingCount, setLoadingCount] = useState(false);

  useEffect(() => {
    if (!user) { setPostsCount(null); return; }
    if (typeof user.postsCount === "number") { setPostsCount(user.postsCount); return; }

    let mounted = true;
    (async () => {
      setLoadingCount(true);
      try {
        const res = await api.get(`/users/${user._id}/stats`);
        if (!mounted) return;
        setPostsCount(res.data.postsCount ?? 0);
      } catch (err) {
        if (mounted) setPostsCount(0);
      } finally {
        if (mounted) setLoadingCount(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  const handleSignOut = async () => {
    try {
      if (typeof onSignOut === "function") {
        await onSignOut();
      } else {
        await api.post("/auth/logout").catch(() => {});
      }
      refreshUser?.();
      onClose?.();
    } catch (err) {
      console.error("Signout error", err);
    }
  };

  // IMPORTANT: This wrapper is absolute and uses calc(100% + 8px)
  // so it'll always sit right below the avatar container.
  return (
    <div
      className="profile-dropdown-wrapper"
      role="dialog"
      aria-label="User menu"
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        zIndex: 9999,
        ...style
      }}
    >
      <div className="profile-card card" style={{ minWidth: 280 }}>
        {!user ? (
          <div>
            <div className="small">Not signed in</div>
            <div style={{ marginTop: 12 }}>
              <Link to="/login" className="action-btn btn" onClick={onClose}>Login</Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{user.username || user.name || "User"}</div>
                <div className="small" style={{ marginTop: 6 }}>{ user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Joined N/A" }</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: 20 }}>{ loadingCount ? "…" : (postsCount ?? 0) }</div>
                <div className="small" style={{ marginTop: 6 }}>Posts</div>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div className="small">14-day streak</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {Array.from({ length: 14 }).map((_, i) => <div key={i} className={`streak-day ${i < 2 ? "active" : ""}`} />)}
              </div>
            </div>

            <div className="profile-actions" style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <Link to={`/account/${user._id}`} className="action-btn" onClick={onClose}>Account</Link>
              <Link to={`/history/${user._id}`} className="action-btn" onClick={onClose}>History</Link>
              <button type="button" className="action-btn" onClick={handleSignOut}>Sign out</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



