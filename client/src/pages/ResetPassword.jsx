import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    if (!token) return alert("Missing token");
    setLoading(true);
    try {
      await api.post(`/auth/reset/${token}`, { password });
      setDone(true);
      // optional: go to login after a short delay
      setTimeout(() => nav("/login"), 1200);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Reset password</h2>
      {!done ? (
        <form onSubmit={handle}>
          <div className="form-field">
            <label>New password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Set new password"}
            </button>
            <Link to="/login" className="btn">Back to login</Link>
          </div>
        </form>
      ) : (
        <div className="card">
          <p>Your password was reset. You will be redirected to login.</p>
          <Link to="/login" className="btn">Go to Login</Link>
        </div>
      )}
    </div>
  );
}

