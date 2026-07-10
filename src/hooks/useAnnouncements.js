import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { announcementsApi } from '@/api/announcements.js';
import { useSocket } from '@/context/SocketContext.jsx';

const QK = ['announcements'];

export const useAnnouncements = () => {
  const qc = useQueryClient();
  const { socket } = useSocket();

  const query = useQuery({
    queryKey: QK,
    queryFn:  () => announcementsApi.getMine().then(r => r.data.data.announcements),
    staleTime: 60_000,
  });

  // Live update when a new announcement notification arrives
  useEffect(() => {
    if (!socket) return;
    const handle = (notif) => {
      if (notif.type === 'announcement') {
        qc.invalidateQueries({ queryKey: QK });
      }
    };
    socket.on('notification', handle);
    return () => socket.off('notification', handle);
  }, [socket, qc]);

  return query;
};

export const useAllAnnouncements = () =>
  useQuery({
    queryKey: ['announcements', 'all'],
    queryFn:  () => announcementsApi.getAll().then(r => r.data.data.announcements),
  });

export const useCreateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => announcementsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement posted!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to post.'),
  });
};

export const useRemoveAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => announcementsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement removed.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};
