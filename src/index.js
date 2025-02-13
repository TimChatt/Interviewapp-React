import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Import your App component
import "./index.css"; // Import your existing global styles (if any)
import "./styles.css"; // Import the modern SaaS styles for global usage

const root = ReactDOM.createRoot(document.getElementById("root")); // Assumes a root div exists in your HTML
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
