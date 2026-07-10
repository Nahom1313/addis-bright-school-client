import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { gradesApi, sectionsApi, usersApi, assignmentsApi, schoolApi, marksApi } from '@/api/school';

// ─── Keys ─────────────────────────────────────────────────────────
export const QK = {
  school:      ['school'],
  grades:      ['grades'],
  grade:       (id) => ['grades', id],
  sections:    ['sections'],
  sectionsByGrade: (gId) => ['sections', 'grade', gId],
  sectionStudents: (id)  => ['sections', id, 'students'],
  users:       (role) => ['users', role ?? 'all'],
  userStats:   ['users', 'stats'],
  user:        (id) => ['users', id],
  assignments: ['assignments'],
  teacherAssignments: (id) => ['users', id, 'assignments'],
};

// ─── School ───────────────────────────────────────────────────────
export const useSchoolInfo = () =>
  useQuery({ queryKey: QK.school, queryFn: () => schoolApi.getInfo().then(r => r.data.data.info) });

export const useUpdateSchoolInfo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => schoolApi.update(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.school }); toast.success('School info updated.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed.'),
  });
};

export const useAddBankAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => schoolApi.addBankAccount(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.school }); toast.success('Bank account added.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

export const useRemoveBankAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (index) => schoolApi.removeBankAccount(index),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.school }); toast.success('Bank account removed.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

// ─── Grades ───────────────────────────────────────────────────────
export const useGrades = () =>
  useQuery({ queryKey: QK.grades, queryFn: () => gradesApi.getAll().then(r => r.data.data.grades) });

export const useGrade = (id) =>
  useQuery({ queryKey: QK.grade(id), queryFn: () => gradesApi.getById(id).then(r => r.data.data.grade), enabled: !!id });

export const useCreateGrade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => gradesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.grades }); toast.success('Grade created.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

export const useDeleteGrade = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => gradesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.grades }); toast.success('Grade removed.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

// ─── Sections ─────────────────────────────────────────────────────
export const useSections = () =>
  useQuery({ queryKey: QK.sections, queryFn: () => sectionsApi.getAll().then(r => r.data.data.sections) });

export const useSectionsByGrade = (gradeId) =>
  useQuery({ queryKey: QK.sectionsByGrade(gradeId), queryFn: () => sectionsApi.getByGrade(gradeId).then(r => r.data.data.sections), enabled: !!gradeId });

export const useSectionStudents = (sectionId) =>
  useQuery({ queryKey: QK.sectionStudents(sectionId), queryFn: () => sectionsApi.getStudents(sectionId).then(r => r.data.data.students), enabled: !!sectionId });

export const useCreateSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => sectionsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.sections }); qc.invalidateQueries({ queryKey: QK.grades }); toast.success('Section created.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

// ─── Users ────────────────────────────────────────────────────────
export const useUsers = (role) =>
  useQuery({ queryKey: QK.users(role), queryFn: () => usersApi.getAll(role).then(r => r.data.data.users) });

export const useUserStats = () =>
  useQuery({ queryKey: QK.userStats, queryFn: () => usersApi.getStats().then(r => r.data.data.stats) });

export const useUser = (id) =>
  useQuery({ queryKey: QK.user(id), queryFn: () => usersApi.getById(id).then(r => r.data.data.user), enabled: !!id });

// Helper — blow away every user-related cache at once
const invalidateAllUsers = (qc) => {
  qc.invalidateQueries({ queryKey: ['users'] });
  qc.invalidateQueries({ queryKey: ['reg-students'] });
  qc.invalidateQueries({ queryKey: ['reg-teachers'] });
  qc.invalidateQueries({ queryKey: ['reg-parents'] });
  qc.invalidateQueries({ queryKey: QK.userStats });
  qc.invalidateQueries({ queryKey: ['me'] });
};

export const useCreateTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => usersApi.createTeacher(data),
    onSuccess: () => { invalidateAllUsers(qc); toast.success('Teacher account created.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

export const useCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => usersApi.createStudent(data),
    onSuccess: () => { invalidateAllUsers(qc); toast.success('Student account created.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

export const useCreateParent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => usersApi.createParent(data),
    onSuccess: () => { invalidateAllUsers(qc); toast.success('Parent account created.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

export const useDeactivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersApi.deactivate(id),
    onSuccess: () => { invalidateAllUsers(qc); toast.success('User deactivated.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

export const useEnrollStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, sectionId }) => usersApi.enrollStudent(studentId, sectionId),
    onSuccess: () => {
      // Invalidate every cache that might show student/section data
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['reg-students'] });
      qc.invalidateQueries({ queryKey: QK.sections });
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Student enrolled.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

// ─── Teacher Assignments ──────────────────────────────────────────
export const useAssignments = () =>
  useQuery({ queryKey: QK.assignments, queryFn: () => assignmentsApi.getAll().then(r => r.data.data.assignments) });

export const useTeacherAssignments = (teacherId) =>
  useQuery({ queryKey: QK.teacherAssignments(teacherId), queryFn: () => usersApi.getAssignments(teacherId).then(r => r.data.data.assignments), enabled: !!teacherId });

export const useAssignTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => assignmentsApi.assign(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.assignments }); toast.success('Teacher assigned.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

export const useRemoveAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => assignmentsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.assignments }); toast.success('Assignment removed.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

// ─── Events ───────────────────────────────────────────────────────
import { eventsApi } from '@/api/school';

export const QK_EVENTS = {
  upcoming: (sectionId) => ['events', 'upcoming', sectionId ?? 'all'],
  all: ['events'],
  one: (id) => ['events', id],
};

export const useUpcomingEvents = (sectionId = null) =>
  useQuery({
    queryKey: QK_EVENTS.upcoming(sectionId),
    queryFn: () => eventsApi.getUpcoming(sectionId).then(r => r.data.data.events),
  });

export const useAllEvents = () =>
  useQuery({
    queryKey: QK_EVENTS.all,
    queryFn: () => eventsApi.getAll().then(r => r.data.data.events),
  });

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => eventsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); toast.success('Event created.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create event.'),
  });
};

export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => eventsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); toast.success('Event deleted.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};

// ─── Marks ────────────────────────────────────────────────────────

export const useStudentMarks = (studentId) =>
  useQuery({
    queryKey: ['marks', 'student', studentId],
    queryFn: () => marksApi.getByStudent(studentId).then(r => r.data.data.marks),
    enabled: !!studentId,
  });

export const useStudentMarksSummary = (studentId) =>
  useQuery({
    queryKey: ['marks', 'student', studentId, 'summary'],
    queryFn: () => marksApi.getSummary(studentId).then(r => r.data.data.summary),
    enabled: !!studentId,
  });

export const useSaveGrades = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => marksApi.saveGrades(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['marks'] }); toast.success('Grades saved.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to save grades.'),
  });
};

// ─── Meetings ─────────────────────────────────────────────────────
import { meetingsApi } from '@/api/school';

export const QK_MEETINGS = {
  upcoming: (sectionId) => ['meetings', 'upcoming', sectionId ?? 'all'],
  all: ['meetings'],
  one: (id) => ['meetings', id],
};

export const useUpcomingMeetings = (sectionId = null) =>
  useQuery({
    queryKey: QK_MEETINGS.upcoming(sectionId),
    queryFn: () => meetingsApi.getUpcoming(sectionId).then(r => r.data.data.meetings),
  });

export const useCreateMeeting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => meetingsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['meetings'] }); toast.success('Meeting scheduled.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to schedule meeting.'),
  });
};

export const useDeleteMeeting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => meetingsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['meetings'] }); toast.success('Meeting cancelled.'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed.'),
  });
};
