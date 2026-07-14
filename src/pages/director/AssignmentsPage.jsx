import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ClipboardList } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useAssignments, useAssignTeacher, useRemoveAssignment, useUsers, useSections } from '@/hooks/useSchool';
import { DIRECTOR_NAV } from './nav';

const AssignmentRow = ({ a, onRemove }) => (
  <motion.tr className="table-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <td className="px-5 py-3.5">
      <p className="font-medium text-stone-800 text-sm">{a.teacherId?.firstName} {a.teacherId?.lastName}</p>
      <p className="text-xs text-stone-400">{a.teacherId?.email}</p>
    </td>
    <td className="px-5 py-3.5"><span className="badge-amber">{a.subject}</span></td>
    <td className="px-5 py-3.5 text-sm text-stone-600">
      {a.sectionId?.name} <span className="text-stone-400 text-xs">· {a.sectionId?.gradeId?.name}</span>
    </td>
    <td className="px-5 py-3.5 text-xs text-stone-400">{a.academicYear}</td>
    <td className="px-5 py-3.5">
      <button onClick={() => onRemove(a._id)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50">
        <Trash2 className="w-4 h-4" />
      </button>
    </td>
  </motion.tr>
);

const AssignmentsPage = () => {
  const { data: assignments = [], isLoading } = useAssignments();
  const { data: teachers = [] } = useUsers('teacher');
  const { data: sections = [] }  = useSections();
  const assign = useAssignTeacher();
  const remove = useRemoveAssignment();
  const [modal, setModal] = useState(false);
  const currentYear = `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
  const [f, setF] = useState({ teacherId: '', sectionId: '', subject: '', academicYear: currentYear });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = e => {
    e.preventDefault();
    assign.mutate(f, {
      onSuccess: () => {
        setModal(false);
        setF({ teacherId: '', sectionId: '', subject: '', academicYear: currentYear });
      },
    });
  };

  return (
    <AppShell navItems={DIRECTOR_NAV}>
      <PageHeader
        title="Teacher Assignments"
        subtitle="Assign teachers to sections and subjects"
        action={
          <button className="btn-primary flex items-center gap-2" onClick={() => setModal(true)}>
            <Plus className="w-4 h-4" /> Assign teacher
          </button>
        }
      />

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />)}
            </div>
          ) : assignments.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No assignments yet"
              body="Assign a teacher to a section to get started."
              action={<button className="btn-primary" onClick={() => setModal(true)}>Assign teacher</button>}
            />
          ) : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-5 py-3 section-label">Teacher</th>
                  <th className="text-left px-5 py-3 section-label">Subject</th>
                  <th className="text-left px-5 py-3 section-label">Section</th>
                  <th className="text-left px-5 py-3 section-label">Year</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <AssignmentRow key={a._id} a={a} onRemove={id => remove.mutate(id)} />
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Assign Teacher" size="sm">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Teacher</label>
            <select className="input" value={f.teacherId} onChange={set('teacherId')} required>
              <option value="">Select teacher…</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Section</label>
            <select className="input" value={f.sectionId} onChange={set('sectionId')} required>
              <option value="">Select section…</option>
              {sections.map(s => <option key={s._id} value={s._id}>{s.gradeId?.name} — Section {s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Subject</label>
            <input className="input" placeholder="e.g. Mathematics" value={f.subject} onChange={set('subject')} required />
          </div>
          <div>
            <label className="label">Academic year</label>
            <input className="input" value={f.academicYear} onChange={set('academicYear')} placeholder="2024/2025" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={assign.isPending}>
              {assign.isPending ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
};

export default AssignmentsPage;
