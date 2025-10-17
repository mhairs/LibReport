import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/Tracker.css";
import profileImage from "../assets/pfp.png";
import { useNavigate } from "react-router-dom";
import api from "../api";

const Tracker = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutModal(false);
    setShowDropdown(false); try { localStorage.removeItem('lr_token'); try { localStorage.removeItem('lr_user'); } catch {} } catch {}
    navigate("/signin", { replace: true }); 
  };

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ outbound: 0, inbound: 0, overdue: 0, active: 0 });

  useEffect(() => {
    api.get('/reports/overdue').then(r => {
      const items = r.data?.items || [];
      const mapped = items.map(o => ({
        status: 'Overdue',
        borrowedDate: o.borrowedAt ? new Date(o.borrowedAt).toLocaleString() : '-',
        dueDate: o.dueAt ? new Date(o.dueAt).toLocaleString() : '-',
        material: o.title,
        user: o.user,
        color: 'red'
      }));
      setLogs(mapped);
      setStats({ outbound: 0, inbound: 0, overdue: mapped.length, active: mapped.length });
    }).catch(() => { setLogs([]); });
  }, []);

  return (
    <div className="tracker-container">
      <Sidebar />

      <main className="tracker-main">
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

        {/* Main Content */}
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
                {logs.map((log, index) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      
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

export default Tracker;


