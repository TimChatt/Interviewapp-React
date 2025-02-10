// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // user object: { username, token, ... }
  const [loading, setLoading] = useState(true);

  // On mount, try to load user from localStorage (for demonstration)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function that calls the backend API
  const login = async (username, password) => {
    try {
      // Adjust the URL (e.g., to your production endpoint) as needed.
const response = await fetch('https://interviewappbe-production.up.railway.app/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ username, password })
});
      
      if (!response.ok) {
        // You can further check for specific status codes here (like 401 or 403)
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      // Expecting data to include at least { username, token, ... }
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

