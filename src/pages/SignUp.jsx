// src/pages/SignUp.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css"; // Create this CSS file for styling

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || "Registration failed.");
      } else {
        setMessage(data.message);
        // Optionally, redirect to the login page after a delay:
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred during registration.");
    }
  };

  return (
    <div className="signup-page">
      <h2>Create a New Account</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
