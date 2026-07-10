import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { calendarApi } from '@/api/calendar.js';

const QK = (year) => ['calendar', year ?? 'all'];

export const useCalendar = (year) =>
  useQuery({
    queryKey: QK(year),
    queryFn:  () => calendarApi.getAll(year).then(r => r.data.data.entries),
    staleTime: 5 * 60_000,
  });

export const useCreateEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => calendarApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['calendar'] }); toast.success('Entry added.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to add entry.'),
  });
};

export const useUpdateEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => calendarApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['calendar'] }); toast.success('Entry updated.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update.'),
  });
};

export const useDeleteEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => calendarApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['calendar'] }); toast.success('Entry deleted.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete.'),
  });
};
