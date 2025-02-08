import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css"; // Global styles
import Home from "./pages/Home";
import Candidate from "./pages/Candidate";
import Insights from "./pages/Insights";
import Recommendations from "./pages/Recommendations";
import Admin from "./pages/Admin";
import NavigationBar from "./components/NavigationBar";

const App = () => {
  return (
    <Router>
      <NavigationBar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/candidate" element={<Candidate />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

