import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import "./styles/Auth.css";
import Dashboard from "./pages/Dashboard";
import UsageHeatmaps from "./pages/UsageHeatmaps";
import Tracker from "./pages/Tracker";
import Reports from "./pages/Reports";


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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
