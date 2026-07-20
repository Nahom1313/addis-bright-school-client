import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { studyHelperApi } from '@/api/studyHelper.js';

export const useStudyHelperSubjects = () =>
  useQuery({
    queryKey: ['study-helper', 'subjects'],
    queryFn:  () => studyHelperApi.getSubjects().then(r => r.data.data.subjects),
    staleTime: 5 * 60 * 1000,
  });

export const useStudyHelperChat = () =>
  useMutation({
    mutationFn: (data) => studyHelperApi.chat(data),
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to get a reply. Please try again.'),
  });
