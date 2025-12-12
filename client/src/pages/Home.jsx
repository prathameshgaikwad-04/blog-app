import React, { useEffect, useState } from "react";
import api from "../api";
import PostCard from "../components/PostCard";

export default function Home(){
  const [posts,setPosts] = useState([]);
  useEffect(()=> { (async ()=> { try { const res = await api.get("/posts"); setPosts(res.data); } catch(err){ console.error(err); } })(); },[]);
  return (<div><h1 className="h1">Latest Posts</h1>{ posts.length===0 ? <p>No posts yet.</p> : posts.map(p=> <PostCard key={p._id} post={p} />) }</div>);
}

