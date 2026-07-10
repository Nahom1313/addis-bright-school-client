import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance';
import { useMe } from '@/hooks/useAuth';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import { CheckCircle2, XCircle, Clock, AlertCircle, CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { PARENT_NAV } from './nav';
import clsx from 'clsx';

const STATUS = {
  present: { label: 'Present', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  absent:  { label: 'Absent',  icon: XCircle,      color: 'text-red-500 bg-red-50' },
  late:    { label: 'Late',    icon: Clock,         color: 'text-amber-600 bg-amber-50' },
  excused: { label: 'Excused', icon: AlertCircle,   color: 'text-blue-500 bg-blue-50' },
};

const StudentAttendance = ({ studentId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['attendance', 'student', studentId],
    queryFn: () => attendanceApi.getByStudent(studentId).then(r => r.data.data),
    enabled: !!studentId,
  });

  const records = data?.records || [];
  const stats   = data?.stats   || {};

  if (isLoading) return (
    <div className="space-y-2 mt-3">
      {[1,2,3].map(i => <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <>
      {stats.total > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-3 mb-4">
          {['present','absent','late','excused'].map(k => {
            const s = STATUS[k];
            return (
              <div key={k} className={clsx('rounded-xl p-2 text-center', s.color)}>
                <p className="text-lg font-bold">{stats[k] || 0}</p>
                <p className="text-[10px]">{s.label}</p>
              </div>
            );
          })}
        </div>
      )}
      {records.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-6">No attendance records yet.</p>
      ) : (
        <div className="divide-y divide-stone-50">
          {records.slice(0, 30).map(rec => {
            const s = STATUS[rec.status] || STATUS.present;
            const Icon = s.icon;
            return (
              <div key={rec._id} className="flex items-center gap-3 py-2.5">
                <span className={clsx('flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg', s.color)}>
                  <Icon className="w-3 h-3" /> {s.label}
                </span>
                <p className="text-sm text-stone-700 flex-1">
                  {format(parseISO(rec.date), 'EEE, MMM d')}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default function ParentAttendancePage() {
  const { data: me } = useMe();
  const children = me?.studentIds || [];
  const [selected, setSelected] = useState(null);

  const activeId = selected || children[0]?._id || children[0];

  return (
    <AppShell navItems={PARENT_NAV}>
      <PageHeader
        title="Attendance"
        subtitle="Track your children's daily attendance."
        icon={CalendarDays}
      />

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {children.map(child => {
            const id = child._id || child;
            const name = child.firstName ? `${child.firstName} ${child.lastName}` : `Student ${id.slice(-4)}`;
            return (
              <button key={id}
                onClick={() => setSelected(id)}
                className={clsx('px-3 py-1.5 rounded-xl text-sm font-medium border transition-all',
                  activeId === id
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'
                )}>
                {name}
              </button>
            );
          })}
        </div>
      )}

      {children.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">👨‍👩‍👧</p>
          <p className="text-stone-400">No children linked to your account yet.</p>
        </div>
      ) : (
        <div className="card">
          <StudentAttendance studentId={activeId} />
        </div>
      )}
    </AppShell>
  );
}
