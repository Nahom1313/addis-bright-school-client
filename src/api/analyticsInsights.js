import api from './client.js';

export const analyticsInsightsApi = {
  get: (refresh = false) => api.get('/analytics/insights', { params: refresh ? { refresh: 'true' } : {} }),
};
