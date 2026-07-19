import api from './client.js';

export const resourcesApi = {
  // Everyone (all roles) — browse the library
  getAll:      (params)   => api.get('/resources', { params }),
  getSubjects: ()         => api.get('/resources/subjects'),
  trackDownload: (id)     => api.post(`/resources/${id}/download`),

  // Teacher
  getMine:     ()         => api.get('/resources/mine'),
  create:      (formData) => api.post('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:      (id, data) => api.patch(`/resources/${id}`, data),
  remove:      (id)       => api.delete(`/resources/${id}`),
};
