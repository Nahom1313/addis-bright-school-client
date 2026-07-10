import api from './client';

export const attendanceApi = {
  // Submit attendance for a section on a date
  submit: (data) => api.post('/attendance', data),

  // Get attendance for a section (optionally filtered by date)
  getBySection: (sectionId, date) => {
    const params = { sectionId };
    if (date) params.date = date;
    return api.get('/attendance', { params });
  },

  // Get attendance history for a student
  getByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
};
