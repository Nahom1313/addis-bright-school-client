import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Send, ClipboardList, ChevronDown, CheckCircle, XCircle, Clock, Users, BookOpen, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { useMySection, useMyReports, useSubmitReport } from '@/hooks/useSectionReports';
import { TEACHER_NAV } from './nav';
import clsx from 'clsx';

const TERMS = ['Term 1', 'Term 2', 'Term 3', 'Semester 1', 'Semester 2', 'Final'];

const pctColor = (pct) => {
  if (pct === null) return 'text-stone-300';
  if (pct >= 80) return 'text-green-600';
  if (pct >= 60) return 'text-amber-600';
  if (pct >= 50) return 'text-orange-500';
  return 'text-red-500';
};

const StatusBadge = ({ status }) => {
  const map = {
    pending:  { icon: Clock,        label: 'Pending review', cls: 'bg-amber-50 text-amber-700' },
    approved: { icon: CheckCircle,  label: 'Approved',       cls: 'bg-green-50 text-green-700' },
    rejected: { icon: XCircle,      label: 'Rejected',       cls: 'bg-red-50 text-red-600' },
  };
  const { icon: Icon, label, cls } = map[status] || map.pending;
  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full', cls)}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
};

// ─── Submit report modal ──────────────────────────────────────────
const SubmitModal = ({ open, onClose, section }) => {
  const [term, setTerm]   = useState(TERMS[0]);
  const [note, setNote]   = useState('');
  const submit = useSubmitReport();

  const handleSubmit = (e) => {
    e.preventDefault();
    submit.mutate({ term, note: note.trim() || undefined }, { onSuccess: () => { onClose(); setNote(''); } });
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit Section Report" size="sm">
      <p className="text-sm text-stone-500 mb-4">
        This will snapshot all current marks and attendance for{' '}
        <span className="font-semibold text-stone-700">
          {section?.gradeId?.name} — Section {section?.name}
        </span>{' '}
        and send it to the registrar for review.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Term</label>
          <select className="input" value={term} onChange={e => setTerm(e.target.value)}>
            {TERMS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Note to registrar <span className="text-stone-400 font-normal">(optional)</span></label>
          <textarea className="input resize-none" rows={3}
            placeholder="Any context or comments for the registrar…"
            value={note} onChange={e => setNote(e.target.value)} maxLength={1000} />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2"
            disabled={submit.isPending}>
            {submit.isPending
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
              : <><Send className="w-3.5 h-3.5" /> Submit report</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Page ─────────────────────────────────────────────────────────
export default function ClassLeaderPage() {
  const [tab, setTab]       = useState('leaderboard'); // 'leaderboard' | 'marks' | 'history'
  const [modal, setModal]   = useState(false);
  const [expanded, setExpanded] = useState(null);

  const { data, isLoading, isError } = useMySection();
  const { data: myReports = [] }     = useMyReports();

  const section  = data?.section;
  const students = data?.students || [];

  if (isLoading) return (
    <AppShell navItems={TEACHER_NAV}>
      <div className="space-y-3 mt-6">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
      </div>
    </AppShell>
  );

  if (isError || !section) return (
    <AppShell navItems={TEACHER_NAV}>
      <PageHeader title="Class Leader" subtitle="Section overview and report submission" />
      <div className="card">
        <EmptyState icon={Users} title="Not a class leader"
          body="You have not been assigned as a class leader of any section. Contact the registrar." />
      </div>
    </AppShell>
  );

  return (
    <AppShell navItems={TEACHER_NAV}>
      <PageHeader
        title="Class Leader"
        subtitle={`${section.gradeId?.name} — Section ${section.name}`}
        action={
          <button className="btn-primary flex items-center gap-2" onClick={() => setModal(true)}>
            <Send className="w-4 h-4" /> Submit report
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          [Users,        'Students',         students.length],
          [BookOpen,     'Avg class score',  students.length ? `${Math.round(students.filter(s => s.avgPct !== null).reduce((sum, s) => sum + s.avgPct, 0) / (students.filter(s => s.avgPct !== null).length || 1))}%` : '—'],
          [ClipboardList,'Reports submitted', myReports.length],
        ].map(([Icon, label, value]) => (
          <div key={label} className="card flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-amber-700" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-stone-400 truncate">{label}</p>
              <p className="font-bold text-stone-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-stone-200 overflow-hidden text-sm w-fit mb-5">
        {[['leaderboard', '🏆 Leaderboard'], ['marks', '📊 All Marks'], ['history', '📋 Report History']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={clsx('px-4 py-2 transition-colors whitespace-nowrap',
              tab === key ? 'bg-amber-600 text-white font-medium' : 'bg-white text-stone-500 hover:bg-stone-50'
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* Leaderboard tab */}
      {tab === 'leaderboard' && (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="text-left px-5 py-3 section-label">Rank</th>
                <th className="text-left px-5 py-3 section-label">Student</th>
                <th className="text-left px-5 py-3 section-label">Avg Score</th>
                <th className="text-left px-5 py-3 section-label">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <motion.tr key={String(s._id)} className={clsx('border-b border-stone-50 last:border-0', i < 3 && 'bg-amber-50/30')}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <td className="px-5 py-3.5">
                    <span className={clsx('font-bold text-lg', i === 0 && 'text-amber-500', i === 1 && 'text-stone-400', i === 2 && 'text-amber-700')}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${s.rank}`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-stone-800">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-stone-400">{s.studentCode}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={clsx('text-xl font-bold', pctColor(s.avgPct))}>
                      {s.avgPct !== null ? `${s.avgPct}%` : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-stone-600">
                    {s.attendanceTotal > 0
                      ? `${s.attendantDays}/${s.attendanceTotal} days (${Math.round((s.attendantDays / s.attendanceTotal) * 100)}%)`
                      : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {/* All marks tab */}
      {tab === 'marks' && (
        <div className="space-y-3">
          <AnimatePresence>
            {students.map((s) => (
              <motion.div key={String(s._id)} className="card !p-0 overflow-hidden"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors"
                  onClick={() => setExpanded(expanded === String(s._id) ? null : String(s._id))}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600">
                      #{s.rank}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-stone-800 text-sm">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-stone-400">{s.marks.length} mark{s.marks.length !== 1 ? 's' : ''} recorded</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={clsx('font-bold text-lg', pctColor(s.avgPct))}>
                      {s.avgPct !== null ? `${s.avgPct}%` : '—'}
                    </span>
                    <ChevronDown className={clsx('w-4 h-4 text-stone-400 transition-transform', expanded === String(s._id) && 'rotate-180')} />
                  </div>
                </button>
                {expanded === String(s._id) && (
                  <div className="border-t border-stone-100 px-5 pb-4 pt-2">
                    {s.marks.length === 0 ? (
                      <p className="text-sm text-stone-400 py-2">No marks recorded yet.</p>
                    ) : (
                      <div className="overflow-x-auto"><table className="w-full text-xs mt-2">
                        <thead>
                          <tr className="text-stone-400 font-semibold">
                            <th className="text-left py-1.5">Subject</th>
                            <th className="text-left py-1.5">Score</th>
                            <th className="text-left py-1.5">%</th>
                            <th className="text-left py-1.5">Term</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.marks.map((m, i) => (
                            <tr key={i} className="border-t border-stone-50">
                              <td className="py-1.5 font-medium text-stone-700">{m.subject}</td>
                              <td className="py-1.5 text-stone-600">{m.score}/{m.maxScore}</td>
                              <td className={clsx('py-1.5 font-bold', pctColor(Math.round((m.score/m.maxScore)*100)))}>
                                {Math.round((m.score/m.maxScore)*100)}%
                              </td>
                              <td className="py-1.5 text-stone-400">{m.term}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table></div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Report history tab */}
      {tab === 'history' && (
        <div className="space-y-3">
          {myReports.length === 0 ? (
            <div className="card">
              <EmptyState icon={ClipboardList} title="No reports submitted yet"
                body="Submit a report to send your section's performance data to the registrar." />
            </div>
          ) : myReports.map(r => (
            <div key={r._id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-stone-800">{r.term}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-stone-400">
                    Submitted {format(new Date(r.createdAt), 'dd MMM yyyy')} ·{' '}
                    {r.students.length} students
                  </p>
                  {r.feedback && (
                    <div className={clsx('mt-3 rounded-xl px-3 py-2 text-sm',
                      r.status === 'approved' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700')}>
                      <span className="font-semibold">Registrar feedback: </span>{r.feedback}
                    </div>
                  )}
                </div>
                {r.reviewedBy && (
                  <p className="text-xs text-stone-400 flex-shrink-0">
                    Reviewed by {r.reviewedBy.firstName} {r.reviewedBy.lastName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <SubmitModal open={modal} onClose={() => setModal(false)} section={section} />
    </AppShell>
  );
}
