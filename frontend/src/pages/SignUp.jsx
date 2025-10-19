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
            <div className="input-group">
              <i className="fa fa-id-card"></i>
              <input type="text" placeholder="e.g. 00-0000-000000" />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-group">
              <i className="fa fa-envelope"></i>
              <input type="email" placeholder="Use an active email" />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-group">
              <i className="fa fa-lock"></i>
              <input type="password" placeholder="Enter password" />
            </div>
          </div>
          <div className="checkboxes">
            <label>
              <input type="checkbox" /> I agree to the Terms and Conditions
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