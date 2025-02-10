// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext"; // Assuming you have admin token in context
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext); // Admin user should be logged in
  const navigate = useNavigate();

  // Fetch pending users from backend
  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await fetch("https://interviewappbe-production.up.railway.app/api/users/pending", {
          headers: {
            "Content-Type": "application/json",
            // Include the admin JWT token in the Authorization header:
            "Authorization": `Bearer ${user?.token}`
          }
        });
        if (!response.ok) {
          console.error("Failed to fetch pending users");
          return;
        }
        const data = await response.json();
        setPendingUsers(data);
      } catch (error) {
        console.error("Error fetching pending users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPendingUsers();
    }
  }, [user]);

  // Approve a user by username
  const handleApprove = async (username) => {
    try {
      const response = await fetch(`https://interviewappbe-production.up.railway.app/api/users/${username}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        }
      });
      if (!response.ok) {
        console.error("Failed to approve user");
        return;
      }
      // Remove the approved user from the pending list
      setPendingUsers((prev) => prev.filter((u) => u.username !== username));
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  if (loading) {
    return <div>Loading pending users...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard - Pending User Approvals</h1>
      {pendingUsers.length === 0 ? (
        <p>No pending users.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((pendingUser) => (
              <tr key={pendingUser.username}>
                <td>{pendingUser.username}</td>
                <td>{pendingUser.email}</td>
                <td>
                  <button onClick={() => handleApprove(pendingUser.username)}>
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button className="back-button" onClick={() => navigate("/admin")}>
        Back to Admin Home
      </button>
    </div>
  );
};

export default AdminDashboard;
