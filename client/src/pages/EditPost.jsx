import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import PostForm from "../components/PostForm";

const EditPost = () => {
  const { id } = useParams();
  const [initial,setInitial] = useState(null);
  const [loading,setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(()=>{ const fetchPost = async ()=>{ try{ const res = await api.get(`/posts/${id}`); setInitial({ title: res.data.title, body: res.data.body, media: res.data.media || [] }); }catch(err){ console.error(err); } finally{ setLoading(false); } }; fetchPost(); },[id]);

  const handleUpdate = async (data) => { try{ await api.put(`/posts/${id}`, data); navigate(`/posts/${id}`); }catch(err){ alert(err.response?.data?.message || 'Failed to update post'); } };

  if(loading) return <p>Loading...</p>;
  if(!initial) return <p>Post not found</p>;

  return (
    <div>
      <h2>Edit Post</h2>
      <PostForm initialValues={initial} onSubmit={handleUpdate} submitLabel={'Send'} />
    </div>
  );
};

export default EditPost;

