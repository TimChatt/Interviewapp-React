import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Import your App component
import "./index.css"; // Import your global styles (if any)

const root = ReactDOM.createRoot(document.getElementById("root")); // Assumes a root div exists in your HTML
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
