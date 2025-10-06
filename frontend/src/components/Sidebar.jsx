import React from "react";
import "../styles/Sidebar.css";
import logo from "../assets/fav_logo.png";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo-section">
        <img src={logo} alt="University Logo" className="sidebar-logo" />
        <hr className="divider" />
      </div>

      <nav className="nav-links">
        <a href="#" className="active">Dashboard</a>
        <a href="#">Usage Heatmaps</a>
        <a href="#">Tracker</a>
        <a href="#">Reports</a>
        <a href="#">Admin Panel</a>
      </nav>
    </aside>
  );
};

export default Sidebar;
