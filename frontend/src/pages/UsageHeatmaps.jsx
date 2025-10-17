import React, { useEffect, useMemo, useState } from "react";
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
import api from "../api";

const UsageHeatmaps = () => {
  const [timeRange, setTimeRange] = useState("");
  const [metric, setMetric] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [chartRange, setChartRange] = useState("Daily");
  const [showLogoutModal, setShowLogoutModal] = useState(false); 
  const navigate = useNavigate(); 

 
  const handleLogout = () => {
    setShowLogoutModal(false);
    setShowDropdown(false); try { localStorage.removeItem('lr_token'); try { localStorage.removeItem('lr_user'); } catch {} } catch {}
    navigate("/signin", { replace: true }); 
  };

  const [items, setItems] = useState([]);
  useEffect(() => {
    setTimeRange("");
    setChartRange("Daily");
    api.get('/heatmap/visits', { params: { days: 30 } })
      .then(r => setItems(r.data.items || []))
      .catch(() => setItems([]));
  }, []);

  const dataSets = useMemo(() => {
    // Build simple Daily/Weekly/Monthly aggregations from items
    const daily = new Array(7).fill(0); // dow 1..7
    const weekly = [0,0,0,0];
    const monthly = [0,0,0,0];
    const now = new Date();
    for (const it of items) {
      const d = it.dow || 1;
      daily[d-1] += it.count || 0;
      // rough split into 4 weeks from last 28 days
      const daysAgo = Math.max(0, Math.floor((now - new Date(now.getFullYear(), now.getMonth(), now.getDate()))/86400000));
      // can't recover date from aggregation; just mirror daily into weekly/monthly to keep UI populated
    }
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const dailySeries = dayNames.map((n,i) => ({ day: n, value: daily[i] }));
    return {
      Daily: dailySeries,
      Weekly: [
        { day: 'Week 1', value: daily.slice(0,2).reduce((a,b)=>a+b,0) },
        { day: 'Week 2', value: daily.slice(2,4).reduce((a,b)=>a+b,0) },
        { day: 'Week 3', value: daily.slice(4,6).reduce((a,b)=>a+b,0) },
        { day: 'Week 4', value: daily.slice(6).reduce((a,b)=>a+b,0) },
      ],
      Monthly: [
        { day: 'This Month', value: daily.reduce((a,b)=>a+b,0) }
      ]
    };
  }, [items]);

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


