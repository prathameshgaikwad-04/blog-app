import React, { useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot", { email });
      setSent(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Forgot password</h2>
      {!sent ? (
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Registered email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
            <Link to="/login" className="btn">Back to login</Link>
          </div>
        </form>
      ) : (
        <div className="card">
          <p>We sent a reset link if that email exists. Check your inbox (or the server console during dev).</p>
          <Link to="/login" className="btn">Return to login</Link>
        </div>
      )}
    </div>
  );
}
