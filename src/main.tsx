import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import App from "./App.tsx";
import "./index.css";
import { initWebVitals } from "./lib/web-vitals.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Initialize Core Web Vitals monitoring (non-blocking)
initWebVitals();

// Register service worker for PWA (handled by vite-plugin-pwa)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/sw.js",
        { scope: "/" }
      );

      // Check for updates periodically (every 60 minutes)
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

      // Handle SW update available
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "activated" &&
              navigator.serviceWorker.controller
            ) {
              // New SW activated, notify user to refresh
              console.log(
                "[SW] New version available. Refresh to update."
              );
            }
          });
        }
      });

      console.log("[SW] Service worker registered successfully");
    } catch (error) {
      console.error("[SW] Service worker registration failed:", error);
    }
  });
}
