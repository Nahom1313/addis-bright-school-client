import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { logsApi } from '@/api/logs';
import { useSocket } from '@/context/SocketContext';

const QK = {
  feed:       ['logs', 'feed'],
  mine:       ['logs', 'mine'],
  student:    (id) => ['logs', 'student', id],
  section:    (id) => ['logs', 'section', id],
};

// ─── Teacher hooks ────────────────────────────────────────────────

export const useMyLogs = () =>
  useQuery({
    queryKey: QK.mine,
    queryFn:  () => logsApi.getMine().then(r => r.data.data.logs),
  });

export const useStudentLogs = (studentId) =>
  useQuery({
    queryKey: QK.student(studentId),
    queryFn:  () => logsApi.getByStudent(studentId).then(r => r.data.data.logs),
    enabled:  !!studentId,
  });

export const useSectionLogs = (sectionId) =>
  useQuery({
    queryKey: QK.section(sectionId),
    queryFn:  () => logsApi.getBySection(sectionId).then(r => r.data.data.logs),
    enabled:  !!sectionId,
  });

export const useCreateLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => logsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.mine });
      toast.success('Log submitted — AI enrichment in progress ✨');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create log.'),
  });
};

export const useDeleteLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => logsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logs'] });
      toast.success('Log deleted.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

// ─── Parent feed hook — with real-time socket updates ─────────────

export const useParentFeed = () => {
  const qc = useQueryClient();
  const { socket } = useSocket();

  const query = useQuery({
    queryKey: QK.feed,
    queryFn:  () => logsApi.getFeed().then(r => r.data.data.logs),
  });

  useEffect(() => {
    if (!socket) return;

    // New unenriched log arrives → prepend to feed
    const onNewLog = ({ log }) => {
      qc.setQueryData(QK.feed, (old = []) => {
        const withoutDup = old.filter(l => l._id !== log._id);
        return [log, ...withoutDup];
      });
    };

    // AI-enriched version of an existing log arrives → replace in place
    const onLogEnriched = ({ log }) => {
      qc.setQueryData(QK.feed, (old = []) =>
        old.map(l => (l._id === log._id ? log : l))
      );
    };

    socket.on('new_status_log', onNewLog);
    socket.on('log_enriched',   onLogEnriched);

    return () => {
      socket.off('new_status_log', onNewLog);
      socket.off('log_enriched',   onLogEnriched);
    };
  }, [socket, qc]);

  return query;
};
