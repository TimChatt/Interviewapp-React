import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Candidates from "./pages/Candidates";
import Insights from "./pages/Insights";
import Recommendations from "./pages/Recommendations";
import Admin from "./pages/Admin";
import CompetencyFramework from "./pages/CompetencyFramework";
import Login from "./pages/Login";
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
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/competency-framework-planner" element={<CompetencyFramework />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App;
