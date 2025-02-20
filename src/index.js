import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Import your App component
import { ChakraProvider } from "@chakra-ui/react"; // Chakra UI Provider

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
