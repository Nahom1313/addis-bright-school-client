import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { analyticsInsightsApi } from '@/api/analyticsInsights.js';

export const useGenerateInsights = () =>
  useMutation({
    mutationFn: (refresh) => analyticsInsightsApi.get(refresh),
    onError: (e) => toast.error(e.response?.data?.message || 'Could not generate insights. Please try again.'),
  });
