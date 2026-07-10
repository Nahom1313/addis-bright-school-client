import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { transfersApi } from '@/api/transfers.js';

export const useTransferHistory = (studentId) =>
  useQuery({
    queryKey: ['transfers', studentId],
    queryFn:  () => transfersApi.getHistory(studentId).then(r => r.data.data.transfers),
    enabled:  !!studentId,
  });

export const useTransferStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => transfersApi.transfer(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reg-students'] });
      qc.invalidateQueries({ queryKey: ['transfers'] });
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Student transferred successfully.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Transfer failed.'),
  });
};
