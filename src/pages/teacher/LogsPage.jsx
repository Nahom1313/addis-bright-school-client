import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ClipboardList, Send, Trash2 } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import LogCard from '@/components/shared/LogCard';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useTeacherAssignments, useSectionStudents } from '@/hooks/useSchool';
import { useCreateLog, useMyLogs, useDeleteLog } from '@/hooks/useLogs';
import { TEACHER_NAV } from './nav';
import clsx from 'clsx';

// ─── Log row with delete button wrapping shared LogCard ───────────
const TeacherLogRow = ({ log, onDelete }) => (
  <div className="relative group">
    <LogCard log={log} />
    {/* Delete button floats top-right on hover */}
    <button
      onClick={() => onDelete(log._id)}
      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity btn-icon text-red-400 hover:text-red-600 hover:bg-red-50 z-10"
      aria-label="Delete log"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  </div>
);

// ─── Create log modal ─────────────────────────────────────────────
const CreateLogModal = ({ open, onClose, assignments }) => {
  const createLog = useCreateLog();

  const sections = Object.values(
    assignments.reduce((acc, a) => {
      const sid = a.sectionId?._id;
      if (!sid) return acc;
      if (!acc[sid]) acc[sid] = { sectionId: sid, name: a.sectionId?.name, gradeName: a.sectionId?.gradeId?.name };
      return acc;
    }, {})
  );

  const [sectionId, setSectionId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [rawNote,   setRawNote]   = useState('');

  const { data: students = [], isLoading: studentsLoading } = useSectionStudents(sectionId || null);

  const QUICK_NOTES = [
    'Arrived late today',
    'Excellent participation in class',
    'Missing homework this week',
    'Great improvement in reading',
    'Needs support with fractions',
    'Very helpful to classmates today',
  ];

  const reset = () => { setSectionId(''); setStudentId(''); setRawNote(''); };

  const submit = e => {
    e.preventDefault();
    createLog.mutate({ studentId, sectionId, rawNote }, {
      onSuccess: () => { onClose(); reset(); },
    });
  };

  return (
    <Modal open={open} onClose={() => { onClose(); reset(); }} title="New Status Log" size="md">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label">Section</label>
          <select className="input" value={sectionId} onChange={e => { setSectionId(e.target.value); setStudentId(''); }} required>
            <option value="">Select a section…</option>
            {sections.map(s => (
              <option key={s.sectionId} value={s.sectionId}>
                {s.gradeName} — Section {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Student</label>
          <select className="input" value={studentId} onChange={e => setStudentId(e.target.value)} required disabled={!sectionId}>
            <option value="">{sectionId ? (studentsLoading ? 'Loading…' : 'Select a student…') : 'Choose a section first'}</option>
            {students.map(s => (
              <option key={s._id} value={s._id}>{s.firstName} {s.lastName} · {s.studentCode}</option>
            ))}
          </select>
        </div>

        {studentId && (
          <div>
            <p className="label">Quick notes</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_NOTES.map(n => (
                <button key={n} type="button" onClick={() => setRawNote(n)}
                  className={clsx('text-xs px-3 py-1.5 rounded-xl border transition-all',
                    rawNote === n ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
                  )}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="label">Your note <span className="font-normal text-stone-400">({rawNote.length}/500)</span></label>
          <textarea className="input resize-none" rows={3}
            placeholder="Type anything — AI will rewrite it into an encouraging parent-friendly update"
            value={rawNote} onChange={e => setRawNote(e.target.value)} maxLength={500} required />
          <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> AI rewrites this into a warm parent update
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={() => { onClose(); reset(); }}>Cancel</button>
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2"
            disabled={createLog.isPending || !studentId || !rawNote.trim()}>
            {createLog.isPending
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
              : <><Send className="w-3.5 h-3.5" /> Submit log</>
            }
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Page ─────────────────────────────────────────────────────────
const LogsPage = () => {
  const { user } = useAuth();
  const { data: assignments = [] } = useTeacherAssignments(user?._id);
  const { data: logs = [], isLoading } = useMyLogs();
  const deleteLog = useDeleteLog();
  const [modal, setModal] = useState(false);

  return (
    <AppShell navItems={TEACHER_NAV}>
      <PageHeader
        title="Status Logs"
        subtitle="Write a quick note — AI turns it into a parent update"
        action={
          <button className="btn-primary flex items-center gap-2" onClick={() => setModal(true)} disabled={assignments.length === 0}>
            <Sparkles className="w-4 h-4" /> New log
          </button>
        }
      />

      <motion.div className="card mb-6 bg-gradient-to-r from-amber-50 to-stone-50 border-amber-100 !p-4"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-stone-800">AI enrichment + Amharic translation</p>
            <p className="text-stone-500 mt-0.5 leading-relaxed">
              Your notes are rewritten into warm parent updates. Parents can switch to አማርኛ in the sidebar to read everything in Amharic.
            </p>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}</div>
      ) : logs.length === 0 ? (
        <div className="card">
          <EmptyState icon={ClipboardList} title="No logs yet" body="Submit your first status log to get started."
            action={<button className="btn-primary flex items-center gap-2" onClick={() => setModal(true)}><Sparkles className="w-4 h-4" /> Write first log</button>} />
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <TeacherLogRow key={log._id} log={log} onDelete={id => deleteLog.mutate(id)} />
          ))}
        </div>
      )}

      <CreateLogModal open={modal} onClose={() => setModal(false)} assignments={assignments} />
    </AppShell>
  );
};

export default LogsPage;
