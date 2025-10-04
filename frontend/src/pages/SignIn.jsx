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
        <h2>Sign in to LibReport</h2>
        <form className="auth-form">
          <div className="input-group">
            <i className="fa fa-user"></i>
            <input type="text" placeholder="Username" required />
          </div>
          <div className="input-group">
            <i className="fa fa-lock"></i>
            <input type="password" placeholder="Password" required />
          </div>
          <button type="submit" className="btn">Sign In</button>
          <div className="extra-links">
            <a href="#">Forgot Password?</a>
            <p>Don’t have an account? <Link to="/signup">Sign Up</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
