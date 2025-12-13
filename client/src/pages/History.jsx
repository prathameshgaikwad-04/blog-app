import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function History() {
  const { user, isLoggedIn } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user?._id) {
      setLoading(false);
      return;
    }

    const loadHistory = async () => {
      try {
        const res = await api.get(`/posts/user/${user._id}`);
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("History load failed", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [isLoggedIn, user]);

  if (!isLoggedIn) return <p>Please login to view your history.</p>;
  if (loading) return <p>Loading history...</p>;

  return (
    <div className="main-card">
      <h2>Your History</h2>

      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((p) => (
          <div key={p._id} className="post-card">
            <Link to={`/posts/${p._id}`}>
              <h4>{p.title || "Untitled post"}</h4>
            </Link>
            <div className="small">
              {p.createdAt
                ? new Date(p.createdAt).toLocaleString()
                : "Unknown date"}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
