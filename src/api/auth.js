import api from './client.js';

export const authApi = {
  register: (data)          => api.post('/auth/register', data),
  login: (data)             => api.post('/auth/login', data),
  getMe: ()                 => api.get('/auth/me'),
  logout: ()                => api.post('/auth/logout'),
  changePassword: (data)    => api.patch('/auth/change-password', data),
};
