import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { paymentsApi } from '@/api/payments';

export const QK_PAYMENTS = {
  mine: ['payments', 'mine'],
  all:  (status) => ['payments', 'all', status ?? 'pending'],
};

// ─── Parent ───────────────────────────────────────────────────────
export const useMyPayments = () =>
  useQuery({
    queryKey: QK_PAYMENTS.mine,
    queryFn: () => paymentsApi.getMine().then(r => r.data.data.payments),
  });

export const useSubmitPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => paymentsApi.submit(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_PAYMENTS.mine });
      toast.success('Receipt submitted. The registrar will review it shortly.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Could not submit receipt.'),
  });
};

export const useDeletePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => paymentsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_PAYMENTS.mine });
      toast.success('Submission removed.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Could not remove submission.'),
  });
};

// ─── Registrar / Director ──────────────────────────────────────────
export const useAllPayments = (status) =>
  useQuery({
    queryKey: QK_PAYMENTS.all(status),
    queryFn: () => paymentsApi.getAll(status).then(r => r.data.data.payments),
  });

export const useReviewPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => paymentsApi.review(id, data),
    onSuccess: (_res, variables) => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast.success(variables.status === 'approved' ? 'Receipt approved.' : 'Receipt rejected.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Could not submit review.'),
  });
};
