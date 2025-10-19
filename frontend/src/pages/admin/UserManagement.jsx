import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "../styles/UserManagement.css";
import pfp from "../assets/pfp.png";
import { useNavigate } from "react-router-dom"; 

const UserManagement = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate(); 


  const [users, setUsers] = useState([
    {
      id: 1,
      fullName: "John Doe",
      studentId: "20230001",
      course: "BSIT",
      registrationDate: "2025-10-13 / 11:30 AM",
      status: "Active",
    },
  ]);

  const [selectedUser, setSelectedUser] = useState(null);

  const handleEdit = (user) => {
    setSelectedUser({ ...user }); 
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (selectedUser) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id ? selectedUser : user
        )
      );
    }
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    setIsDropdownOpen(false);
    navigate("/signin", { replace: true });
  };

  return (
    <div className="user-page-container">
      <Sidebar />

      <div className="user-page-main">
        <div className="user-topbar">
          <div
            className="profile-container"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="profile-circle">
              <img src={pfp} alt="Profile" />
            </div>

            {isDropdownOpen && (
              <div className="profile-dropdown">
                <button onClick={() => setShowLogoutModal(true)}>Logout</button>
              </div>
            )}
          </div>
        </div>

        <div className="user-card">
          <h2>User Management</h2>
          <hr className="user-divider" />

          <div className="user-body-card">
            <div className="user-info-card">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Student ID</th>
                    <th>Course</th>
                    <th>Registration Date/Time</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.fullName}</td>
                      <td>{user.studentId}</td>
                      <td>{user.course}</td>
                      <td>{user.registrationDate}</td>
                      <td
                        className={
                          user.status.toLowerCase() === "active"
                            ? "status-active"
                            : ""
                        }
                      >
                        {user.status}
                      </td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/*Edit Modal */}
        {isModalOpen && selectedUser && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Edit User</h3>

              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={selectedUser.fullName}
                onChange={handleInputChange}
              />

              <label>Student ID</label>
              <input
                type="text"
                name="studentId"
                value={selectedUser.studentId}
                onChange={handleInputChange}
              />

              <label>Course</label>
              <input
                type="text"
                name="course"
                value={selectedUser.course}
                onChange={handleInputChange}
              />

              <label>Status</label>
              <input
                type="text"
                name="status"
                value={selectedUser.status}
                onChange={handleInputChange}
              />

              <div className="modal-actions">
                <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="save-btn" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Logout Confirmation Modal */}
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
    </div>
  );
};

export default UserManagement;
