import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { resourcesApi } from '@/api/resources.js';

const QK = {
  all:      (params) => ['resources', 'all', params ?? {}],
  subjects:           ['resources', 'subjects'],
  mine:               ['resources', 'mine'],
};

// ─── Everyone — browse the study library ───────────────────────────

export const useResources = (params) =>
  useQuery({
    queryKey: QK.all(params),
    queryFn:  () => resourcesApi.getAll(params).then(r => r.data.data.resources),
  });

export const useResourceSubjects = () =>
  useQuery({
    queryKey: QK.subjects,
    queryFn:  () => resourcesApi.getSubjects().then(r => r.data.data.subjects),
    staleTime: 5 * 60 * 1000,
  });

export const useTrackDownload = () =>
  useMutation({
    mutationFn: (id) => resourcesApi.trackDownload(id),
    // fire-and-forget — no toast, no cache invalidation needed
  });

// ─── Teacher ────────────────────────────────────────────────────────

export const useMyResources = () =>
  useQuery({
    queryKey: QK.mine,
    queryFn:  () => resourcesApi.getMine().then(r => r.data.data.resources),
  });

export const useCreateResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => resourcesApi.create(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Added to the study library!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to add resource.'),
  });
};

export const useUpdateResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => resourcesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource updated.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update.'),
  });
};

export const useDeleteResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => resourcesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource removed.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to remove.'),
  });
};
