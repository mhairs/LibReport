import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
import logo from "../assets/fav_logo.png";

const Sidebar = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

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

        
        <div className="dropdown-section">
          <div
            className="dropdown-toggle"
            onClick={() => setIsAdminOpen(!isAdminOpen)}
          >
            <span>Admin Panel</span>
            <span className="arrow">{isAdminOpen ? "▲" : "▼"}</span>
          </div>

          {isAdminOpen && (
            <div className="dropdown-links">
              <NavLink
                to="/admin/user"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                User
              </NavLink>

              <NavLink
                to="/admin/material"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Material
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
