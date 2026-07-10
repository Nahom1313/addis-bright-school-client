import api from './client.js';

export const announcementsApi = {
  getMine: () => api.get('/announcements'),
  getAll:  () => api.get('/announcements/all'),
  create:  (data) => api.post('/announcements', data),
  remove:  (id) => api.patch(`/announcements/${id}/deactivate`),
};
