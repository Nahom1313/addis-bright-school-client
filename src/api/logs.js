import api from './client.js';

export const logsApi = {
  // Teacher
  create:       (data)       => api.post('/logs', data),
  getMine:      ()            => api.get('/logs/my'),
  getByStudent: (id, params) => api.get(`/logs/student/${id}`, { params }),
  getBySection: (id)         => api.get(`/logs/section/${id}`),
  delete:       (id)         => api.delete(`/logs/${id}`),

  // Parent
  getFeed: () => api.get('/logs/feed'),

  // Translation
  translate: (summary, suggestedAction) =>
    api.post('/logs/translate', { summary, suggestedAction }),
};
