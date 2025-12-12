import React from "react";
import { Link } from "react-router-dom";

export default function PostCard({ post }){
  return (
    <div className="post-card">
      <h3 style={{margin:0}}><Link to={`/posts/${post._id}`}>{post.title}</Link></h3>
      <div className="small">by {post.author?.username || "Unknown"} • {new Date(post.createdAt).toLocaleString()}</div>
      <p style={{marginTop:8}}>{post.body.length>200?post.body.slice(0,200)+"...":post.body}</p>
      {post.media?.map((m,i)=> m.mimeType.startsWith("image") ? <img key={i} src={m.data} style={{maxWidth:160, borderRadius:8, marginRight:8}}/> : <video key={i} src={m.data} controls style={{maxWidth:220}}/>)}
    </div>
  );
}


