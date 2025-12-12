// client/src/pages/NewPost.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NewPost() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // get refreshUser from auth context so we can refresh counts after creating a post
  const { isLoggedIn, refreshUser } = useAuth();
  const nav = useNavigate();

  // cleanup preview object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // file chooser -> preview
  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview(null);
      return;
    }
    // basic client-side validation
    if (f.size > 5 * 1024 * 1024) {
      try { window.showToast?.("File too large (max 5MB)", "error"); } catch {}
      alert("File too large (max 5MB)");
      e.target.value = "";
      return;
    }
    // revoke previous preview if present
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const clearForm = () => {
    setTitle("");
    setBody("");
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      try { window.showToast?.("You must be logged in to create a post.", "error"); } catch {}
      alert("You must be logged in to create a post.");
      return;
    }
    if (!title.trim()) {
      try { window.showToast?.("Please enter a title.", "error"); } catch {}
      alert("Please enter a title.");
      return;
    }

    setLoading(true);
    try {
      let mediaUrl = null;

      // If file present, upload first
      if (file) {
        const fd = new FormData();
        // server expects field "avatar" for our upload route; we reuse it for media storage
        fd.append("avatar", file);
        const up = await api.post("/avatar/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        mediaUrl = up.data.avatarUrl; // relative path like /uploads/xyz.png
      }

      // Create post
      const payload = {
        title: title.trim(),
        body: body.trim(),
        mediaUrl: mediaUrl // may be null
      };
      const res = await api.post("/posts", payload);

      // Refresh user so dropdown/account reflect new post count immediately
      try {
        await refreshUser?.();
      } catch (refreshErr) {
        // non-fatal: log but continue
        console.warn("refreshUser failed after post creation", refreshErr);
      }

      // success: clear form, show toast, then navigate
      clearForm();
      try { window.showToast?.("Post created successfully!", "success"); } catch {}
      // small delay so user sees the toast briefly
      setTimeout(() => {
        // if backend returned the created post id, optionally navigate to it:
        const createdId = res?.data?._id || res?.data?.post?._id;
        if (createdId) nav(`/posts/${createdId}`);
        else nav("/");
      }, 700);
    } catch (err) {
      console.error("NewPost error", err);
      const msg = err?.response?.data?.message || "Failed to create post";
      try { window.showToast?.(msg, "error"); } catch {}
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-card" style={{ maxWidth: 820 }}>
      <h2>Create new post</h2>

      <form onSubmit={submit}>
        <label>Title</label>
        <input
          className="input"
          placeholder="Write a short, engaging title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
          disabled={loading}
        />

        <label style={{ marginTop: 12 }}>Body</label>
        <textarea
          className="input"
          placeholder="Write your post. You can add **Markdown** for emphasis."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          disabled={loading}
        />

        <label style={{ marginTop: 12 }}>Add image or video (optional)</label>
        <input type="file" accept="image/*,video/*" onChange={handleFile} disabled={loading} />

        {preview && (
          <div style={{ marginTop: 12 }}>
            {file && file.type.startsWith("image/") ? (
              <img src={preview} alt="preview" style={{ maxWidth: 420, borderRadius: 8 }} />
            ) : (
              <video src={preview} controls style={{ maxWidth: 420, borderRadius: 8 }} />
            )}
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn"
                onClick={() => { setFile(null); if (preview) { URL.revokeObjectURL(preview); setPreview(null); } }}
                disabled={loading}
              >
                Remove media
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
          <button type="button" className="btn" onClick={clearForm} disabled={loading}>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

