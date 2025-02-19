// src/pages/Admin.jsx
import React from "react";
import { Link } from "react-router-dom";
import '../styles.css';

const Admin = () => {
  return (
    <div className="admin-page">
      <h1>Admin Panel</h1>
      
      {/* Admin Dashboard Navigation */}
      <section className="admin-section">
        <h2>Admin Dashboard</h2>
        <div className="admin-card">
          <h3>Pending User Approvals</h3>
          <p>Review pending user registrations and approve them.</p>
          <Link to="/admin/dashboard">
            <button>View Pending Approvals</button>
          </Link>

        </div>
      </section>
      
      {/* Settings Section */}
      <section className="admin-section">
        <h2>⚙️ Settings</h2>
        <div className="admin-card">
          <h3>Application Settings</h3>
          <p>Configure general application settings such as theme, language, and default options.</p>
          <button onClick={() => alert("Settings updated!")}>Update Settings</button>
        </div>
      </section>

      {/* Security Section */}
      <section className="admin-section">
        <h2>🔒 Security</h2>
        <div className="admin-card">
          <h3>Access Control</h3>
          <p>Manage user roles and permissions to ensure secure access to the application.</p>
          <button onClick={() => alert("Access control updated!")}>Manage Access</button>
        </div>
        <div className="admin-card">
          <h3>Password Policies</h3>
          <p>Define strong password policies to enhance application security.</p>
          <button onClick={() => alert("Password policy updated!")}>Update Policy</button>
        </div>
      </section>
    </div>
  );
};

export default Admin;
