import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "../styles/Tracker.css";
import profileImage from "../assets/pfp.png";
import { useNavigate } from "react-router-dom";

const Tracker = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutModal(false);
    setShowDropdown(false);
    navigate("/signin", { replace: true }); 
  };

  const logs = [
    {
      status: "Returned",
      borrowedDate: "8:30 AM - 9/25/2025",
      dueDate: "9:30 AM - 9/28/2025",
      material: "Book [MaterialID]",
      user: "[UserID]",
      color: "green",
    },
    {
      status: "Due Soon",
      borrowedDate: "2:30 PM - 5/25/2025",
      dueDate: "1:30 PM - 5/29/2025",
      material: "Almanac [MaterialID]",
      user: "[UserID]",
      color: "orange",
    },
    {
      status: "Overdue",
      borrowedDate: "9:30 AM - 4/28/2025",
      dueDate: "10:30 AM - 4/30/2025",
      material: "Comic [MaterialID]",
      user: "[UserID]",
      color: "red",
    },
    {
      status: "Returned",
      borrowedDate: "5:30 PM - 8/10/2025",
      dueDate: "9:30 AM - 8/13/2025",
      material: "Encyclopedia [MaterialID]",
      user: "[UserID]",
      color: "green",
    },
    {
      status: "Overdue",
      borrowedDate: "11:30 AM - 11/7/2025",
      dueDate: "8:45 AM - 11/12/2025",
      material: "Magazine [MaterialID]",
      user: "[UserID]",
      color: "red",
    },
  ];

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
              <p>5</p>
            </div>
            <div className="stat-box">
              <h3>Inbound</h3>
              <p>2</p>
            </div>
            <div className="stat-box">
              <h3>Overdue</h3>
              <p>2</p>
            </div>
            <div className="stat-box">
              <h3>Active</h3>
              <p>1</p>
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
