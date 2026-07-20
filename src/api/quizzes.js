import api from './client.js';

export const quizzesApi = {
  // Everyone (any role) — browse
  getAll:      (params)   => api.get('/quizzes', { params }),
  getSubjects: ()         => api.get('/quizzes/subjects'),
  getOne:      (id)       => api.get(`/quizzes/${id}`),

  // Teacher
  getMine:     ()         => api.get('/quizzes/mine'),
  generate:    (data)     => api.post('/quizzes/generate', data),
  create:      (data)     => api.post('/quizzes', data),
  update:      (id, data) => api.patch(`/quizzes/${id}`, data),
  remove:      (id)       => api.delete(`/quizzes/${id}`),
  getResults:  (id)       => api.get(`/quizzes/${id}/attempts`),

  // Student
  getMyAttempts: (id)     => api.get(`/quizzes/${id}/attempts/mine`),
  submit:        (id, data) => api.post(`/quizzes/${id}/attempts`, data),
};
