// client/src/pages/NewPost.jsx
import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NewPost() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef(null);
  const { isLoggedIn, refreshUser } = useAuth();
  const nav = useNavigate();

  /* cleanup preview URL */
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 10 * 1024 * 1024) {
      window.showToast?.("File too large (max 10MB)", "error");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const removeMedia = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const clearForm = () => {
    setTitle("");
    setBody("");
    removeMedia();
  };

  /* ================= SUBMIT (STEP 3 – FINAL) ================= */
  const submit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      window.showToast?.("Please login first", "error");
      return;
    }

    if (!title.trim()) {
      window.showToast?.("Title is required", "error");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("body", body.trim());
      if (file) fd.append("avatar", file); // MUST match multer.single("avatar")

      const res = await api.post("/posts", fd);

      await refreshUser?.();
      clearForm();
      window.showToast?.("Post created successfully!", "success");

      const postId = res?.data?._id;
      setTimeout(() => nav(postId ? `/posts/${postId}` : "/"), 600);
    } catch (err) {
      console.error("Create post failed:", err);
      window.showToast?.(
        err?.response?.data?.message || "Failed to create post",
        "error"
      );
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Write a short, engaging title"
          maxLength={120}
          required
          disabled={loading}
        />

        <label style={{ marginTop: 12 }}>Body</label>
        <textarea
          className="input"
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your post..."
          disabled={loading}
        />

        <label style={{ marginTop: 12 }}>
          Add image or video (optional)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFile}
          disabled={loading}
        />

        {preview && file && (
          <div style={{ marginTop: 12 }}>
            {file.type.startsWith("image/") ? (
              <img
                src={preview}
                alt="preview"
                style={{ maxWidth: 420, borderRadius: 8 }}
              />
            ) : (
              <video
                src={preview}
                controls
                style={{ maxWidth: 420, borderRadius: 8 }}
              />
            )}

            <button
              type="button"
              className="btn"
              style={{ marginTop: 8 }}
              onClick={removeMedia}
              disabled={loading}
            >
              Remove media
            </button>
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>

          <button
            type="button"
            className="btn"
            onClick={clearForm}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

