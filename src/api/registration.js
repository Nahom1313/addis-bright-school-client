import api from './client.js';

const BASE = '/registration';

export const registrationApi = {
  // Students
  getStudents: (params) => api.get(`${BASE}/students`, { params }),
  createStudent: (formData) => api.post(`${BASE}/students`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStudent: (id, formData) => api.put(`${BASE}/students/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Teachers
  getTeachers: (params) => api.get(`${BASE}/teachers`, { params }),
  createTeacher: (formData) => api.post(`${BASE}/teachers`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateTeacher: (id, formData) => api.put(`${BASE}/teachers/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Parents
  getParents: (params) => api.get(`${BASE}/parents`, { params }),
  createParent: (formData) => api.post(`${BASE}/parents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateParent: (id, formData) => api.put(`${BASE}/parents/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Timetable
  getTimetable: (teacherId) => api.get(`${BASE}/timetable/${teacherId}`),
  saveTimetable: (teacherId, data) => api.put(`${BASE}/timetable/${teacherId}`, data),
};
