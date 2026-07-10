import api from './client.js';

export const sectionReportsApi = {
  // Class leader
  getMySection:  ()           => api.get('/section-reports/my-section'),
  getMyReports:  ()           => api.get('/section-reports/my-reports'),
  submit:        (data)       => api.post('/section-reports/submit', data),

  // Registrar / Director
  getAll:        (status)     => api.get('/section-reports', { params: status ? { status } : {} }),
  getById:       (id)         => api.get(`/section-reports/${id}`),
  review:        (id, data)   => api.patch(`/section-reports/${id}/review`, data),

  // Assign class leader
  assignLeader:  (data)       => api.patch('/section-reports/assign-leader', data),
};
