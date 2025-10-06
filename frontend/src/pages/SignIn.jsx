import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/Auth.css";

const SignIn = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard"); // Redirect to Dashboard after login
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

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <i className="fa fa-user"></i>
            <input type="text" placeholder="Admin ID" required />
          </div>

          <div className="input-group">
            <i className="fa fa-lock"></i>
            <input type="password" placeholder="Password" required />
          </div>

          <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" className="btn">Log in</button>

          <div className="extra-links">
            <p>Don’t have an account? <Link to="/signup">Sign Up</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
