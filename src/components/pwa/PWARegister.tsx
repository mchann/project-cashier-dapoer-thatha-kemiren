// src/components/pwa/PWARegister.tsx
'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Di development / localhost, unregister Service Worker agar Turbopack HMR tidak error / stale cache
    const isDev = process.env.NODE_ENV === 'development' || 
                  window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';

    if (isDev) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key));
        });
      }
      return;
    }

    // Hanya di production (Vercel / domain live), daftarkan Service Worker untuk offline mode
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('PWA Service Worker registered:', registration.scope);
        })
        .catch((err) => {
          console.warn('PWA Service Worker registration failed:', err);
        });
    });
  }, []);

  return null;
}
