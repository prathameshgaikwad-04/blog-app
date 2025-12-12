import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [emailOrUsername, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [persist, setPersist] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { emailOrUsername, password });

      // Build full user object so UI updates correctly
      const userObj = {
        _id: res.data._id,
        username: res.data.username,
        email: res.data.email,
        createdAt: res.data.createdAt,      // <-- JOIN DATE
        avatarUrl: res.data.avatarUrl || null   // <-- PROFILE PHOTO IF AVAILABLE
      };

      login(userObj, res.data.token, persist);
      navigate("/");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="main-card">
      <h2>Welcome back</h2>

      <form onSubmit={handle}>
        <div className="form-field">
          <label>Username or Email</label>
          <input
            className="input"
            value={emailOrUsername}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <label>
            <input
              type="checkbox"
              checked={persist}
              onChange={(e) => setPersist(e.target.checked)}
            />
            {" "}
            Keep me logged in
          </label>

          <Link
            to="/forgot-password"
            style={{ marginLeft: "auto", color: "var(--accent)" }}
          >
            Forgot password?
          </Link>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="primary" type="submit">
            Login
          </button>

          <Link to="/register" className="btn">
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
}


