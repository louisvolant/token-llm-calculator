"use client";

import { useEffect } from "react";

/**
 * Registers the PWA service worker in production and refreshes the page
 * automatically when an updated service worker takes control.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      // Only reload when an *update* takes control. On the very first visit the
      // page is not controlled yet, and reloading there aborts the in-flight
      // navigation (which Cloudflare reports as "Client Disconnected").
      const hadController = Boolean(navigator.serviceWorker.controller);
      let refreshing = false;

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (hadController && !refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("Service worker registration failed:", err);
      });
    }
  }, []);

  return null;
}
