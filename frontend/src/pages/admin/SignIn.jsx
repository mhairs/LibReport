import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/Auth.css";

const SignIn = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("admin");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (userId.trim() === "" || password.trim() === "") {
      alert("Please enter all fields.");
      return;
    }

    if (!/^[0-9]+$/.test(userId)) {
      alert("Only numbers are allowed in Admin ID / Student ID.");
      return;
    }

    if (userId.length !== 6) {
      alert("Admin ID / Student ID must be exactly 6 digits long.");
      return;
    }

    if (password.length > 12) {
      alert("Password must not exceed 12 characters.");
      return;
    }

    localStorage.setItem("token", "demo-token");
    localStorage.setItem("role", selectedRole);

    if (selectedRole === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/student-dashboard");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src={logo} alt="University Logo" className="logo" />
        <h1 className="app-name">LibReport</h1>
      </div>

      <div className="auth-right">
        <h2>Sign in to LibReport</h2>

        <div className="role-selection">
          <p>Sign In as</p>
          <div className="role-buttons">
            <button
              type="button"
              className={`role-btn ${selectedRole === "admin" ? "active" : ""}`}
              onClick={() => setSelectedRole("admin")}
            >
              Admin
            </button>
            <button
              type="button"
              className={`role-btn ${selectedRole === "student" ? "active" : ""}`}
              onClick={() => setSelectedRole("student")}
            >
              Student
            </button>
          </div>
        </div>

        <h3>Log in to your account</h3>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>{selectedRole === "admin" ? "Admin ID" : "Student ID"}</label>
            <div className="input-group">
              <i className="fa fa-user"></i>
              <input
                type="text"
                placeholder={
                  selectedRole === "admin"
                    ? "Enter your Admin ID"
                    : "Enter your Student ID"
                }
                value={userId}
                maxLength="6"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[0-9]{0,6}$/.test(value)) {
                    setUserId(value);
                  }
                }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-group">
              <i className="fa fa-lock"></i>
              <input
                type="password"
                placeholder="Password"
                value={password}
                maxLength="12" 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" className="btn">Log in</button>

          <div className="extra-links">
            <p>
              Don’t have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
