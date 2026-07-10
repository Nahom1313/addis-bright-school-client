import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { notificationsApi } from '@/api/notifications.js';
import { useSocket } from '@/context/SocketContext.jsx';

const QK = ['notifications'];

export const useNotifications = () => {
  const qc = useQueryClient();
  const { socket } = useSocket();

  const query = useQuery({
    queryKey: QK,
    queryFn:  () => notificationsApi.getAll().then(r => r.data.data),
    staleTime: 30_000,
  });

  // Live: prepend new notification when it arrives over socket
  useEffect(() => {
    if (!socket) return;
    const handle = (notif) => {
      qc.setQueryData(QK, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: [notif, ...prev.notifications].slice(0, 40),
          unreadCount: (prev.unreadCount || 0) + 1,
        };
      });
    };
    socket.on('notification', handle);
    return () => socket.off('notification', handle);
  }, [socket, qc]);

  return query;
};

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: (_, id) => {
      qc.setQueryData(QK, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map(n => n._id === id ? { ...n, read: true } : n),
          unreadCount: Math.max(0, (prev.unreadCount || 1) - 1),
        };
      });
    },
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.setQueryData(QK, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        };
      });
    },
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationsApi.remove(id),
    onSuccess: (_, id) => {
      qc.setQueryData(QK, (prev) => {
        if (!prev) return prev;
        const removed = prev.notifications.find(n => n._id === id);
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n._id !== id),
          unreadCount: removed && !removed.read ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
        };
      });
    },
  });
};
