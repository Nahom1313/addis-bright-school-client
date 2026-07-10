import api from './client.js';

// ─── School ───────────────────────────────────────────────────────
export const schoolApi = {
  getInfo:           ()       => api.get('/school'),
  update:            (data)   => api.patch('/school', data),
  addBankAccount:    (data)   => api.post('/school/bank-accounts', data),
  removeBankAccount: (index)  => api.delete(`/school/bank-accounts/${index}`),
  updateBankAccount: (i, data)=> api.patch(`/school/bank-accounts/${i}`, data),
};

// ─── Grades ───────────────────────────────────────────────────────
export const gradesApi = {
  getAll:   ()       => api.get('/grades'),
  getById:  (id)     => api.get(`/grades/${id}`),
  create:   (data)   => api.post('/grades', data),
  update:   (id, d)  => api.patch(`/grades/${id}`, d),
  delete:   (id)     => api.delete(`/grades/${id}`),
};

// ─── Sections ─────────────────────────────────────────────────────
export const sectionsApi = {
  getAll:       ()        => api.get('/sections'),
  getByGrade:   (gradeId) => api.get(`/sections/grade/${gradeId}`),
  getById:      (id)      => api.get(`/sections/${id}`),
  getStudents:  (id)      => api.get(`/sections/${id}/students`),
  create:       (data)    => api.post('/sections', data),
  update:       (id, d)   => api.patch(`/sections/${id}`, d),
  delete:       (id)      => api.delete(`/sections/${id}`),
};

// ─── Users ────────────────────────────────────────────────────────
export const usersApi = {
  getAll:          (role)   => api.get('/users', { params: role ? { role } : {} }),
  getStats:        ()       => api.get('/users/stats'),
  getById:         (id)     => api.get(`/users/${id}`),
  update:          (id, d)  => api.patch(`/users/${id}`, d),
  deactivate:      (id)     => api.delete(`/users/${id}`),
  createTeacher:   (data)   => api.post('/users/teachers', data),
  createStudent:   (data)   => api.post('/users/students', data),
  createParent:    (data)   => api.post('/users/parents', data),
  enrollStudent:   (id, sid)=> api.patch(`/users/${id}/enroll`, { sectionId: sid }),
  linkParent:      (id, sid)=> api.patch(`/users/${id}/link-parent`, { studentId: sid }),
  getAssignments:  (id)     => api.get(`/users/${id}/assignments`),
};

// ─── Teacher Assignments ──────────────────────────────────────────
export const assignmentsApi = {
  getAll:   ()     => api.get('/assignments'),
  assign:   (data) => api.post('/assignments', data),
  remove:   (id)   => api.delete(`/assignments/${id}`),
};

// ─── Events ───────────────────────────────────────────────────────
export const eventsApi = {
  getUpcoming: (sectionId) => api.get('/events/upcoming', { params: sectionId ? { sectionId } : {} }),
  getAll:      ()           => api.get('/events'),
  getById:     (id)         => api.get(`/events/${id}`),
  create:      (data)       => api.post('/events', data),
  update:      (id, d)      => api.patch(`/events/${id}`, d),
  delete:      (id)         => api.delete(`/events/${id}`),
};
// ─── Marks ────────────────────────────────────────────────────────
export const marksApi = {
  saveGrades:   (data)          => api.post('/marks/entry', data),
  getGrades:    (sectionId, subject) => api.get('/marks/entry', { params: { sectionId, subject } }),
  getByStudent: (studentId)     => api.get(`/marks/student/${studentId}`),
  getSummary:   (studentId)     => api.get(`/marks/student/${studentId}/summary`),
};

// ─── Meetings ─────────────────────────────────────────────────────
export const meetingsApi = {
  getUpcoming: (sectionId) => api.get('/meetings/upcoming', { params: sectionId ? { sectionId } : {} }),
  getAll:      ()           => api.get('/meetings'),
  getById:     (id)         => api.get(`/meetings/${id}`),
  create:      (data)       => api.post('/meetings', data),
  update:      (id, d)      => api.patch(`/meetings/${id}`, d),
  delete:      (id)         => api.delete(`/meetings/${id}`),
};
