import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Check if running inside Capacitor (native app)
export const isNative = () => typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();

export const useCapacitor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNative()) return;

    const setup = async () => {
      try {
        // Status bar
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#3d1f0a' });

        // Hide splash screen after app loads
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();

        // Handle notification tap — navigate to right page
        const { PushNotifications } = await import('@capacitor/push-notifications');

        await PushNotifications.addListener('registration', (token) => {
          // Register FCM token with our server
          import('@/api/client').then(({ default: api }) => {
            api.post('/auth/fcm-token', { token: token.value }).catch(() => {});
          });
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          const data = action.notification.data || {};
          if (data.type === 'status_log') navigate('/parent');
          if (data.type === 'message')    navigate('/parent/messages');
        });

        await PushNotifications.requestPermissions().then(result => {
          if (result.receive === 'granted') {
            PushNotifications.register();
          }
        });

        // Handle Android back button
        const { App } = await import('@capacitor/app');
        App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) window.history.back();
          else App.exitApp();
        });

      } catch (err) {
        console.warn('Capacitor setup error:', err.message);
      }
    };

    setup();
  }, []);
};
