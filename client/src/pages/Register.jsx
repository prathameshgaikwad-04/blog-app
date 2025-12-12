import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Register(){
  const [username,setUsername]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", { username, email, password });
      login({ _id: res.data._id, username: res.data.username, email: res.data.email }, res.data.token, true);
      nav("/");
    } catch (err) { alert(err.response?.data?.message || "Register failed"); }
  };

  return (
    <div>
      <h2>Create your account</h2>
      <form onSubmit={handle}>
        <div className="form-field"><label>Username</label><input className="input" value={username} onChange={e=>setUsername(e.target.value)} required/></div>
        <div className="form-field"><label>Email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
        <div className="form-field"><label>Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
        <div style={{display:"flex",gap:8}}><button className="primary" type="submit">Register</button><Link to="/login" className="btn">Login</Link></div>
      </form>
    </div>
  );
}

