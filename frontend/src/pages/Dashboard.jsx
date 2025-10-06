import React, { useState } from "react";
import "../styles/Dashboard.css";
import Sidebar from "../components/Sidebar";
import ReportModal from "../components/GenReports";
import usageImage from "../assets/usage.png";
import profileImage from "../assets/pfp.png";

const Dashboard = () => {
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="profile-circle">
            <img src={profileImage} alt="Profile" />
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

        {/* Chart Section */}
        <section className="chart-section">
          <h3>Usage Heatmaps</h3>
          <img src={usageImage} alt="Usage Chart" className="chart-img" />
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
