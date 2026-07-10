import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { homeworkApi } from '@/api/homework.js';
import { useSocket } from '@/context/SocketContext.jsx';

const QK = {
  mine:       (params) => ['homework', 'mine', params ?? {}],
  section:    (id)     => ['homework', 'section', id],
  children:             ['homework', 'my-children'],
};

// ─── Teacher ──────────────────────────────────────────────────────

export const useMyHomework = (params) =>
  useQuery({
    queryKey: QK.mine(params),
    queryFn:  () => homeworkApi.getMine(params).then(r => r.data.data.homework),
  });

export const useCreateHomework = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => homeworkApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['homework'] });
      toast.success('Homework posted!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to post homework.'),
  });
};

export const useUpdateHomework = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => homeworkApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['homework'] });
      toast.success('Homework updated.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update.'),
  });
};

export const useDeleteHomework = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => homeworkApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['homework'] });
      toast.success('Homework deleted.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete.'),
  });
};

// ─── Student — with live socket updates ──────────────────────────

export const useStudentHomework = (sectionId) => {
  const qc = useQueryClient();
  const { socket } = useSocket();

  const query = useQuery({
    queryKey: QK.section(sectionId),
    queryFn:  () => homeworkApi.getMySection(sectionId).then(r => r.data.data.homework),
    enabled:  !!sectionId,
  });

  useEffect(() => {
    if (!socket || !sectionId) return;
    const handle = () => qc.invalidateQueries({ queryKey: QK.section(sectionId) });
    socket.on('new_homework', handle);
    return () => socket.off('new_homework', handle);
  }, [socket, sectionId, qc]);

  return query;
};

// ─── Parent — with live socket updates ───────────────────────────

export const useParentHomework = () => {
  const qc = useQueryClient();
  const { socket } = useSocket();

  const query = useQuery({
    queryKey: QK.children,
    queryFn:  () => homeworkApi.getMyChildren().then(r => r.data.data.homework),
  });

  useEffect(() => {
    if (!socket) return;
    const handle = () => qc.invalidateQueries({ queryKey: QK.children });
    socket.on('new_homework', handle);
    return () => socket.off('new_homework', handle);
  }, [socket, qc]);

  return query;
};
