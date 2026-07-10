import { useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance';
import { useSchoolInfo } from '@/hooks/useSchool';
import { CheckCircle2, XCircle, Clock, AlertCircle, CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import clsx from 'clsx';
import PrintExportButton from '@/components/shared/PrintExportButton';
import AttendanceSheetDocument from '@/components/shared/AttendanceSheetDocument';

const STATUS = {
  present: { label:'Present', icon:CheckCircle2, color:'text-emerald-600 bg-emerald-50' },
  absent:  { label:'Absent',  icon:XCircle,      color:'text-red-500 bg-red-50' },
  late:    { label:'Late',    icon:Clock,         color:'text-amber-600 bg-amber-50' },
  excused: { label:'Excused', icon:AlertCircle,   color:'text-blue-500 bg-blue-50' },
};

export default function StudentAttendancePage() {
  const { user }   = useAuth();
  const printRef   = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['attendance','student', user?._id],
    queryFn:  () => attendanceApi.getByStudent(user._id).then(r => r.data.data),
    enabled:  !!user,
  });

  const { data: schoolInfo } = useSchoolInfo();

  const records = data?.records || [];
  const stats   = data?.stats   || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-600"/> Attendance
          </h1>
          <p className="page-subtitle">Your attendance record for the last 90 days</p>
        </div>
        {records.length > 0 && (
          <PrintExportButton
            printRef={printRef}
            filename={`attendance-${user?.firstName}-${user?.lastName}`}
          />
        )}
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { key:'present', label:'Present', color:'text-emerald-700 bg-emerald-50' },
            { key:'absent',  label:'Absent',  color:'text-red-600 bg-red-50' },
            { key:'late',    label:'Late',    color:'text-amber-700 bg-amber-50' },
            { key:'excused', label:'Excused', color:'text-blue-600 bg-blue-50' },
          ].map(({ key, label, color }) => (
            <div key={key} className={clsx('card !p-4 text-center', color)}>
              <p className="text-2xl font-bold">{stats[key] || 0}</p>
              <p className="text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {stats.total > 0 && (
        <div className="card mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-amber-700">
              {Math.round(((stats.present + stats.late) / stats.total) * 100)}%
            </span>
          </div>
          <div>
            <p className="font-semibold text-stone-800">Attendance Rate</p>
            <p className="text-sm text-stone-400">{stats.total} days recorded</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse"/>)}
        </div>
      ) : records.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-stone-400">No attendance records yet</p>
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <div className="divide-y divide-stone-50">
            {records.map(rec => {
              const s    = STATUS[rec.status] || STATUS.present;
              const Icon = s.icon;
              return (
                <div key={rec._id} className="flex items-center gap-3 px-5 py-3">
                  <span className={clsx('flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg', s.color)}>
                    <Icon className="w-3.5 h-3.5"/> {s.label}
                  </span>
                  <p className="text-sm text-stone-700 flex-1">
                    {format(parseISO(rec.date),'EEEE, MMM d, yyyy')}
                  </p>
                  {rec.note && (
                    <p className="text-xs text-stone-400 italic truncate max-w-[140px]">{rec.note}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden printable */}
      <div style={{ position:'absolute', left:'-9999px', top:0, pointerEvents:'none' }}>
        <AttendanceSheetDocument
          ref={printRef}
          student={user}
          records={records}
          stats={stats}
          schoolInfo={schoolInfo}
        />
      </div>
    </div>
  );
}
