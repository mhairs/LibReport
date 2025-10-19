import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../styles/Auth.css";
import api, { setAuthToken } from "../api";

const SignIn = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId || !password) {
      setError("Please enter all fields.");
      return;
    }

    if (selectedRole === "student") {
      if (!/^[0-9]+$/.test(userId)) {
        setError("Only numbers are allowed in Student ID.");
        return;
      }
      if (userId.length !== 6) {
        setError("Student ID must be exactly 6 digits long.");
        return;
      }
    } else {
      if (!userId.includes("@")) {
        setError("Please enter a valid Admin Email.");
        return;
      }
    }

    if (password.length > 12) {
      setError("Password must not exceed 12 characters.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", {
        email: selectedRole === "admin" ? userId : undefined,
        studentId: selectedRole === "student" ? userId : undefined,
        password,
        role: selectedRole,
      });

      if (data?.token) setAuthToken(data.token);
      try {
        localStorage.setItem("lr_user", JSON.stringify(data.user || {}));
      } catch {}

      if (selectedRole === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err?.response?.data?.error || "Login failed. Please try again.";
      setError(msg);
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

        {error && <div className="error">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>{selectedRole === "admin" ? "Email" : "Student ID"}</label>
            <div className="input-group">
              <i className="fa fa-user"></i>
              <input
                type={selectedRole === "admin" ? "email" : "text"}
                placeholder={
                  selectedRole === "admin"
                    ? "Enter your Email"
                    : "Enter your Student ID"
                }
                value={userId}
                maxLength={selectedRole === "student" ? 6 : undefined}
                onChange={(e) => {
                  const value = e.target.value;
                  if (selectedRole === "student") {
                    if (/^[0-9]{0,6}$/.test(value)) setUserId(value);
                  } else {
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
            <Link to="/forgot">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Signing in…" : "Log in"}
          </button>

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