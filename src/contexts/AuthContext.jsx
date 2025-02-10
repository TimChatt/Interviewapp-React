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

  // Dummy login function (replace with real API call)
  const login = async (username, password) => {
    // For demonstration, we assume a single valid username/password:
    if (username === 'admin' && password === 'password') {
      // In a real scenario, your API would return a token and user details
      const userData = { username, token: 'dummy-jwt-token' };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return true;
    } else {
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
