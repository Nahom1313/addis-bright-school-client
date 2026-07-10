import api from './client.js';

export const transfersApi = {
  transfer:   (data) => api.post('/transfers', data),
  getHistory: (studentId) => api.get(`/transfers/${studentId}`),
};
