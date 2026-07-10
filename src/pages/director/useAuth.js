import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth';

const ROLE_REDIRECTS = {
  director:   '/director',
  teacher:    '/teacher',
  parent:     '/parent',
  student:    '/student',
  registrar:  '/registrar',
};

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: ({ data }) => {
      const { user, token } = data.data;
      login(user, token);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate(ROLE_REDIRECTS[user.role] || '/');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    authApi.logout().finally(() => {
      logout();
      queryClient.clear();
      navigate('/login');
      toast.success('Signed out.');
    });
  };
};

export const useMe = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.getMe().then((r) => r.data.data.user),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10,
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => toast.success('Password updated successfully.'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update password.'),
  });
