import React, { useState } from "react";
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

const UsageHeatmaps = () => {
  const [timeRange, setTimeRange] = useState("Daily");
  const [metric, setMetric] = useState("Books Borrowed");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    console.log("User logged out");
  };

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

  const metrics = ["Active Users", "Books Borrowed", "Overdue Books"];
  const ranges = ["Daily", "Weekly", "Monthly"];

  return (
    <div className="heatmap-layout">
      <Sidebar />

      <main className="heatmap-content">
        <header className="heatmap-header">
          <h2>Usage Heatmaps</h2>

          <div
            className="profile-container"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="profile-circle">
              <img src={profileImage} alt="Profile" />
            </div>

            {showDropdown && (
              <div className="profile-dropdown">
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </header>

        <div className="heatmap-card">
          <div className="heatmap-body">
            <div className="heatmap-controls">
              <div>
                <label>Select Time Range:</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  {ranges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Metric:</label>
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                >
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
                <LineChart data={dataSets[timeRange]}>
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
      </main>
    </div>
  );
};

export default UsageHeatmaps;
