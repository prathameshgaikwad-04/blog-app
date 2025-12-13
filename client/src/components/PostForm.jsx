import { useEffect, useState } from "react";

/* base URL for uploaded media */
const MEDIA_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PostForm = ({
  initialPost,
  onSubmit,
  loading = false,
  mode = "create"
}) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [existingMedia, setExistingMedia] = useState([]);

  /* ---------- preload post data (EDIT MODE) ---------- */
  useEffect(() => {
    if (!initialPost) return;

    setTitle(initialPost.title || "");
    setBody(initialPost.body || "");

    if (Array.isArray(initialPost.media)) {
      // normalize legacy + new media formats
      const normalized = initialPost.media
        .map((m) => {
          // legacy string
          if (typeof m === "string") {
            return { url: m, mimeType: null };
          }
          // new object format
          if (m && typeof m === "object" && m.url) {
            return m;
          }
          return null;
        })
        .filter(Boolean);

      setExistingMedia(normalized);
    } else {
      setExistingMedia([]);
    }
  }, [initialPost]);

  /* ---------- submit handler ---------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, body, file });
  };

  return (
    <form className="main-card" onSubmit={handleSubmit}>
      <h2>{mode === "edit" ? "Edit Post" : "Create Post"}</h2>

      {/* ---------- TITLE ---------- */}
      <label>Title</label>
      <input
        className="input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={loading}
      />

      {/* ---------- BODY ---------- */}
      <label style={{ marginTop: 12 }}>Body</label>
      <textarea
        className="input"
        rows={8}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={loading}
      />

      {/* ---------- EXISTING MEDIA (EDIT MODE) ---------- */}
      {existingMedia.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p className="small">Current media:</p>

          <div style={{ display: "grid", gap: 12 }}>
            {existingMedia.map((m, i) => {
              const fullUrl = `${MEDIA_BASE}${m.url}`;
              const lower = m.url.toLowerCase();

              const isImage =
                m.mimeType?.startsWith("image/") ||
                /\.(jpg|jpeg|png|gif|webp)$/.test(lower);

              const isVideo =
                m.mimeType?.startsWith("video/") ||
                /\.(mp4|webm|ogg)$/.test(lower);

              if (isImage) {
                return (
                  <img
                    key={i}
                    src={fullUrl}
                    alt="existing media"
                    style={{
                      maxWidth: 220,
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.12)"
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
                      maxWidth: 220,
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.12)"
                    }}
                  />
                );
              }

              return null;
            })}
          </div>
        </div>
      )}

      {/* ---------- FILE INPUT ---------- */}
      <label style={{ marginTop: 14 }}>
        {existingMedia.length > 0
          ? "Replace image / video (optional)"
          : "Add image or video (optional)"}
      </label>

      <input
        type="file"
        accept="image/*,video/*"
        disabled={loading}
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      {/* ---------- ACTIONS ---------- */}
      <div style={{ marginTop: 16 }}>
        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default PostForm;






