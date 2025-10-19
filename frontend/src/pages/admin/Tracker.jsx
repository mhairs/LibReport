import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "../../styles/Tracker.css";
import profileImage from "../../assets/pfp.png";
import api from "../../api";

const Tracker = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    outbound: 0,
    inbound: 0,
    overdue: 0,
    active: 0,
  });
  const navigate = useNavigate();

  // 🔹 Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("lr_token");
    localStorage.removeItem("lr_user");
    setShowLogoutModal(false);
    setShowDropdown(false);
    navigate("/signin", { replace: true });
  };

  // 🔹 Fetch Data
  useEffect(() => {
    api
      .get("/reports/overdue")
      .then((res) => {
        const items = res.data?.items || [];
        const mapped = items.map((o) => ({
          status: "Overdue",
          borrowedDate: o.borrowedAt
            ? new Date(o.borrowedAt).toLocaleString()
            : "-",
          dueDate: o.dueAt ? new Date(o.dueAt).toLocaleString() : "-",
          material: o.title,
          user: o.user,
          color: "red",
        }));

        setLogs(mapped);
        setStats({
          outbound: 0,
          inbound: 0,
          overdue: mapped.length,
          active: mapped.length,
        });
      })
      .catch(() => setLogs([]));
  }, []);

  return (
    <div className="tracker-container">
      <Sidebar />

      <main className="tracker-main">
        {/* 🔹 Top Bar */}
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

        {/* 🔹 Tracker Section */}
        <section className="tracker-card">
          <h2>Tracker</h2>

          <div className="tracker-stats">
            <div className="stat-box">
              <h3>Outbound</h3>
              <p>{stats.outbound}</p>
            </div>
            <div className="stat-box">
              <h3>Inbound</h3>
              <p>{stats.inbound}</p>
            </div>
            <div className="stat-box">
              <h3>Overdue</h3>
              <p>{stats.overdue}</p>
            </div>
            <div className="stat-box">
              <h3>Active</h3>
              <p>{stats.active}</p>
            </div>
          </div>

          <div className="quick-logs">
            <h3>Quick Logs</h3>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Borrowed Date</th>
                  <th>Due Date</th>
                  <th>Material</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <tr key={index}>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: log.color }}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td>{log.borrowedDate}</td>
                      <td>{log.dueDate}</td>
                      <td>{log.material}</td>
                      <td>{log.user}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No logs available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

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

export default Tracker;
