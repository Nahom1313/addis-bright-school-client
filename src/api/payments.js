import api from './client.js';

export const paymentsApi = {
  // Parent: submit a new payment receipt (multipart — includes the screenshot file)
  submit: (formData) =>
    api.post('/payments', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Parent: their own submission history
  getMine: () => api.get('/payments/mine'),

  // Parent: withdraw a still-pending submission
  remove: (id) => api.delete(`/payments/${id}`),

  // Registrar/director: full list, optional status filter ('pending' | 'approved' | 'rejected' | 'all')
  getAll: (status) => api.get('/payments', { params: status && status !== 'all' ? { status } : {} }),

  // Registrar/director: approve or reject
  review: (id, data) => api.patch(`/payments/${id}/review`, data),
};
