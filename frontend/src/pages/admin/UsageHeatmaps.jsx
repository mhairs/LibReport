import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../../styles/UsageHeatmaps.css";
import profileImage from "../../assets/pfp.png";
import api from "../../api";

const UsageHeatmaps = () => {
  const [timeRange, setTimeRange] = useState("");
  const [metric, setMetric] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [chartRange, setChartRange] = useState("Daily");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  // 🔹 Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("lr_token");
    localStorage.removeItem("lr_user");
    setShowLogoutModal(false);
    setShowDropdown(false);
    navigate("/signin", { replace: true });
  };

  // 🔹 Fetch Heatmap Data
  useEffect(() => {
    setTimeRange("");
    setChartRange("Daily");

    api
      .get("/heatmap/visits", { params: { days: 30 } })
      .then((res) => setItems(res.data?.items || []))
      .catch(() => setItems([]));
  }, []);

  // 🔹 Prepare Chart Data
  const dataSets = useMemo(() => {
    const daily = new Array(7).fill(0);
    const now = new Date();

    for (const it of items) {
      const d = it.dow || 1; // Day of week
      daily[d - 1] += it.count || 0;
    }

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailySeries = dayNames.map((n, i) => ({ day: n, value: daily[i] }));

    return {
      Daily: dailySeries,
      Weekly: [
        { day: "Week 1", value: daily.slice(0, 2).reduce((a, b) => a + b, 0) },
        { day: "Week 2", value: daily.slice(2, 4).reduce((a, b) => a + b, 0) },
        { day: "Week 3", value: daily.slice(4, 6).reduce((a, b) => a + b, 0) },
        { day: "Week 4", value: daily.slice(6).reduce((a, b) => a + b, 0) },
      ],
      Monthly: [
        { day: "This Month", value: daily.reduce((a, b) => a + b, 0) },
      ],
    };
  }, [items]);

  const ranges = ["Daily", "Weekly", "Monthly"];
  const metrics = ["Books Borrowed", "Overdue Books"];

  // 🔹 Handle Time Range Selection
  const handleTimeRangeChange = (e) => {
    const value = e.target.value;
    setTimeRange(value);
    setChartRange(value || "Daily");
  };

  return (
    <div className="heatmap-container">
      <Sidebar />

      <div className="heatmap-main">
        {/* 🔹 Top Bar */}
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

        {/* 🔹 Main Content */}
        <div className="heatmap-card">
          <h2>Usage Heatmaps</h2>
          <hr className="heatmap-divider" />

          <div className="heatmap-body-card">
            <div className="heatmap-body">
              {/* 🔹 Controls */}
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

              {/* 🔹 Chart */}
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

      {/* 🔹 Logout Confirmation Modal */}
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

export default UsageHeatmaps;
