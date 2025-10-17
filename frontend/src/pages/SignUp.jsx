import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/Auth.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ studentId: "", email: "", fullName: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!/^[0-9]+$/.test(form.studentId)) return "Student ID must contain numbers only";
    if (!form.email.includes("@")) return "Email must contain '@'";
    if (!/^[A-Za-z ]+$/.test(form.fullName)) return "Full name must contain letters and spaces only";
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) return "Password must be at least 8 chars and include letters and numbers";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) { setError(v); return; }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Signup failed");
      navigate("/signin");
    } catch (err) {
      setError(err.message);
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
            <input name="studentId" value={form.studentId} onChange={onChange} type="text" placeholder="digits only e.g. 03222000000" required />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input name="email" value={form.email} onChange={onChange} type="email" placeholder="Use an active email for verification" required />
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input name="fullName" value={form.fullName} onChange={onChange} type="text" placeholder="Enter your full name" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input name="password" value={form.password} onChange={onChange} type="password" placeholder="Must be at least 8 characters, with letters and numbers" required />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input name="confirmPassword" value={form.confirmPassword} onChange={onChange} type="password" placeholder="Re-enter your password" required />
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
