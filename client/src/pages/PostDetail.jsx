import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const PostDetail = () => {
  const { id } = useParams();
  const { user, isLoggedIn } = useAuth();
  const [post,setPost] = useState(null);
  const [loading,setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(()=>{ const fetchPost = async ()=>{ try{ const res = await api.get(`/posts/${id}`); setPost(res.data); }catch(err){ console.error(err); } finally{ setLoading(false); } }; fetchPost(); },[id]);

  const handleDelete = async ()=>{ if(!confirm('Delete this post?')) return; try{ await api.delete(`/posts/${id}`); navigate('/'); }catch(err){ alert('Failed to delete'); } };

  if(loading) return <p>Loading...</p>;
  if(!post) return <p>Post not found</p>;

  const isAuthor = isLoggedIn && user?._id === post.author?._id;

  return (
    <div>
      <h1>{post.title}</h1>
      <div className="small">by {post.author?.username} • {new Date(post.createdAt).toLocaleString()}</div>
      <p style={{whiteSpace:'pre-wrap',marginTop:12}}>{post.body}</p>
      {post.media?.map((m,i)=> m.mimeType.startsWith('image') ? <img key={i} src={m.data} style={{maxWidth:420,marginTop:12}}/> : <video key={i} src={m.data} controls style={{maxWidth:540,marginTop:12}}/>)}

      {isAuthor && (
        <div style={{marginTop:12,display:'flex',gap:8}}>
          <Link to={`/posts/${post._id}/edit`} className="btn">Edit</Link>
          <button onClick={handleDelete} className="btn">Delete</button>
        </div>
      )}
    </div>
  );
};

export default PostDetail;

