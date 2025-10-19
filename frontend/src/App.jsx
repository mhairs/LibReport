import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles/Auth.css";

// ===== AUTH PAGES (shared by both roles) =====
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// ===== ADMIN PAGES =====
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsageHeatmaps from "./pages/admin/UsageHeatmaps";
import AdminTracker from "./pages/admin/Tracker";
import AdminReports from "./pages/admin/Reports";
import AdminUserManagement from "./pages/admin/UserManagement";
import AdminMaterialManagement from "./pages/admin/MaterialManagement";
import AdminBooksManagement from "./pages/admin/BooksManagement";

// ===== STUDENT PAGES =====
import StudentDashboard from "./pages/student/StudentDashboard";
import BooksBorrowed from "./pages/student/BooksBorrowed";
import BrowseLibrary from "./pages/student/BrowseLibrary";
import StudentForgotPassword from "./pages/ForgotPassword";
import StudentResetPassword from "./pages/ResetPassword";

// ===== AUTH PROTECTION =====
function RequireAuth({ children }) {
  try {
    const token = localStorage.getItem("lr_token");
    if (!token) return <Navigate to="/signin" replace />;
  } catch {}
  return children;
}

function RequireAdmin({ children }) {
  try {
    const raw = localStorage.getItem("lr_user");
    const user = raw ? JSON.parse(raw) : null;
    if (!user || user.role !== "admin")
      return <Navigate to="/student/dashboard" replace />;
  } catch {}
  return children;
}

function App() {
  const [role, setRole] = useState("");

  return (
    <Router>
      <div className="App">
        {/* ===== ROLE SELECTION PAGE ===== */}
        {!role && (
          <div className="role-selection">
            <h2>Select Role:</h2>
            <button onClick={() => setRole("admin")}>Login as Admin</button>
            <button onClick={() => setRole("student")}>Login as Student</button>
          </div>
        )}

        <Routes>
          {/* ===== COMMON AUTH ROUTES ===== */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* ===== ADMIN ROUTES ===== */}
          {role === "admin" && (
            <>
              <Route path="/dashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
              <Route path="/usage-heatmaps" element={<RequireAuth><AdminUsageHeatmaps /></RequireAuth>} />
              <Route path="/tracker" element={<RequireAuth><AdminTracker /></RequireAuth>} />
              <Route path="/reports" element={<RequireAuth><AdminReports /></RequireAuth>} />
              <Route path="/usermanagement" element={<RequireAuth><RequireAdmin><AdminUserManagement /></RequireAdmin></RequireAuth>} />
              <Route path="/materialmanagement" element={<RequireAuth><RequireAdmin><AdminMaterialManagement /></RequireAdmin></RequireAuth>} />
              <Route path="/booksmanagement" element={<RequireAuth><RequireAdmin><AdminBooksManagement /></RequireAdmin></RequireAuth>} />
            </>
          )}

          {/* ===== STUDENT ROUTES ===== */}
          {role === "student" && (
            <>
              <Route path="/forgot" element={<StudentForgotPassword />} />
              <Route path="/reset" element={<StudentResetPassword />} />
              <Route path="/dashboard" element={<RequireAuth><StudentDashboard /></RequireAuth>} />
              <Route path="/books-borrowed" element={<RequireAuth><BooksBorrowed /></RequireAuth>} />
              <Route path="/browse-library" element={<RequireAuth><BrowseLibrary /></RequireAuth>} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
