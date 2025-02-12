import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Candidate from "./pages/Candidate";
import CandidateProfile from "./pages/CandidateProfile";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import CompetencyFrameworkPlanner from "./pages/CompetencyFrameworkPlanner";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<Home />} />
            <Route path="/candidates" element={<Candidate />} />
            <Route path="/candidate/:candidateId" element={<CandidateProfile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route
              path="/admin/competency-framework"
              element={<CompetencyFrameworkPlanner />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
