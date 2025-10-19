import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles/Auth.css";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsageHeatmaps from "./pages/admin/UsageHeatmaps";
import AdminTracker from "./pages/admin/Tracker";
import AdminReports from "./pages/admin/Reports";
import AdminUserManagement from "./pages/admin/UserManagement";
import AdminMaterialManagement from "./pages/admin/MaterialManagement";
import AdminBooksManagement from "./pages/admin/BooksManagement";
import StudentDashboard from "./pages/student/StudentDashboard";
import BooksBorrowed from "./pages/student/BooksBorrowed";
import BrowseLibrary from "./pages/student/BrowseLibrary";
import StudentForgotPassword from "./pages/ForgotPassword";
import StudentResetPassword from "./pages/ResetPassword";

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
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot" element={<StudentForgotPassword />} />
          <Route path="/reset" element={<StudentResetPassword />} />
          <Route path="/dashboard" element={<RequireAuth><StudentDashboard /></RequireAuth>} />
          <Route path="/books-borrowed" element={<RequireAuth><BooksBorrowed /></RequireAuth>} />
          <Route path="/browse-library" element={<RequireAuth><BrowseLibrary /></RequireAuth>} />
          <Route path="/admin/dashboard" element={<RequireAuth><RequireAdmin><AdminDashboard /></RequireAdmin></RequireAuth>} />
          <Route path="/admin/usage-heatmaps" element={<RequireAuth><RequireAdmin><AdminUsageHeatmaps /></RequireAdmin></RequireAuth>} />
          <Route path="/admin/tracker" element={<RequireAuth><RequireAdmin><AdminTracker /></RequireAdmin></RequireAuth>} />
          <Route path="/admin/reports" element={<RequireAuth><RequireAdmin><AdminReports /></RequireAdmin></RequireAuth>} />
          <Route path="/admin/usermanagement" element={<RequireAuth><RequireAdmin><AdminUserManagement /></RequireAdmin></RequireAuth>} />
          <Route path="/admin/materialmanagement" element={<RequireAuth><RequireAdmin><AdminMaterialManagement /></RequireAdmin></RequireAuth>} />
          <Route path="/admin/booksmanagement" element={<RequireAuth><RequireAdmin><AdminBooksManagement /></RequireAdmin></RequireAuth>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;