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
        <h2>Create Account</h2>
        <p className="subtitle">Sign up to get started</p>

        <form className="signup-form">
          <label>
            Student ID
            <input type="text" placeholder="Enter your student ID" required />
          </label>

          <label>
            Email Address
            <input type="email" placeholder="Use an active email for verification" required />
          </label>

          <label>
            Full Name
            <input type="text" placeholder="Enter your full name" required />
          </label>

          <label>
            Password
            <input type="password" placeholder="Must be at least 8 characters, with letters and numbers" required />
          </label>

          <label>
            Confirm Password
            <input type="password" placeholder="Re-enter your password" required />
          </label>

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
            Already have an account? <Link to="/">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
