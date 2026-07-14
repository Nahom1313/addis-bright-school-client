import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ChevronDown, ChevronRight, GraduationCap, BarChart2, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import ProgressChart from '@/components/shared/ProgressChart';
import { useAuth } from '@/context/AuthContext';
import { useTeacherAssignments, useSectionStudents } from '@/hooks/useSchool';
import { TEACHER_NAV } from './nav';

const StudentRow = ({ student, i }) => {
  const [showChart, setShowChart] = useState(false);
  return (
    <>
      <motion.tr
        className="table-row cursor-pointer hover:bg-amber-50/40 transition-colors"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
        onClick={() => setShowChart(v => !v)}
      >
        <td className="px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600 flex-shrink-0">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div>
              <p className="font-medium text-stone-800 text-sm">{student.firstName} {student.lastName}</p>
              <p className="text-xs text-stone-400">{student.studentCode}</p>
            </div>
          </div>
        </td>
        <td className="px-5 py-3 text-xs text-stone-400">{student.email}</td>
        <td className="px-5 py-3 text-right">
          <button className="btn-icon text-stone-300 hover:text-amber-600">
            <BarChart2 className="w-4 h-4" />
          </button>
        </td>
      </motion.tr>
      {showChart && (
        <tr>
          <td colSpan={3} className="px-4 pb-4 pt-1 bg-stone-50/60">
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowChart(false); }}
                className="absolute top-2 right-2 btn-icon text-stone-300 hover:text-stone-600 z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <ProgressChart
                studentId={student._id}
                name={student.firstName}
                compact
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const SectionPanel = ({ sectionId, sectionName, subjects }) => {
  const [open, setOpen] = useState(false);
  const { data: students = [], isLoading } = useSectionStudents(open ? sectionId : null);
  const Icon = open ? ChevronDown : ChevronRight;

  return (
    <div className="border border-stone-100 rounded-2xl overflow-hidden mb-3">
      <button className="w-full flex items-center gap-4 px-5 py-4 bg-white hover:bg-stone-50 transition-colors text-left" onClick={() => setOpen(v => !v)}>
        <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-sky-700">{sectionName}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-stone-800">Section {sectionName}</p>
          <div className="flex gap-1 flex-wrap mt-0.5">{subjects.map(s => <span key={s} className="badge-amber text-xs">{s}</span>)}</div>
        </div>
        <Icon className="w-4 h-4 text-stone-400" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="border-t border-stone-100">
            {isLoading ? (
              <div className="p-4 space-y-2">{[1,2,3].map(i=><div key={i} className="h-10 bg-stone-100 rounded-lg animate-pulse"/>)}</div>
            ) : students.length === 0 ? (
              <p className="text-center py-8 text-sm text-stone-400">No students enrolled in this section</p>
            ) : (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="bg-stone-50 border-b border-stone-100">
                  <th className="text-left px-5 py-2.5 section-label">Student</th>
                  <th className="text-left px-5 py-2.5 section-label">Email</th>
                  <th className="text-right px-5 py-2.5 section-label">Progress</th>
                </tr></thead>
                <tbody>{students.map((s, i) => <StudentRow key={s._id} student={s} i={i} />)}</tbody>
              </table></div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ClassesPage = () => {
  const { user } = useAuth();
  const { data: assignments = [], isLoading } = useTeacherAssignments(user?._id);

  // Group by section
  const sectionMap = {};
  assignments.forEach(a => {
    const sid = a.sectionId?._id;
    if (!sid) return;
    if (!sectionMap[sid]) sectionMap[sid] = { sectionId: sid, sectionName: a.sectionId?.name, gradeName: a.sectionId?.gradeId?.name, subjects: [] };
    sectionMap[sid].subjects.push(a.subject);
  });
  const sections = Object.values(sectionMap);

  return (
    <AppShell navItems={TEACHER_NAV}>
      <PageHeader title="My Classes" subtitle="View your assigned sections and student rosters" />
      {isLoading ? (
        <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-16 bg-stone-100 rounded-2xl animate-pulse"/>)}</div>
      ) : sections.length === 0 ? (
        <div className="card"><EmptyState icon={GraduationCap} title="No classes assigned" body="The director hasn't assigned you to any sections yet." /></div>
      ) : (
        <>
          <p className="section-label">{sections.length} section{sections.length !== 1 ? 's' : ''} — click to expand roster</p>
          {sections.map(s => <SectionPanel key={s.sectionId} {...s} />)}
        </>
      )}
    </AppShell>
  );
};

export default ClassesPage;
