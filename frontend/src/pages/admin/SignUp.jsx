import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/Auth.css";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required.";
    }

    if (!userId.trim()) {
      newErrors.userId = "Admin ID or Student ID is required.";
    } else if (!/^\d+$/.test(userId)) {
      newErrors.userId = "ID must contain numbers only (no letters or symbols).";
    } else if (userId.length !== 6) {
      newErrors.userId = "ID must be exactly 6 digits long.";
    }

    if (!email.trim()) {
      newErrors.email = "Email Address is required.";
    } else if (!email.includes("@gmail.com")) {
      newErrors.email = "Email must contain '@gmail.com'.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("Account created successfully!");
    }
  };

  const handleUserIdChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setUserId(value);
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

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            {errors.fullName && <small style={{ color: "red" }}>{errors.fullName}</small>}
          </div>

          <div className="form-group">
            <label>Admin ID / Student ID</label>
            <input
              type="text"
              placeholder="Enter your Admin ID or Student ID"
              value={userId}
              onChange={handleUserIdChange}
              maxLength="6"
              required
            />
            {errors.userId && <small style={{ color: "red" }}>{errors.userId}</small>}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Use an active Gmail for verification"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <small style={{ color: "red" }}>{errors.email}</small>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Must be at least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && <small style={{ color: "red" }}>{errors.password}</small>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errors.confirmPassword && (
              <small style={{ color: "red" }}>{errors.confirmPassword}</small>
            )}
          </div>

          <div className="checkboxes">
            <label>
              <input type="checkbox" required /> I agree to the Terms and Conditions
            </label>
            <label>
              <input type="checkbox" required /> I agree to the Privacy Policy
            </label>
          </div>

          <button type="submit" className="btn">Sign Up</button>

          <p className="extra-links">
            Already have an account? <Link to="/">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
