import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles/Reports.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import profileImage from "../../assets/pfp.png";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const Reports = () => {
  const [timeRange, setTimeRange] = useState("Daily");
  const [reportType, setReportType] = useState("Usage Report");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const [summary, setSummary] = useState({ visits: 0, peak: 0 });
  const [data, setData] = useState([]);

  useEffect(() => {
    api
      .get("/heatmap/visits", { params: { days: 1 } })
      .then((r) => {
        const items = r.data.items || [];
        const hours = new Array(24).fill(0);
        for (const it of items) hours[it.hour ?? 0] += it.count || 0;
        const series = hours.map((v, h) => ({ time: `${h}:00`, visits: v }));
        const total = hours.reduce((a, b) => a + b, 0);
        const peak = Math.max(...hours);
        setData(series);
        setSummary({ visits: total, peak });
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(false);
    setShowDropdown(false);
    try {
      localStorage.removeItem("lr_token");
      localStorage.removeItem("lr_user");
    } catch {}
    navigate("/signin", { replace: true });
  };

  return (
    <div className="reports-container">
      <Sidebar />

      <div className="reports-main">
        {/* Top bar with profile */}
        <div className="reports-topbar">
          <div
            className="profile-container"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="profile-circle">
              <img src={profileImage} alt="Profile" />
            </div>

            {showDropdown && (
              <div className="profile-dropdown">
                <button onClick={() => setShowLogoutModal(true)}>Logout</button>
              </div>
            )}
          </div>
        </div>

        {/* Report Content */}
        <div className="report-content">
          <h2>Auto Reports</h2>

          {/* Time range buttons */}
          <div className="tab-buttons">
            {["Daily", "Weekly", "Monthly"].map((range) => (
              <button
                key={range}
                className={timeRange === range ? "active" : ""}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Report type dropdown */}
          <div className="report-type-dropdown">
            <label>Report Type: </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option>Usage Report</option>
              <option>Overdue Report</option>
              <option>Borrowed Books Summary</option>
            </select>
          </div>

          {/* Data section */}
          <div className="report-box">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Library Visits</td>
                  <td>{summary.visits}</td>
                </tr>
                <tr>
                  <td>Peak Hour Count</td>
                  <td>{summary.peak}</td>
                </tr>
              </tbody>
            </table>

            <div className="data-section">
              {/* Table */}
              <table className="time-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={index}>
                      <td>{row.time}</td>
                      <td>{row.visits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bar Chart */}
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#608547" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="download-btn-container">
            <button className="download-btn">Download as PDF</button>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-box pretty-modal">
            <h3 className="modal-title-green">
              Are you sure you want to logout?
            </h3>

            <div className="modal-actions center-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                Close
              </button>
              <button className="confirm-btn delete-btn" onClick={handleLogout}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
