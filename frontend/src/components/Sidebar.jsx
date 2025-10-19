import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
import logo from "../assets/fav_logo.png";

const Sidebar = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [role, setRole] = useState('student');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lr_user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.role) setRole(u.role);
      }
    } catch {}
  }, []);

  return (
    <aside className="sidebar">
      <div className="logo-section">
        <img src={logo} alt="University Logo" className="sidebar-logo" />
        <hr className="divider" />
      </div>

      <nav className="nav-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/usage-heatmaps"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Usage Heatmaps
        </NavLink>

        <NavLink
          to="/tracker"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Tracker
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Reports
        </NavLink>

        {role === 'admin' && (
        <div className="dropdown-section">
          <div
            className="dropdown-toggle"
            onClick={() => setIsAdminOpen(!isAdminOpen)}
          >
            <span>Admin Panel</span>
          </div>

          {isAdminOpen && (
            <div className="dropdown-links">
              <NavLink
                to="/usermanagement"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                User
              </NavLink>

            
              <NavLink
                to="/materialmanagement"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Material
              </NavLink>

              <NavLink
                to="/booksmanagement"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Books Management
              </NavLink>
            </div>
          )}
        </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
