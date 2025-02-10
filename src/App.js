// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import NavigationBar from './components/NavigationBar';
import Home from './pages/Home';
import Candidate from './pages/Candidate';
import CandidateProfile from './pages/CandidateProfile';
import Insights from './pages/Insights';
import Recommendations from './pages/Recommendations';
import Admin from './pages/Admin';
import Login from './pages/Login';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <NavigationBar />
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/candidates" element={<Candidate />} />
            <Route path="/candidate/:candidateId" element={<CandidateProfile />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
