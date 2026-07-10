import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/client';

// Firebase web SDK — loaded dynamically so it doesn't bloat the bundle
const loadFirebase = async () => {
  const { initializeApp, getApps } = await import('firebase/app');
  const { getMessaging, getToken, onMessage } = await import('firebase/messaging');

  const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  return { messaging, getToken, onMessage };
};

export const usePushNotifications = () => {
  const { isAuthenticated, user } = useAuth();
  const [permission, setPermission] = useState(Notification?.permission || 'default');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!import.meta.env.VITE_FIREBASE_API_KEY) return; // Firebase not configured
    if (!('Notification' in window)) return;            // Not supported
    if (permission === 'granted') registerToken();
  }, [isAuthenticated, permission]);

  const registerToken = async () => {
    try {
      const { messaging, getToken } = await loadFirebase();
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      if (token) {
        await api.post('/auth/fcm-token', { token });
        console.log('📱 Push notification token registered');
      }
    } catch (err) {
      setError(err.message);
      console.warn('Push token registration failed:', err.message);
    }
  };

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') await registerToken();
      return result;
    } catch (err) {
      setError(err.message);
      return 'denied';
    }
  };

  return { permission, requestPermission, error };
};
