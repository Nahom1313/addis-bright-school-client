import api from './client.js';

export const homeworkApi = {
  // Teacher / Director
  getMine:           (params)     => api.get('/homework', { params }),
  getBySection:      (sectionId)  => api.get(`/homework/section/${sectionId}`),
  create:            (data)       => api.post('/homework', data),
  update:            (id, data)   => api.patch(`/homework/${id}`, data),
  remove:            (id)         => api.delete(`/homework/${id}`),

  // Student
  getMySection:      (sectionId)  => api.get(`/homework/section/${sectionId}`),

  // Parent
  getMyChildren:     ()           => api.get('/homework/my-children'),
};
