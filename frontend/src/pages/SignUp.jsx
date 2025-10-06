import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/Auth.css";

const SignUp = () => {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src={logo} alt="University Logo" className="logo" />
        <h1 className="app-name">LibReport</h1>
      </div>

      <div className="auth-right">
        <h2 className="form-title">Create Account</h2>
        <p className="subtitle">Sign up to get started</p>

        <form className="auth-form">
          <div className="form-group">
            <label>Student ID</label>
            <input type="text" placeholder="03-222-000000" required />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="Use an active email for verification" required />
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Enter your full name" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Must be at least 8 characters, with letters and numbers" required />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="Re-enter your password" required />
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
