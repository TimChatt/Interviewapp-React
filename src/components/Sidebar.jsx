import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css"; // Add CSS for styling the sidebar

const Sidebar = () => {
  const location = useLocation();

  // Check if a link is active
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Interview Analysis</h2>
      </div>
      <ul className="sidebar-menu">
        <li className={`sidebar-item ${isActive("/") ? "active" : ""}`}>
          <Link to="/">Home</Link>
        </li>
        <li className={`sidebar-item ${isActive("/candidate") ? "active" : ""}`}>
          <span>Candidate</span>
          <ul className="sidebar-submenu">
            <li className={isActive("/candidate/search") ? "active" : ""}>
              <Link to="/candidate/search">Search</Link>
            </li>
            <li className={isActive("/candidate/profile") ? "active" : ""}>
              <Link to="/candidate/profile">Profile</Link>
            </li>
          </ul>
        </li>
        <li className={`sidebar-item ${isActive("/insights") ? "active" : ""}`}>
          <span>Insights</span>
          <ul className="sidebar-submenu">
            <li className={isActive("/insights/trends") ? "active" : ""}>
              <Link to="/insights/trends">Trends & Patterns</Link>
            </li>
            <li className={isActive("/insights/ai") ? "active" : ""}>
              <Link to="/insights/ai">AI vs Actual Scores</Link>
            </li>
          </ul>
        </li>
        <li className={`sidebar-item ${isActive("/admin") ? "active" : ""}`}>
          <span>Admin</span>
          <ul className="sidebar-submenu">
            <li className={isActive("/admin/settings") ? "active" : ""}>
              <Link to="/admin/settings">Settings</Link>
            </li>
            <li className={isActive("/admin/security") ? "active" : ""}>
              <Link to="/admin/security">Security</Link>
            </li>
          </ul>
        </li>
        <li className={`sidebar-item ${isActive("/reporting") ? "active" : ""}`}>
          <Link to="/reporting">Reporting</Link>
        </li>
        <li className={`sidebar-item ${isActive("/recommendations") ? "active" : ""}`}>
          <Link to="/recommendations">Recommendations</Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;

