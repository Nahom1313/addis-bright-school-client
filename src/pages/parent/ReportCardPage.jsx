import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import { useMe } from '@/hooks/useAuth';
import { useSchoolInfo } from '@/hooks/useSchool';
import api from '@/api/client';
import { attendanceApi } from '@/api/attendance';
import { PARENT_NAV } from './nav';
import PrintExportButton from '@/components/shared/PrintExportButton';
import ReportCardDocument from '@/components/shared/ReportCardDocument';
import AttendanceSheetDocument from '@/components/shared/AttendanceSheetDocument';
import { FileText, CalendarDays, ChevronDown, UserCircle } from 'lucide-react';
import clsx from 'clsx';

const TAB = { report: 'report', attendance: 'attendance' };

export default function ParentReportCardPage() {
  const [tab, setTab]           = useState(TAB.report);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const reportRef               = useRef(null);
  const attendanceRef           = useRef(null);
  const { data: me }            = useMe();
  const { data: schoolInfo }    = useSchoolInfo();

  const children = me?.studentIds || [];
  const child    = children[selectedIdx];
  const studentId = child?._id || child;
  const studentName = child?.firstName || 'Student';

  const { data: marks = [], isLoading: marksLoading } = useQuery({
    queryKey: ['student-marks', studentId],
    queryFn:  () => api.get(`/marks/student/${studentId}`).then(r => r.data.data?.marks || []),
    enabled:  !!studentId,
  });

  const { data: attData, isLoading: attLoading } = useQuery({
    queryKey: ['attendance', 'student', studentId],
    queryFn:  () => attendanceApi.getByStudent(studentId).then(r => r.data.data),
    enabled:  !!studentId,
  });

  const records = attData?.records || [];
  const stats   = attData?.stats   || {};

  // Build student object from populated child data
  const student = child ? {
    _id:         child._id || child,
    firstName:   child.firstName,
    lastName:    child.lastName,
    studentCode: child.studentCode,
    sectionId:   child.sectionId,
  } : null;

  if (!children.length) return (
    <AppShell navItems={PARENT_NAV}>
      <PageHeader title="Report Card" subtitle="Print or download your child's records" />
      <div className="card text-center py-16">
        <UserCircle className="w-12 h-12 text-stone-200 mx-auto mb-3" />
        <p className="font-medium text-stone-700">No children linked yet</p>
        <p className="text-sm text-stone-400 mt-1">Go to your profile and link a student using their code.</p>
      </div>
    </AppShell>
  );

  return (
    <AppShell navItems={PARENT_NAV}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Report Card</h1>
          <p className="page-subtitle">Print or download academic records</p>
        </div>
        <PrintExportButton
          printRef={tab === TAB.report ? reportRef : attendanceRef}
          filename={tab === TAB.report
            ? `report-card-${studentName}`
            : `attendance-${studentName}`}
        />
      </div>

      {/* Child selector — only shows if more than one child */}
      {children.length > 1 && (
        <div className="relative w-fit mb-5">
          <select
            className="input pr-8 appearance-none cursor-pointer"
            value={selectedIdx}
            onChange={e => setSelectedIdx(Number(e.target.value))}
          >
            {children.map((c, i) => (
              <option key={c._id || i} value={i}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[[TAB.report, FileText, 'Report Card'], [TAB.attendance, CalendarDays, 'Attendance Sheet']].map(([key, Icon, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={clsx('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
              tab === key ? 'bg-amber-100 text-amber-800' : 'text-stone-500 hover:bg-stone-100'
            )}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="card overflow-hidden" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
        {tab === TAB.report ? (
          marksLoading
            ? <div className="py-20 text-center text-stone-400">Loading marks…</div>
            : <ReportCardDocument ref={reportRef} student={student} marks={marks} schoolInfo={schoolInfo} />
        ) : (
          attLoading
            ? <div className="py-20 text-center text-stone-400">Loading attendance…</div>
            : <AttendanceSheetDocument ref={attendanceRef} student={student} records={records} stats={stats} schoolInfo={schoolInfo} />
        )}
      </div>
    </AppShell>
  );
}
