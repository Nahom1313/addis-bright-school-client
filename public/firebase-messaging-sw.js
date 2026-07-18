// Firebase Cloud Messaging Service Worker
// This runs in the background to receive push notifications when the app is closed
//
// NOTE: these values are hardcoded (not read from import.meta.env) because
// service workers are static files served as-is — Vite's environment
// variable substitution only applies to the actual JS bundle, not files in
// public/. Firebase's web config values are public/non-secret by design
// (Google's own docs confirm this), so hardcoding them here is safe.

importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyBbc_XjJsqElacPzuMXPgCgY3rGT8dnKH8',
  authDomain:        'addis-bright-school.firebaseapp.com',
  projectId:         'addis-bright-school',
  storageBucket:     'addis-bright-school.firebasestorage.app',
  messagingSenderId: '845080632417',
  appId:             '1:845080632417:web:e9164ae98d0b82ef3e9e20',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const data = payload.data || {};

  self.registration.showNotification(title || 'Addis Bright', {
    body:    body || 'You have a new notification',
    icon:    '/icon-192.png',
    badge:   '/badge-72.png',
    tag:     data.type || 'general',
    data:    data,
    actions: [{ action: 'open', title: 'Open' }],
  });
});

// Click handler — open the app when notification is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  let url = '/';

  if (data.type === 'status_log') url = '/parent';
  if (data.type === 'message')    url = '/parent/messages';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NAVIGATE', url });
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
