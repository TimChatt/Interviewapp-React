import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Candidate from "./pages/Candidate";
import CandidateProfile from "./pages/CandidateProfile";
import Insights from "./pages/Insights";
import Recommendations from "./pages/Recommendations";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import CompetencyFrameworkPlanner from "./pages/CompetencyFrameworkPlanner";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar navigation */}
        <Sidebar />

        {/* Main content area */}
        <div className="main-content">
          <Routes>
            {/* Home page */}
            <Route path="/" element={<Home />} />

            {/* Candidate routes */}
            <Route path="/candidate/search" element={<Candidate />} />
            <Route path="/candidate/profile" element={<CandidateProfile />} />

            {/* Insights and recommendations */}
            <Route path="/insights" element={<Insights />} />
            <Route path="/recommendations" element={<Recommendations />} />

            {/* Admin routes */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Competency Framework Planner */}
            <Route
              path="/competency-framework-planner"
              element={<CompetencyFrameworkPlanner />}
            />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

