import api from './client.js';

export const parentSummaryApi = {
  get: (studentId, lang = 'en') => api.get(`/parent-summary/${studentId}`, { params: { lang } }),
};
