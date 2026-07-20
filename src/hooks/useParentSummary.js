import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { parentSummaryApi } from '@/api/parentSummary.js';

export const useGenerateParentSummary = () =>
  useMutation({
    mutationFn: ({ studentId, lang }) => parentSummaryApi.get(studentId, lang),
    onError: (e) => toast.error(e.response?.data?.message || 'Could not generate summary. Please try again.'),
  });
