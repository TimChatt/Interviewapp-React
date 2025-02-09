import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BerryProvider } from "react-berry-ui"; // Import the BerryProvider
import NavigationBar from "./components/NavigationBar";
import Home from "./pages/Home";
import Candidate from "./pages/Candidate";  // The Candidate Table/List page
import CandidateProfile from "./pages/CandidateProfile"; // Single candidate detail
import Insights from "./pages/Insights";
import Recommendations from "./pages/Recommendations";
import Admin from "./pages/Admin";

const App = () => {
  return (
    <BerryProvider>
      <Router>
        <NavigationBar />
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />

          {/* List/Table of Candidates */}
          <Route path="/candidates" element={<Candidate />} />

          {/* Single Candidate Detail (parameterized route) */}
          <Route path="/candidate/:candidateId" element={<CandidateProfile />} />

          {/* Additional Pages */}
          <Route path="/insights" element={<Insights />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </BerryProvider>
  );
};

export default App;
