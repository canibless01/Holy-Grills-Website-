import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// --- Service Worker registration (PWA) ---
// Caches the app shell + runtime assets, enables offline fallback, and
// auto-applies updates (new SW → reload). See public/service-worker.js.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          // New content installed and a controller exists → activate it.
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage('SKIP_WAITING');
          }
        });
      });
    }).catch((err) => {
      // SW registration failure is non-fatal — app still works online.
      if (typeof console !== 'undefined') console.warn('[SW] registration failed:', err);
    });
  });

  // Reload when the new service worker takes over.
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}