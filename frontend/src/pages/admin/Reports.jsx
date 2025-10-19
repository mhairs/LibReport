import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "../styles/Reports.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import profileImage from "../assets/pfp.png";
import { useNavigate } from "react-router-dom"; 

const Reports = () => {
  const [timeRange, setTimeRange] = useState("Daily");
  const [reportType, setReportType] = useState("Usage Report");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); 
  const navigate = useNavigate(); 

  
  const handleLogout = () => {
    setShowLogoutModal(false);
    setShowDropdown(false);
    navigate("/signin", { replace: true });
  };

  const data = [
    { time: "8AM–9AM", visits: 8 },
    { time: "9AM–10AM", visits: 5 },
    { time: "10AM–11AM", visits: 7 },
    { time: "11AM–12PM", visits: 4 },
    { time: "12PM–1PM", visits: 10 },
    { time: "1PM–2PM", visits: 9 },
    { time: "2PM–3PM", visits: 5 },
    { time: "3PM–4PM", visits: 3 },
  ];

  return (
    <div className="reports-container">
      <Sidebar />

      <div className="reports-main">

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

          <div className="tab-buttons">
            <button
              className={timeRange === "Daily" ? "active" : ""}
              onClick={() => setTimeRange("Daily")}
            >
              Daily
            </button>
            <button
              className={timeRange === "Weekly" ? "active" : ""}
              onClick={() => setTimeRange("Weekly")}
            >
              Weekly
            </button>
            <button
              className={timeRange === "Monthly" ? "active" : ""}
              onClick={() => setTimeRange("Monthly")}
            >
              Monthly
            </button>
          </div>

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
                  <td>8</td>
                </tr>
                <tr>
                  <td>Peak Hours</td>
                  <td>5</td>
                </tr>
              </tbody>
            </table>

            <div className="data-section">
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

          <div className="download-btn-container">
            <button className="download-btn">Download as PDF</button>
          </div>
        </div>
      </div>
      
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-box pretty-modal">
            <h3 className="modal-title-green">Are you sure you want to logout?</h3>

            <div className="modal-actions center-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                Close
              </button>
              <button
                className="confirm-btn delete-btn"
                onClick={handleLogout}
              >
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
