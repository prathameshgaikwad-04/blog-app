import { Link } from "react-router-dom";

/* base URL for uploaded media */
const MEDIA_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PostCard = ({ post }) => {
  /* normalize media (legacy + new) */
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
    <div className="post-card">
      <Link to={`/posts/${post._id}`}>
        <h3>{post.title}</h3>
      </Link>

      <p className="small">
        by {post.author?.username || "Unknown"} •{" "}
        {post.createdAt
          ? new Date(post.createdAt).toLocaleDateString()
          : "Unknown date"}
      </p>

      <p>{post.body?.slice(0, 140)}...</p>

      {/* ✅ MEDIA — STABLE & SAFE */}
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
                marginTop: 12,
                borderRadius: 8
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
                marginTop: 12,
                borderRadius: 8
              }}
            />
          );
        }

        return null;
      })}
    </div>
  );
};

export default PostCard;





