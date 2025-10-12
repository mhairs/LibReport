import React, { useState } from "react";
import "../styles/Dashboard.css";
import Sidebar from "../components/Sidebar";
import ReportModal from "../components/GenReports";
import profileImage from "../assets/pfp.png";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [showReport, setShowReport] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };


  const data = [
    { day: "Monday", value: 580 },
    { day: "Tuesday", value: 420 },
    { day: "Wednesday", value: 150 },
    { day: "Thursday", value: 90 },
    { day: "Friday", value: 210 },
    { day: "Saturday", value: 380 },
    { day: "Sunday", value: 100 },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        {/* Header */}
        <header className="dashboard-header">
          <div
            className="profile-container"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="profile-circle">
              <img src={profileImage} alt="Profile" />
            </div>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className="profile-dropdown">
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </header>

        {/* Summary Cards */}
        <section className="summary-cards">
          <div className="card yellow">
            <h3>Total Books</h3>
            <p className="count">25</p>
          </div>
          <div className="card green">
            <h3>Books Borrowed</h3>
            <p className="count">5</p>
          </div>
          <div className="card red">
            <h3>Overdue Books</h3>
            <p className="count">4</p>
          </div>
          <div className="card blue">
            <h3>Active Users</h3>
            <p className="count">15</p>
          </div>
        </section>

        {/* Chart Section*/}
        <section className="chart-section">
          <h3>Usage Heatmaps</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ff0000"
                  strokeWidth={2}
                  dot={{ fill: "#000" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Reports Section */}
        <section className="report-section">
          <div className="report-card">
            <h3>Quick Reports</h3>
            <button
              className="generate-btn"
              onClick={() => setShowReport(true)}
            >
              Generate Report
            </button>
          </div>
          <div className="report-card">
            <h3>Popular Books</h3>
          </div>
        </section>

        {showReport && <ReportModal onClose={() => setShowReport(false)} />}
      </main>
    </div>
  );
};

export default Dashboard;
