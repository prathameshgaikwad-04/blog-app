import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import PostForm from "../components/PostForm";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error("Failed to load post", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleUpdate = async ({ title, body, file }) => {
    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("title", title);
      fd.append("body", body);
      if (file) fd.append("avatar", file); // 🔑 same field name

      await api.put(`/posts/${id}`, fd);

      navigate(`/posts/${id}`);
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found</p>;

  return (
    <PostForm
      initialPost={post}   // ✅ THIS WAS MISSING
      onSubmit={handleUpdate}
      loading={saving}
      mode="edit"
    />
  );
};

export default EditPost;


