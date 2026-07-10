import api from './client.js';

export const notificationsApi = {
  getAll:      ()   => api.get('/notifications'),
  markRead:    (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: ()   => api.patch('/notifications/read-all'),
  remove:      (id) => api.delete(`/notifications/${id}`),
};
