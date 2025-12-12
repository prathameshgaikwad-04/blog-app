// client/src/pages/Account.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import StreakHeatmap from "../components/StreakHeatmap";

export default function Account() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user?._id) { setLoading(false); return; }
      try {
        const res = await api.get(`/posts/user/${user._id}`);
        if (!mounted) return;
        setPosts(res.data || []);
      } catch (err) {
        console.error("Account: load posts", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  if (!user) return <div className="main-card"><p>Please log in to view your account.</p></div>;

  return (
    <div className="main-card">
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ minWidth: 240, flex: "0 0 260px" }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <div className="avatar-lg">{(user.username || "U").slice(0,1).toUpperCase()}</div>
            </div>
            <h3 style={{ margin: "6px 0 2px" }}>{user.username}</h3>
            <div className="small">Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</div>

            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 18 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 20 }}>{posts.length}</div>
                <div className="small">Posts</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 20 }}>
                  {getLongestStreak(posts)}
                </div>
                <div className="small">Longest streak</div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <a href="/new" className="btn" style={{ width: "100%", textAlign:"center" }}>Write a post</a>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: "0 0 8px" }}>Activity (last 180 days)</h2>
            <p className="small">Your post activity. Darker squares mean more posts on that day.</p>
          </div>

          <div className="card">
            <StreakHeatmap posts={posts} days={180} />
          </div>
        </div>

        <aside style={{ width: 320 }}>
          <div className="card">
            <h4 style={{ marginTop: 0 }}>Account details</h4>
            <div><strong>Username:</strong> {user.username}</div>
            <div style={{ marginTop: 6 }}><strong>Email:</strong> {user.email}</div>
            <div style={{ marginTop: 6 }}><strong>Member since:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* small helper to compute longest streak (days with >=1 post in a row) */
function getLongestStreak(posts=[]) {
  if (!posts || posts.length === 0) return 0;
  const days = new Set(posts.map(p => new Date(p.createdAt).toISOString().slice(0,10)));
  // iterate days from earliest to latest
  const dates = Array.from(days).sort();
  let longest = 0, cur = 0, prev = null;
  for (const d of dates) {
    if (!prev) { cur = 1; }
    else {
      const pd = new Date(prev); const cd = new Date(d);
      const diff = (cd - pd) / (1000*60*60*24);
      if (diff === 1) cur++; else cur = 1;
    }
    if (cur > longest) longest = cur;
    prev = d;
  }
  return longest;
}
