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
import Signup from "./pages/Signup";
import Logout from "./pages/Logout"; // ✅ Ensure Logout is imported

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/candidate/search" element={<Candidate />} />
            <Route path="/candidate/profile" element={<CandidateProfile />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/competency-framework-planner" element={<CompetencyFrameworkPlanner />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/logout" element={<Logout />} />  {/* ✅ Ensure Logout route is present */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
