import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChakraProvider, Box } from "@chakra-ui/react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Candidate from "./pages/Candidate";
import Insights from "./pages/Insights";
import Recommendations from "./pages/Recommendations";
import Admin from "./pages/Admin";
import CompetencyFramework from "./pages/CompetencyFramework";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp"; // Restored SignUp Page
import Dashboard from "./pages/Dashboard"; // Restored Dashboard Page
import Profile from "./pages/Profile"; // Restored Profile Page
import Settings from "./pages/Settings"; // Restored Settings Page
import NotFound from "./pages/NotFound"; // Restored 404 Page
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Sidebar />
          <Box as="main" flex="1" p={4}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/candidates" element={<Candidate />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/competency-framework-planner" element={<CompetencyFramework />} />
              <Route path="/login" element={<Login />} />
              <Route path="/sign-up" element={<SignUp />} /> {/* Restored Sign Up */}
              <Route path="/dashboard" element={<Dashboard />} /> {/* Restored Dashboard */}
              <Route path="/profile" element={<Profile />} /> {/* Restored Profile Page */}
              <Route path="/settings" element={<Settings />} /> {/* Restored Settings Page */}
              <Route path="*" element={<NotFound />} /> {/* Restored 404 Page */}
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App;
