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
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const { isLoggedIn, refreshUser } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview(null);
      return;
    }
    if (f.size > 10 * 1024 * 1024) { // 10MB safe limit
      alert("File too large (max 10MB)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clearForm = () => {
    setTitle("");
    setBody("");
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /**
   * Two-step strategy:
   * 1) If file exists, try to upload to /api/avatar/upload and use returned URL.
   * 2) If upload fails or no avatarUrl returned, fallback to sending multipart/form-data directly to POST /api/posts
   */
  const submit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      try { window.showToast?.("Please login first", "error"); } catch {}
      alert("Please login first");
      return;
    }
    if (!title.trim()) {
      try { window.showToast?.("Please enter a title", "error"); } catch {}
      alert("Please enter a title");
      return;
    }

    setLoading(true);
    try {
      let mediaUrl = null;

      if (file) {
        // First attempt: upload to separate upload endpoint
        setUploading(true);
        try {
          const fd = new FormData();
          fd.append("avatar", file);
          console.log("Attempting upload to /avatar/upload:", file);

          // Do not set Content-Type header — browser sets boundary
          const up = await api.post("/avatar/upload", fd);
          mediaUrl = up?.data?.avatarUrl || up?.data?.url || null;
          console.log("Upload response:", up?.data);

          // if we didn't get a usable URL, treat as failure to try fallback
          if (!mediaUrl) {
            throw new Error("Upload endpoint returned no avatarUrl");
          }
        } catch (uploadErr) {
          console.warn("Upload to /avatar/upload failed, will fallback to multipart POST /posts", uploadErr);
          // fallback path will send FormData to /posts directly (below)
        } finally {
          setUploading(false);
        }
      }

      // If we have a mediaUrl (upload succeeded), create the post normally (JSON)
      if (mediaUrl) {
        const payload = { title: title.trim(), body: body.trim(), mediaUrl };
        const res = await api.post("/posts", payload);
        await refreshUser?.();
        clearForm();
        try { window.showToast?.("Post created successfully!", "success"); } catch {}
        const createdId = res?.data?._id || res?.data?.post?._id;
        setTimeout(() => nav(createdId ? `/posts/${createdId}` : "/"), 600);
        return;
      }

      // FALLBACK: send multipart/form-data to /posts with 'avatar' field (server-side multer should handle)
      if (file) {
        setUploading(true);
        try {
          const fd2 = new FormData();
          fd2.append("avatar", file);          // match server multer single('avatar')
          fd2.append("title", title.trim());
          fd2.append("body", body.trim());

          // Important: do NOT set Content-Type header — let browser set the boundary
          const res2 = await api.post("/posts", fd2, { headers: { /* axios will set multipart boundary automatically */ } });
          await refreshUser?.();
          clearForm();
          try { window.showToast?.("Post created successfully!", "success"); } catch {}
          const createdId = res2?.data?._id || res2?.data?.post?._id;
          setTimeout(() => nav(createdId ? `/posts/${createdId}` : "/"), 600);
          return;
        } catch (fmErr) {
          console.error("Fallback multipart post failed:", fmErr);
          const msg = fmErr?.response?.data?.message || fmErr?.message || "Failed to upload and create post";
          try { window.showToast?.(msg, "error"); } catch {}
          throw fmErr;
        } finally {
          setUploading(false);
        }
      }

      // If there was no file at all, just create the post
      const resNoFile = await api.post("/posts", { title: title.trim(), body: body.trim(), mediaUrl: null });
      await refreshUser?.();
      clearForm();
      try { window.showToast?.("Post created successfully!", "success"); } catch {}
      const createdId = resNoFile?.data?._id || resNoFile?.data?.post?._id;
      setTimeout(() => nav(createdId ? `/posts/${createdId}` : "/"), 600);

    } catch (err) {
      console.error("NewPost overall error:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to create post";
      try { window.showToast?.(msg, "error"); } catch {}
      alert(msg);
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  return (
    <div className="main-card" style={{ maxWidth: 820 }}>
      <h2>Create new post</h2>
      <form onSubmit={submit}>
        <label>Title</label>
        <input className="input" placeholder="Write a short, engaging title" value={title} onChange={e=>setTitle(e.target.value)} maxLength={120} required disabled={loading} />

        <label style={{ marginTop: 12 }}>Body</label>
        <textarea className="input" placeholder="Write your post..." value={body} onChange={e=>setBody(e.target.value)} rows={8} disabled={loading} />

        <label style={{ marginTop: 12 }}>Add image or video (optional)</label>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFile} disabled={loading || uploading} />

        {preview && (
          <div style={{ marginTop: 12 }}>
            {file?.type?.startsWith("image/") ? <img src={preview} alt="preview" style={{ maxWidth:420,borderRadius:8 }} /> : <video src={preview} controls style={{ maxWidth:420,borderRadius:8 }} />}
            <div style={{ marginTop: 8 }}>
              <button type="button" className="btn" onClick={() => { setFile(null); if (preview) { URL.revokeObjectURL(preview); setPreview(null); } if (fileInputRef.current) fileInputRef.current.value = ""; }} disabled={loading || uploading}>Remove media</button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <button className="primary" type="submit" disabled={loading || uploading}>{ loading || uploading ? "Sending..." : "Send" }</button>
          <button type="button" className="btn" onClick={clearForm} disabled={loading || uploading}>Clear</button>
        </div>
      </form>
    </div>
  );
}

