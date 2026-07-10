import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { sectionReportsApi } from '@/api/sectionReports.js';

// ─── Class leader hooks ───────────────────────────────────────────
export const useMySection = () =>
  useQuery({
    queryKey: ['section-reports', 'my-section'],
    queryFn:  () => sectionReportsApi.getMySection().then(r => r.data.data),
    retry: false, // 403 if not a class leader — don't retry
  });

export const useMyReports = () =>
  useQuery({
    queryKey: ['section-reports', 'my-reports'],
    queryFn:  () => sectionReportsApi.getMyReports().then(r => r.data.data.reports),
  });

export const useSubmitReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => sectionReportsApi.submit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['section-reports'] });
      toast.success('Report submitted to registrar!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to submit report.'),
  });
};

// ─── Registrar hooks ──────────────────────────────────────────────
export const useAllReports = (status) =>
  useQuery({
    queryKey: ['section-reports', 'all', status],
    queryFn:  () => sectionReportsApi.getAll(status).then(r => r.data.data.reports),
  });

export const useReportById = (id) =>
  useQuery({
    queryKey: ['section-reports', id],
    queryFn:  () => sectionReportsApi.getById(id).then(r => r.data.data.report),
    enabled:  !!id,
  });

export const useReviewReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, feedback }) => sectionReportsApi.review(id, { status, feedback }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['section-reports'] });
      toast.success(`Report ${vars.status}.`);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

export const useAssignLeader = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => sectionReportsApi.assignLeader(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Class leader assigned.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to assign leader.'),
  });
};
