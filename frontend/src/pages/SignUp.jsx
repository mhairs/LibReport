import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/Auth.css";
import api, { setAuthToken } from "../api";

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ studentId: "", email: "", fullName: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!/^\d{2}-\d{4}-\d{6}$/.test(form.studentId)) e.studentId = "Format: 00-0000-000000";
    // Use browser validation for email, but add quick check for @
    if (!form.email.includes("@")) e.email = "Must contain @";
    if (!/^[A-Za-z .'-]+$/.test(form.fullName)) e.fullName = "Letters, spaces, apostrophes, hyphens, periods only";
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) e.password = "Min 8 chars, include letters and numbers";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const ok = validate();
    if (!ok) { setError("Please fix the highlighted fields"); return; }
    try {
      setLoading(true);
      const { data } = await api.post('/auth/signup', form);
      if (data?.token) setAuthToken(data.token);
      try { localStorage.setItem('lr_user', JSON.stringify(data.user || {})); } catch {}
      navigate("/dashboard");
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || err.message || 'Signup failed';
      setError(status === 404 ? 'Service temporarily unavailable. Please try again.' : msg);
      // Map common conflicts to specific fields
      if (/email/i.test(msg) && /exists|in use|duplicate/i.test(msg)) setErrors(s => ({ ...s, email: 'Email already in use' }));
      if (/studentid/i.test(msg) && /exists|in use|duplicate/i.test(msg)) setErrors(s => ({ ...s, studentId: 'Student ID already in use' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src={logo} alt="University Logo" className="logo" />
        <h1 className="app-name">LibReport</h1>
      </div>

      <div className="auth-right">
        <h2 className="form-title">Create Account</h2>
        <p className="subtitle">Sign up to get started</p>

        {error && <div className="error" style={{color:'#b00020', marginBottom: '8px'}}>{error}</div>}

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label>Student ID</label>
            <input name="studentId" value={form.studentId} onChange={onChange} type="text" placeholder="e.g. 03-2324-032246" required />
            {errors.studentId && <div className="error" style={{ color: '#b00020', marginTop: 4 }}>{errors.studentId}</div>}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input name="email" value={form.email} onChange={onChange} type="email" placeholder="Use an active email for verification" required />
            {errors.email && <div className="error" style={{ color: '#b00020', marginTop: 4 }}>{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input name="fullName" value={form.fullName} onChange={onChange} type="text" placeholder="Enter your full name" required />
            {errors.fullName && <div className="error" style={{ color: '#b00020', marginTop: 4 }}>{errors.fullName}</div>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input name="password" value={form.password} onChange={onChange} type="password" placeholder="Must be at least 8 characters, with letters and numbers" required />
            {errors.password && <div className="error" style={{ color: '#b00020', marginTop: 4 }}>{errors.password}</div>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input name="confirmPassword" value={form.confirmPassword} onChange={onChange} type="password" placeholder="Re-enter your password" required />
            {errors.confirmPassword && <div className="error" style={{ color: '#b00020', marginTop: 4 }}>{errors.confirmPassword}</div>}
          </div>

          <div className="checkboxes">
            <label>
              <input type="checkbox" required /> I agree to the Terms and Conditions
            </label>
            <label>
              <input type="checkbox" required /> I agree to the Privacy Policy
            </label>
          </div>

          <button type="submit" className="btn" disabled={loading}>{loading ? 'Signing Up…' : 'Sign Up'}</button>

          <p className="extra-links">
            Already have an account? <Link to="/">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
