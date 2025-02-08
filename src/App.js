import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Candidate from "./pages/Candidate";
import Insights from "./pages/Insights";
import Recommendations from "./pages/Recommendations";
import Admin from "./pages/Admin";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/candidate" element={<Candidate />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};

export default App;
