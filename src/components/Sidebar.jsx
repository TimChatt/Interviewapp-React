import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { AuthContext } from "../contexts/AuthContext";

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
        {/* App Logo */}
        <div className="sidebar-logo">My App</div>

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

          {/* Collapsible Admin Section */}
          <li className="collapsible-section">
            <button
              className="collapsible-toggle"
              onClick={() => setIsAdminOpen(!isAdminOpen)}
            >
              Admin
            </button>
            {isAdminOpen && (
              <div className="collapsible-links">
                <Link
                  to="/admin"
                  className={location.pathname === "/admin" ? "active" : ""}
                >
                  Admin Panel
                </Link>
                <Link
                  to="/admin-dashboard"
                  className={
                    location.pathname === "/admin-dashboard" ? "active" : ""
                  }
                >
                  Admin Dashboard
                </Link>
              </div>
            )}
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
