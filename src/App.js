import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ChakraProvider, Box, Container } from "@chakra-ui/react"; // Chakra UI
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Candidate from "./pages/Candidate";
import CandidateProfile from "./pages/CandidateProfile";
import Insights from "./pages/Insights";
import Recommendations from "./pages/Recommendations";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import CompetencyFrameworkPlanner from "./pages/CompetencyFrameworkPlanner";
import CompetencyDashboard from "./pages/CompetencyDashboard";
import SavedFrameworks from "./pages/SavedFrameworks";
import EditFramework from "./pages/EditFramework";
import DepartmentFrameworks from "./pages/DepartmentFrameworks";
import JobDescriptionPage from "./pages/JobDescriptionPage";
import JobTitleDetails from "./pages/JobTitleDetails";
import InterviewerDashboard from "./pages/InterviewerDashboard"; 
import DepartmentFrameworkPage from "./pages/DepartmentFrameworkPage";
import PrivateRoute from "./components/PrivateRoute"; // Private Routes

// Handles Sidebar Visibility Based on Route
const AppContent = () => {
  const location = useLocation();
  const hideSidebarPaths = ["/login", "/signup"];
  const shouldHideSidebar = hideSidebarPaths.includes(location.pathname);

  return (
    <Box display="flex" minH="100vh">
      {/* Sidebar (Hidden on Login/Signup) */}
      {!shouldHideSidebar && <Sidebar />}

      {/* Main Content */}
      <Container
        maxW="container.xl"
        flex="1"
        p={shouldHideSidebar ? "0" : "4"}
        bg="gray.50"
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/candidates" element={<Candidate />} />
            <Route path="/candidate/:candidateId" element={<CandidateProfile />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/competency-framework-planner" element={<CompetencyFrameworkPlanner />} />
            <Route path="/competency-dashboard" element={<CompetencyDashboard />} />
            <Route path="/frameworks" element={<SavedFrameworks />} />
            <Route path="/frameworks/:department" element={<DepartmentFrameworks />} />
            <Route path="/job-description/:department/:jobTitle" element={<JobDescriptionPage />} />
            <Route path="/frameworks/:department/:jobTitle/:jobLevel" element={<JobTitleDetails />} />
            <Route path="/framework-overview/:department" element={<DepartmentFrameworkPage />} /> 
            <Route path="/edit-framework/:id" element={<EditFramework />} />
            <Route path="/interviewer/:jobTitle" element={<InterviewerDashboard />} /> 
          </Route>
        </Routes>
      </Container>
    </Box>
  );
};

// Main App Component
const App = () => (
  <AuthProvider>
    <ChakraProvider>
      <Router>
        <AppContent />
      </Router>
    </ChakraProvider>
  </AuthProvider>
);

export default App;
