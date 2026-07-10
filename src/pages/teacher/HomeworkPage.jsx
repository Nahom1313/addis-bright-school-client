import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Plus, Trash2, Pencil, Link, CalendarDays, Clock, ChevronDown } from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';
import AppShell from '@/components/shared/AppShell.jsx';
import PageHeader from '@/components/ui/PageHeader.jsx';
import Modal from '@/components/ui/Modal.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useTeacherAssignments } from '@/hooks/useSchool.js';
import { useMyHomework, useCreateHomework, useUpdateHomework, useDeleteHomework } from '@/hooks/useHomework.js';
import { TEACHER_NAV } from './nav.js';
import clsx from 'clsx';

// ─── Due badge ────────────────────────────────────────────────────
const DueBadge = ({ dueDate }) => {
  const days = differenceInDays(new Date(dueDate), new Date());
  const past = isPast(new Date(dueDate));
  if (past)    return <span className="badge bg-red-50 text-red-600">Overdue</span>;
  if (days === 0) return <span className="badge bg-amber-50 text-amber-700">Due today</span>;
  if (days <= 2)  return <span className="badge bg-orange-50 text-orange-600">Due in {days}d</span>;
  return <span className="badge bg-stone-100 text-stone-500">Due in {days}d</span>;
};

// ─── Homework card ────────────────────────────────────────────────
const HomeworkCard = ({ hw, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    className="card group"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2 mb-1">
          <span className="badge bg-amber-100 text-amber-800 font-semibold">{hw.subject}</span>
          <span className="text-xs text-stone-400">
            {hw.sectionId?.gradeId?.name} — Section {hw.sectionId?.name}
          </span>
          <DueBadge dueDate={hw.dueDate} />
        </div>
        <p className="font-semibold text-stone-800 truncate">{hw.title}</p>
        {hw.description && (
          <p className="text-sm text-stone-500 mt-1 line-clamp-2">{hw.description}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            Due {format(new Date(hw.dueDate), 'dd MMM yyyy')}
          </span>
          {hw.resourceUrl && (
            <a href={hw.resourceUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-amber-600 hover:underline"
              onClick={e => e.stopPropagation()}>
              <Link className="w-3 h-3" /> Resource link
            </a>
          )}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onEdit(hw)} className="btn-icon text-stone-400 hover:text-amber-600 hover:bg-amber-50">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(hw._id)} className="btn-icon text-stone-400 hover:text-red-500 hover:bg-red-50">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </motion.div>
);

// ─── Create / Edit modal ──────────────────────────────────────────
const HomeworkModal = ({ open, onClose, assignments, editTarget }) => {
  const isEdit = !!editTarget;
  const create = useCreateHomework();
  const update = useUpdateHomework();

  // Unique sections from assignments
  const sections = Object.values(
    assignments.reduce((acc, a) => {
      const sid = a.sectionId?._id;
      if (!sid || acc[sid]) return acc;
      acc[sid] = { id: sid, name: a.sectionId?.name, gradeName: a.sectionId?.gradeId?.name };
      return acc;
    }, {})
  );

  // Unique subjects
  const subjects = [...new Set(assignments.map(a => a.subject).filter(Boolean))].sort();

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    sectionId:   editTarget?.sectionId?._id || '',
    subject:     editTarget?.subject  || (subjects[0] ?? ''),
    title:       editTarget?.title    || '',
    description: editTarget?.description || '',
    dueDate:     editTarget?.dueDate  ? new Date(editTarget.dueDate).toISOString().split('T')[0] : '',
    resourceUrl: editTarget?.resourceUrl || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const reset = () => setForm({ sectionId: '', subject: subjects[0] ?? '', title: '', description: '', dueDate: '', resourceUrl: '' });

  const pending = create.isPending || update.isPending;

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      sectionId:   form.sectionId,
      subject:     form.subject,
      title:       form.title.trim(),
      description: form.description.trim() || null,
      dueDate:     form.dueDate,
      resourceUrl: form.resourceUrl.trim() || null,
    };
    if (isEdit) {
      update.mutate({ id: editTarget._id, data: payload }, { onSuccess: () => { onClose(); reset(); } });
    } else {
      create.mutate(payload, { onSuccess: () => { onClose(); reset(); } });
    }
  };

  return (
    <Modal open={open} onClose={() => { onClose(); reset(); }} title={isEdit ? 'Edit Homework' : 'Post Homework'} size="md">
      <form onSubmit={submit} className="space-y-4">
        {/* Section */}
        {!isEdit && (
          <div>
            <label className="label">Section</label>
            <select className="input" value={form.sectionId} onChange={e => set('sectionId', e.target.value)} required>
              <option value="">Select a section…</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.gradeName} — Section {s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Subject */}
        <div>
          <label className="label">Subject</label>
          {subjects.length > 0 ? (
            <select className="input" value={form.subject} onChange={e => set('subject', e.target.value)} required>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <input className="input" placeholder="e.g. Mathematics" value={form.subject}
              onChange={e => set('subject', e.target.value)} required />
          )}
        </div>

        {/* Title */}
        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="e.g. Chapter 5 exercises, pages 44–48"
            value={form.title} onChange={e => set('title', e.target.value)} maxLength={150} required />
        </div>

        {/* Description */}
        <div>
          <label className="label">Instructions <span className="text-stone-400 font-normal">(optional)</span></label>
          <textarea className="input resize-none" rows={3}
            placeholder="Add any extra details, steps, or notes for students…"
            value={form.description} onChange={e => set('description', e.target.value)} maxLength={2000} />
        </div>

        {/* Due date */}
        <div>
          <label className="label flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Due date</label>
          <input type="date" className="input" min={today} value={form.dueDate}
            onChange={e => set('dueDate', e.target.value)} required />
        </div>

        {/* Resource URL */}
        <div>
          <label className="label flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5" /> Resource link <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <input className="input" type="url" placeholder="https://docs.google.com/…"
            value={form.resourceUrl} onChange={e => set('resourceUrl', e.target.value)} />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={() => { onClose(); reset(); }}>Cancel</button>
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={pending}>
            {pending
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              : <><BookMarked className="w-3.5 h-3.5" /> {isEdit ? 'Save changes' : 'Post homework'}</>
            }
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Page ─────────────────────────────────────────────────────────
const SUBJECTS = ['All subjects', 'Math', 'English', 'Science', 'Social Studies', 'Amharic', 'Art', 'PE'];

export default function HomeworkPage() {
  const { user } = useAuth();
  const { data: assignments = [] } = useTeacherAssignments(user?._id);
  const { data: homework = [], isLoading } = useMyHomework();
  const deleteHw = useDeleteHomework();

  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [filterSub, setFilterSub] = useState('All subjects');
  const [filterStatus, setFilterStatus] = useState('upcoming'); // 'upcoming' | 'all'

  const filtered = homework.filter(hw => {
    if (filterSub !== 'All subjects' && hw.subject !== filterSub) return false;
    if (filterStatus === 'upcoming' && isPast(new Date(hw.dueDate))) return false;
    return true;
  });

  const subjects = ['All subjects', ...new Set(assignments.map(a => a.subject).filter(Boolean))].sort((a, b) =>
    a === 'All subjects' ? -1 : b === 'All subjects' ? 1 : a.localeCompare(b)
  );

  return (
    <AppShell navItems={TEACHER_NAV}>
      <PageHeader
        title="Homework"
        subtitle="Post assignments for your sections"
        action={
          <button className="btn-primary flex items-center gap-2"
            onClick={() => { setEditing(null); setModal(true); }}
            disabled={assignments.length === 0}>
            <Plus className="w-4 h-4" /> Post homework
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {/* Status toggle */}
        <div className="flex rounded-xl border border-stone-200 overflow-hidden text-sm">
          {['upcoming', 'all'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={clsx('px-3 py-1.5 capitalize transition-colors',
                filterStatus === s ? 'bg-amber-600 text-white font-medium' : 'bg-white text-stone-500 hover:bg-stone-50'
              )}>
              {s === 'upcoming' ? 'Upcoming' : 'All'}
            </button>
          ))}
        </div>

        {/* Subject filter */}
        <div className="relative">
          <select className="input pr-8 text-sm py-1.5 appearance-none cursor-pointer"
            value={filterSub} onChange={e => setFilterSub(e.target.value)}>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={BookMarked} title="No homework yet"
            body={filterStatus === 'upcoming' ? 'No upcoming assignments. Post one for your class!' : 'No homework found.'}
            action={
              <button className="btn-primary flex items-center gap-2"
                onClick={() => { setEditing(null); setModal(true); }}>
                <Plus className="w-4 h-4" /> Post first homework
              </button>
            }
          />
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map(hw => (
              <HomeworkCard key={hw._id} hw={hw}
                onEdit={(hw) => { setEditing(hw); setModal(true); }}
                onDelete={(id) => deleteHw.mutate(id)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      <HomeworkModal
        open={modal}
        onClose={() => { setModal(false); setEditing(null); }}
        assignments={assignments}
        editTarget={editing}
      />
    </AppShell>
  );
}
