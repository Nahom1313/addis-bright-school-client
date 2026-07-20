import api from './client.js';

export const studyHelperApi = {
  getSubjects: () => api.get('/study-helper/subjects'),
  chat: (data)  => api.post('/study-helper/chat', data),
};
