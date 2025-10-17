import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/Auth.css";
import api, { setAuthToken } from "../api";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });
      if (data?.token) setAuthToken(data.token);
      try { localStorage.setItem('lr_user', JSON.stringify(data.user || {})); } catch {}
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src={logo} alt="University Logo" className="logo" />
        <h1 className="app-name">LibReport</h1>
      </div>

      <div className="auth-right">
        <h2>Sign in to LibReport</h2>
        <h3>Log in to your account</h3>

        {error && <div className="error" style={{color:'#b00020', marginBottom: '8px'}}>{error}</div>}
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <i className="fa fa-user"></i>
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>

          <div className="input-group">
            <i className="fa fa-lock"></i>
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>

          <div className="forgot-password">
            <Link to="/forgot">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn" disabled={loading}>{loading ? 'Signing in…' : 'Log in'}</button>

          <div className="extra-links">
            <p>Don’t have an account? <Link to="/signup">Sign Up</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
