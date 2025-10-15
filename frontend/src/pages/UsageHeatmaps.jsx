import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/UsageHeatmaps.css";
import profileImage from "../assets/pfp.png";
import { useNavigate } from "react-router-dom";

const UsageHeatmaps = () => {
  const [timeRange, setTimeRange] = useState("");
  const [metric, setMetric] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [chartRange, setChartRange] = useState("Daily");
  const [showLogoutModal, setShowLogoutModal] = useState(false); 
  const navigate = useNavigate(); 

 
  const handleLogout = () => {
    setShowLogoutModal(false);
    setShowDropdown(false);
    navigate("/signin", { replace: true }); 
  };

  useEffect(() => {
    setTimeRange("");
    setChartRange("Daily");
  }, []);

  const dataSets = {
    Daily: [
      { day: "Monday", value: 580 },
      { day: "Tuesday", value: 420 },
      { day: "Wednesday", value: 150 },
      { day: "Thursday", value: 90 },
      { day: "Friday", value: 210 },
      { day: "Saturday", value: 380 },
      { day: "Sunday", value: 120 },
    ],
    Weekly: [
      { day: "Week 1", value: 1200 },
      { day: "Week 2", value: 900 },
      { day: "Week 3", value: 1600 },
      { day: "Week 4", value: 1100 },
    ],
    Monthly: [
      { day: "Jan", value: 3200 },
      { day: "Feb", value: 2800 },
      { day: "Mar", value: 4200 },
      { day: "Apr", value: 3700 },
      { day: "May", value: 4600 },
      { day: "Jun", value: 4000 },
    ],
  };

  const ranges = ["Daily", "Weekly", "Monthly"];
  const metrics = ["Books Borrowed", "Overdue Books"];

  const handleTimeRangeChange = (e) => {
    const value = e.target.value;
    setTimeRange(value);
    setChartRange(value || "Daily");
  };

  return (
    <div className="heatmap-container">
      <Sidebar />

      <div className="heatmap-main">
        <div className="heatmap-topbar">
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

        <div className="heatmap-card">
          <h2>Usage Heatmaps</h2>
          <hr className="heatmap-divider" />

          <div className="heatmap-body-card">
            <div className="heatmap-body">
              <div className="heatmap-controls">
                <div>
                  <select value={timeRange} onChange={handleTimeRangeChange}>
                    <option value="" disabled>
                      Select Time Range
                    </option>
                    {ranges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                  >
                    <option value="" disabled>
                      Metric
                    </option>
                    {metrics.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dataSets[chartRange] || []}>
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
            </div>
          </div>
        </div>
      </div>

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

export default UsageHeatmaps;
