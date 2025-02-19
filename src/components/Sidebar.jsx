import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import '../styles.css';
import { AuthContext } from "../contexts/AuthContext";
import { FaEye } from "react-icons/fa"; // Futuristic icon

const Sidebar = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-container">
        {/* Logo */}
        <div className="sidebar-logo">
          <FaEye className="logo-icon" />
          <span className="futuristic-text">TA Vision</span>
        </div>

        {/* Navigation Links */}
        <ul className="sidebar-links">
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/candidates"
              className={location.pathname === "/candidates" ? "active" : ""}
            >
              Candidates
            </Link>
          </li>
          <li>
            <Link
              to="/insights"
              className={location.pathname === "/insights" ? "active" : ""}
            >
              Insights
            </Link>
          </li>
          <li>
            <Link
              to="/recommendations"
              className={
                location.pathname === "/recommendations" ? "active" : ""
              }
            >
              Recommendations
            </Link>
          </li>

          {/* Admin Section (Collapsible) */}
          <li className="collapsible-section">
            <button
              className={`collapsible-toggle ${isAdminOpen ? "active" : ""}`}
              onClick={() => setIsAdminOpen(!isAdminOpen)}
            >
              Admin
            </button>
            <div className={`collapsible-links ${isAdminOpen ? "open" : ""}`}>
              <Link
                to="/admin"
                className={location.pathname === "/admin" ? "active" : ""}
              >
                Admin Panel
              </Link>
            </div>
          </li>

          <li>
            <Link
              to="/competency-framework-planner"
              className={
                location.pathname === "/competency-framework-planner"
                  ? "active"
                  : ""
              }
            >
              Competency Framework
            </Link>
          </li>
        </ul>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
