import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function History(){
  const { userId } = useParams();
  const [posts,setPosts] = useState([]);
  useEffect(()=>{ (async ()=>{ try{ const res = await api.get(`/posts/user/${userId}`); setPosts(res.data); }catch(err){ console.error(err); } })(); },[userId]);
  return (<div><h2>Your History</h2>{posts.length===0 ? <p>No posts yet.</p> : posts.map(p=> <div key={p._id} className="post-card"><Link to={`/posts/${p._id}`}>{p.title}</Link><div className="small">{new Date(p.createdAt).toLocaleString()}</div></div>)}</div>);
}
