import React from "react";
<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/admin/SignIn";
import SignUp from "./pages/admin/SignUp";
import "./styles/Auth.css";
import Dashboard from "./pages/admin/Dashboard";
import UsageHeatmaps from "./pages/admin/UsageHeatmaps";
import Tracker from "./pages/admin/Tracker";
import Reports from "./pages/admin/Reports";
import UserManagement from "./pages/admin/UserManagement";
import MaterialManagement from "./pages/admin/MaterialManagement";
import BooksManagement from "./pages/admin/BooksManagement";
=======
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import "./styles/Auth.css";
import Dashboard from "./pages/Dashboard";
import UsageHeatmaps from "./pages/UsageHeatmaps";
import Tracker from "./pages/Tracker";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import MaterialManagement from "./pages/MaterialManagement";
import BooksManagement from "./pages/BooksManagement";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function RequireAuth({ children }) {
  try {
    const t = localStorage.getItem('lr_token');
    if (!t) return <Navigate to="/signin" replace />;
  } catch {}
  return children;
}

function RequireAdmin({ children }) {
  try {
    const raw = localStorage.getItem('lr_user');
    const u = raw ? JSON.parse(raw) : null;
    if (!u || u.role !== 'admin') return <Navigate to="/dashboard" replace />;
  } catch {}
  return children;
}
>>>>>>> e9595b6ac88f7a77fe4bfd0ad26048319c9e3035

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
    
          <Route path="/" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/usage-heatmaps" element={<RequireAuth><UsageHeatmaps /></RequireAuth>} />
          <Route path="/tracker" element={<RequireAuth><Tracker /></RequireAuth>} />
          <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
          <Route path="/usermanagement" element={<RequireAuth><RequireAdmin><UserManagement /></RequireAdmin></RequireAuth>} />
          <Route path="/materialmanagement" element={<RequireAuth><RequireAdmin><MaterialManagement /></RequireAdmin></RequireAuth>} />
          <Route path="/booksmanagement" element={<RequireAuth><RequireAdmin><BooksManagement /></RequireAdmin></RequireAuth>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
