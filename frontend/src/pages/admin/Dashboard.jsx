import React, { useEffect, useMemo, useState } from "react";
import "../styles/Dashboard.css";
import Sidebar from "../../components/Sidebar";
import ReportModal from "../../components/GenReports";
import profileImage from "../assets/pfp.png";
import { useNavigate } from "react-router-dom";
import api from "../api";
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutModal(false);
    setShowDropdown(false); try { localStorage.removeItem('lr_token'); try { localStorage.removeItem('lr_user'); } catch {} } catch {}
    navigate("/signin", { replace: true });
  };

  const [counts, setCounts] = useState({ users: 0, books: 0, activeLoans: 0, visitsToday: 0, overdue: 0 });
  const [topBooks, setTopBooks] = useState([]);
  const [heat, setHeat] = useState([]);

  useEffect(() => {
    // Load dashboard summary
    api.get('/dashboard').then(r => setCounts(c => ({ ...c, ...r.data.counts }))).catch(() => {});
    api.get('/reports/top-books').then(r => setTopBooks(r.data.items || [])).catch(() => {});
    api.get('/heatmap/visits', { params: { days: 7 } }).then(r => setHeat(r.data.items || [])).catch(() => {});
    api.get('/reports/overdue').then(r => setCounts(c => ({ ...c, overdue: (r.data.items || []).length })) ).catch(() => {});
  }, []);

  const chartData = useMemo(() => {
    const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const sums = new Array(7).fill(0);
    for (const row of heat) {
      // dow from Mongo $dayOfWeek is 1..7 (Sun..Sat)
      const idx = (row.dow ?? 1) - 1;
      sums[idx] += row.count || 0;
    }
    return names.map((name, i) => ({ day: name, value: sums[i] }));
  }, [heat]);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-main">
        {/* TOPBAR (Profile section) */}
        <div className="dashboard-topbar">
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

        {/* Summary Cards */}
        <section className="summary-cards">
          <div className="card yellow">
            <h3>Total Books</h3>
            <p className="count">{counts.books}</p>
          </div>
          <div className="card green">
            <h3>Books Borrowed</h3>
            <p className="count">{counts.activeLoans}</p>
          </div>
          <div className="card red">
            <h3>Overdue Books</h3>
            <p className="count">{counts.overdue}</p>
          </div>
          <div className="card blue">
            <h3>Active Users</h3>
            <p className="count">{counts.users}</p>
          </div>
        </section>

        {/* Chart Section */}
        <section className="chart-section">
          <h3>Usage Heatmaps</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
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
            <ul>
              {topBooks.slice(0,5).map((b) => (
                <li key={b.bookId || b.title}>{b.title} — {b.author} ({b.borrows})</li>
              ))}
            </ul>
          </div>
        </section>

        {showReport && <ReportModal onClose={() => setShowReport(false)} />}
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

export default Dashboard;


