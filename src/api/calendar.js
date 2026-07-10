import api from './client.js';

export const calendarApi = {
  getAll:  (year) => api.get('/calendar', { params: year ? { year } : {} }),
  create:  (data) => api.post('/calendar', data),
  update:  (id, data) => api.patch(`/calendar/${id}`, data),
  remove:  (id) => api.delete(`/calendar/${id}`),
};
