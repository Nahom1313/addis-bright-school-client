import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Clock, AlertCircle, Save, Loader2, CalendarDays } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { attendanceApi } from '@/api/attendance';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { TEACHER_NAV } from './nav';
import clsx from 'clsx';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'absent',  label: 'Absent',  icon: XCircle,      color: 'text-red-500 bg-red-50 border-red-200' },
  { value: 'late',    label: 'Late',    icon: Clock,         color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'excused', label: 'Excused', icon: AlertCircle,   color: 'text-blue-500 bg-blue-50 border-blue-200' },
];

export default function AttendancePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(today);
  const [attendance, setAttendance] = useState({});

  // Fetch teacher's sections
  const { data: assignments = [] } = useQuery({
    queryKey: ['teacher-assignments', user?._id],
    queryFn: () => api.get('/assignments/mine').then(r => r.data.data || []),
    enabled: !!user,
  });

  // Fetch students in selected section
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['section-students', selectedSection],
    queryFn: () => api.get(`/sections/${selectedSection}/students`).then(r => r.data.data?.students || r.data.data || []),
    enabled: !!selectedSection,
  });

  // Load existing attendance for this section+date
  useQuery({
    queryKey: ['attendance', selectedSection, date],
    queryFn: () => attendanceApi.getBySection(selectedSection, date).then(r => {
      const records = r.data.data?.records || [];
      const map = {};
      records.forEach(rec => {
        map[rec.studentId._id || rec.studentId] = rec.status;
      });
      // Pre-fill with existing records, default new students to 'present'
      setAttendance(prev => {
        const next = {};
        students.forEach(s => { next[s._id] = map[s._id] || prev[s._id] || 'present'; });
        return next;
      });
      return records;
    }),
    enabled: !!(selectedSection && date && students.length > 0),
  });

  // Default all students to 'present' when students load and no attendance set
  useEffect(() => {
    if (students.length > 0) {
      setAttendance(prev => {
        const next = { ...prev };
        students.forEach(s => { if (!next[s._id]) next[s._id] = 'present'; });
        return next;
      });
    }
  }, [students]);

  const saveMutation = useMutation({
    mutationFn: () => attendanceApi.submit({
      sectionId: selectedSection,
      date,
      entries: students.map(s => ({ studentId: s._id, status: attendance[s._id] || 'present' })),
    }),
    onSuccess: () => {
      toast.success('Attendance saved.');
      qc.invalidateQueries({ queryKey: ['attendance', selectedSection, date] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save.'),
  });

  const setAllPresent = () => {
    const next = {};
    students.forEach(s => { next[s._id] = 'present'; });
    setAttendance(next);
  };

  const summary = students.reduce((acc, s) => {
    const st = attendance[s._id] || 'present';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell navItems={TEACHER_NAV}>
      <PageHeader title="Attendance" subtitle="Mark student attendance for your sections." />

      {/* Controls */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Section</label>
            <select className="input" value={selectedSection}
              onChange={e => { setSelectedSection(e.target.value); setAttendance({}); }}>
              <option value="">-- Select section --</option>
              {assignments.map(a => (
                <option key={a.sectionId?._id || a.sectionId} value={a.sectionId?._id || a.sectionId}>
                  {a.sectionId?.gradeId?.name || 'Grade'} — Section {a.sectionId?.name || a.sectionId}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Date
            </label>
            <input type="date" className="input" value={date} max={today}
              onChange={e => setDate(e.target.value)} />
          </div>
        </div>
      </div>

      {selectedSection && (
        <>
          {/* Summary bar */}
          {students.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {STATUS_OPTIONS.map(({ value, label, color }) => (
                <div key={value} className={clsx('card !p-3 text-center border', color)}>
                  <p className="text-lg font-bold">{summary[value] || 0}</p>
                  <p className="text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="card !p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
              <p className="font-medium text-stone-700 text-sm">
                {students.length} student{students.length !== 1 ? 's' : ''}
              </p>
              <button className="btn-secondary text-xs py-1.5 px-3" onClick={setAllPresent}>
                Mark all present
              </button>
            </div>

            {loadingStudents ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : students.length === 0 ? (
              <p className="text-center text-stone-400 py-12 text-sm">No students in this section.</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {students.map(student => {
                  const current = attendance[student._id] || 'present';
                  return (
                    <div key={student._id} className="flex items-center gap-4 px-5 py-3 hover:bg-stone-50/60">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-800 text-sm">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-stone-400">{student.studentCode}</p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {STATUS_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                          <button key={value}
                            onClick={() => setAttendance(a => ({ ...a, [student._id]: value }))}
                            className={clsx(
                              'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border font-medium transition-all',
                              current === value ? color : 'text-stone-400 bg-stone-50 border-stone-100 hover:border-stone-200'
                            )}>
                            <Icon className="w-3 h-3" /> {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {students.length > 0 && (
              <div className="flex justify-end px-5 py-4 border-t border-stone-100">
                <button onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="btn-primary flex items-center gap-2">
                  {saveMutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    : <><Save className="w-4 h-4" /> Save Attendance</>
                  }
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
