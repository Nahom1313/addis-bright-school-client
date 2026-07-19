import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { quizzesApi } from '@/api/quizzes.js';

const QK = {
  all:      (params) => ['quizzes', 'all', params ?? {}],
  subjects:           ['quizzes', 'subjects'],
  mine:               ['quizzes', 'mine'],
  one:      (id)      => ['quizzes', 'one', id],
  myAttempts: (id)    => ['quizzes', id, 'attempts', 'mine'],
  results:    (id)    => ['quizzes', id, 'results'],
};

// ─── Everyone — browse ───────────────────────────────────────────────

export const useQuizzes = (params) =>
  useQuery({
    queryKey: QK.all(params),
    queryFn:  () => quizzesApi.getAll(params).then(r => r.data.data.quizzes),
  });

export const useQuizSubjects = () =>
  useQuery({
    queryKey: QK.subjects,
    queryFn:  () => quizzesApi.getSubjects().then(r => r.data.data.subjects),
    staleTime: 5 * 60 * 1000,
  });

export const useQuiz = (id) =>
  useQuery({
    queryKey: QK.one(id),
    queryFn:  () => quizzesApi.getOne(id).then(r => r.data.data.quiz),
    enabled:  !!id,
  });

// ─── Teacher ────────────────────────────────────────────────────────

export const useMyQuizzes = () =>
  useQuery({
    queryKey: QK.mine,
    queryFn:  () => quizzesApi.getMine().then(r => r.data.data.quizzes),
  });

export const useCreateQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => quizzesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz created!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create quiz.'),
  });
};

export const useUpdateQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => quizzesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz updated.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update.'),
  });
};

export const useDeleteQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => quizzesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz removed.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to remove.'),
  });
};

export const useQuizResults = (id) =>
  useQuery({
    queryKey: QK.results(id),
    queryFn:  () => quizzesApi.getResults(id).then(r => r.data.data.results),
    enabled:  !!id,
  });

// ─── Student ────────────────────────────────────────────────────────

export const useMyQuizAttempts = (id) =>
  useQuery({
    queryKey: QK.myAttempts(id),
    queryFn:  () => quizzesApi.getMyAttempts(id).then(r => r.data.data.attempts),
    enabled:  !!id,
  });

export const useSubmitQuiz = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => quizzesApi.submit(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.myAttempts(id) });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to submit quiz.'),
  });
};
