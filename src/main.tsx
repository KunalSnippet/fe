import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Fallback for refresh issues - ensure the app loads on any route
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Add a small delay to ensure the DOM is ready
setTimeout(() => {
  createRoot(rootElement).render(<App />);
}, 0);
