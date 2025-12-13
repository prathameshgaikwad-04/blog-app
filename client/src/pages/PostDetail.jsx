import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

/* base URL for uploaded media */
const MEDIA_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PostDetail = () => {
  const { id } = useParams();
  const { user, isLoggedIn } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error("Failed to fetch post", err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate("/");
    } catch {
      alert("Failed to delete post");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found</p>;

  const isAuthor =
    isLoggedIn &&
    user?._id &&
    post.author?._id &&
    user._id === post.author._id;

  /* ---------- MEDIA NORMALIZATION (STEP 3 CORE) ---------- */
  const mediaItems = Array.isArray(post.media)
    ? post.media
        .map((m) => {
          // legacy string
          if (typeof m === "string") {
            return { url: m, type: null };
          }
          // new object
          if (m && typeof m === "object" && m.url) {
            return m;
          }
          return null;
        })
        .filter(Boolean)
    : [];

  return (
    <div className="main-card">
      <h1>{post.title || "Untitled post"}</h1>

      <div className="small">
        by {post.author?.username || "Unknown"} •{" "}
        {post.createdAt
          ? new Date(post.createdAt).toLocaleString()
          : "Unknown date"}
      </div>

      {/* ✅ MEDIA — STEP 3 SAFE RENDERING */}
      {mediaItems.length > 0 && (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {mediaItems.map((m, i) => {
            const fullUrl = `${MEDIA_BASE}${m.url}`;
            const lower = m.url.toLowerCase();

            const isImage =
              m.type === "image" ||
              /\.(jpg|jpeg|png|gif|webp)$/.test(lower);

            const isVideo =
              m.type === "video" ||
              /\.(mp4|webm|ogg)$/.test(lower);

            if (isImage) {
              return (
                <img
                  key={i}
                  src={fullUrl}
                  alt="post media"
                  style={{
                    maxWidth: "100%",
                    borderRadius: 10
                  }}
                />
              );
            }

            if (isVideo) {
              return (
                <video
                  key={i}
                  src={fullUrl}
                  controls
                  style={{
                    maxWidth: "100%",
                    borderRadius: 10
                  }}
                />
              );
            }

            return null;
          })}
        </div>
      )}

      <p style={{ whiteSpace: "pre-wrap", marginTop: 14 }}>
        {post.body || ""}
      </p>

      {isAuthor && (
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <Link to={`/posts/${post._id}/edit`} className="btn">
            Edit
          </Link>
          <button onClick={handleDelete} className="btn">
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default PostDetail;




