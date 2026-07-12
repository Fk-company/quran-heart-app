import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { playAdhan } from "./hooks/useNotificationSettings";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);

// Register service worker for offline + background notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      // Ask the SW to re-schedule any persisted reminders on every fresh load.
      const sw = reg.active || reg.waiting || reg.installing;
      sw?.postMessage({ type: 'RESCHEDULE' });
    }).catch(() => { /* fail silently */ });

    // If the SW notification was clicked and app opened with ?adhan=1, play adhan.
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('adhan') === '1') {
        setTimeout(() => playAdhan(), 400);
        params.delete('adhan');
        const q = params.toString();
        window.history.replaceState({}, '', window.location.pathname + (q ? `?${q}` : ''));
      }
    } catch {}

    // Also react to clicks that happened while the tab was already open.
    navigator.serviceWorker.addEventListener('message', (event) => {
      const msg = event.data || {};
      if (msg.type === 'NOTIFICATION_CLICK' && msg.data && msg.data.adhan) {
        playAdhan();
      }
    });
  });
}
