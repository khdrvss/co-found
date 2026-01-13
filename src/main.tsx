import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Debug: Check if script is running
console.log("🚀 Co-found.uz main.tsx loaded");
console.log("🌍 Environment:", import.meta.env.MODE);
console.log("🔗 API URL:", import.meta.env.VITE_API_URL);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
console.log("🔑 Google Client ID:", GOOGLE_CLIENT_ID ? `✅ Loaded (${GOOGLE_CLIENT_ID.substring(0, 20)}...)` : "❌ Missing");

if (!GOOGLE_CLIENT_ID) {
  console.error("❌ VITE_GOOGLE_CLIENT_ID is not set in environment variables!");
  console.error("Available env vars:", import.meta.env);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("❌ Root element not found!");
  document.body.innerHTML = '<div style="color: white; padding: 20px;">ERROR: Root element not found</div>';
} else {
  console.log("✅ Root element found, mounting React app...");
  
  try {
    createRoot(rootElement).render(
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <HelmetProvider>
                <App />
            </HelmetProvider>
        </GoogleOAuthProvider>
    );
    console.log("✅ React app mounted successfully");
  } catch (error) {
    console.error("❌ Error mounting React app:", error);
    rootElement.innerHTML = '<div style="color: white; padding: 20px; background: #f00;">ERROR: ' + error + '</div>';
  }
}

