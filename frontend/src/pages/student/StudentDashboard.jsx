import React, { useEffect, useState } from "react";
import StudentCard from "../student/StudentCard";
import bookIcon from "../../assets/books2.png";
import browseIcon from "../../assets/library.png";
import clockIcon from "../../assets/clock.png";
import overdueIcon from "../../assets/ex.png";
import "../student/StudentDashboard";
import logo from "../../assets/fav_logo.png";
import { Link, useNavigate } from "react-router-dom"; 

const StudentDashboard = () => {
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Guest");
  const navigate = useNavigate();

  useEffect(() => {
    
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
  }, []);

  const handleLogout = () => {
    // Clear session data
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    // Redirect to sign-in page
    navigate("/signin");
  };

  return (
    <div className="student-dashboard-container">
      {/* Header */}
      <header className="student-header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="header-logo" />
          <h2 className="header-title">LibReport</h2>
        </div>
        <div className="header-right">
          <span className="student-name">Hi, {userName}!</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard Section */}
      <div className="student-dashboard">
        <Link to="/student/books-borrowed" className="no-link-style">
          <StudentCard title="Books Borrowed" icon={bookIcon} />
        </Link>
        <Link to="/student/browse-library" className="no-link-style">
          <StudentCard title="Browse Library" icon={browseIcon} />
        </Link>
        <StudentCard title="Library Hours" icon={clockIcon} />
        <StudentCard title="Overdue Books" icon={overdueIcon} />
      </div>
    </div>
  );
};

export default StudentDashboard;