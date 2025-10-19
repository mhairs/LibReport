import React from "react";
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

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
    
          <Route path="/" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/usage-heatmaps" element={<UsageHeatmaps />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/usermanagement" element={<UserManagement />} />
          <Route path="/materialmanagement" element={<MaterialManagement />} />
          <Route path="/booksmanagement" element={<BooksManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
