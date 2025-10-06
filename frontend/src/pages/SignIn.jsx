import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/Auth.css";

const SignIn = () => {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src={logo} alt="University Logo" className="logo" />
        <h1 className="app-name">LibReport</h1>
      </div>

      <div className="auth-right">
        <h2 className="form-title">Log in to LibReport</h2>
        <p className="subtitle">Log in to your account</p>

        <form className="auth-form">
          <div className="input-group">
            <i className="fa fa-user"></i>
            <input type="text" placeholder="Student ID" required />
          </div>

          <div className="input-group">
            <i className="fa fa-lock"></i>
            <input type="password" placeholder="Password" required />
          </div>

          <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" className="btn">Log in</button>

          <p className="extra-links">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
