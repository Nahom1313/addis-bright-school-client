import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { format } from 'date-fns';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { useAllReports, useReviewReport } from '@/hooks/useSectionReports';
import { REGISTRAR_NAV } from './nav';
import clsx from 'clsx';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

const StatusBadge = ({ status }) => {
  const map = {
    pending:  { icon: Clock,       label: 'Pending',  cls: 'bg-amber-50 text-amber-700' },
    approved: { icon: CheckCircle, label: 'Approved', cls: 'bg-green-50 text-green-700' },
    rejected: { icon: XCircle,     label: 'Rejected', cls: 'bg-red-50 text-red-600' },
  };
  const { icon: Icon, label, cls } = map[status] || map.pending;
  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full', cls)}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
};

const pctColor = (pct) => {
  if (pct === null || pct === undefined) return 'text-stone-300';
  if (pct >= 80) return 'text-green-600';
  if (pct >= 60) return 'text-amber-600';
  if (pct >= 50) return 'text-orange-500';
  return 'text-red-500';
};

// ─── Review modal ─────────────────────────────────────────────────
const ReviewModal = ({ report, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const review = useReviewReport();

  const submit = (status) => {
    review.mutate({ id: report._id, status, feedback: feedback.trim() || undefined }, { onSuccess: onClose });
  };

  return (
    <Modal open={!!report} onClose={onClose} title="Review Report" size="md">
      <div className="mb-4 p-3 bg-stone-50 rounded-xl text-sm">
        <p className="font-semibold text-stone-800">
          {report?.sectionId?.gradeId?.name} — Section {report?.sectionId?.name}
        </p>
        <p className="text-stone-500 text-xs mt-0.5">
          {report?.term} · Submitted by {report?.classLeaderId?.firstName} {report?.classLeaderId?.lastName} · {report?.students?.length} students
        </p>
        {report?.note && <p className="text-stone-600 mt-2 text-xs italic">"{report.note}"</p>}
      </div>

      {/* Students snapshot preview */}
      <div className="max-h-48 overflow-y-auto overflow-x-auto mb-4 rounded-xl border border-stone-100">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="text-left px-3 py-2 text-stone-400 font-semibold">Rank</th>
              <th className="text-left px-3 py-2 text-stone-400 font-semibold">Student</th>
              <th className="text-left px-3 py-2 text-stone-400 font-semibold">Avg</th>
              <th className="text-left px-3 py-2 text-stone-400 font-semibold">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {report?.students?.map((s, i) => (
              <tr key={i} className="border-b border-stone-50 last:border-0">
                <td className="px-3 py-2 font-bold text-stone-500">#{s.rank}</td>
                <td className="px-3 py-2 font-medium text-stone-700">{s.firstName} {s.lastName}</td>
                <td className={clsx('px-3 py-2 font-bold', pctColor(s.avgPct))}>
                  {s.avgPct !== null ? `${s.avgPct}%` : '—'}
                </td>
                <td className="px-3 py-2 text-stone-500">
                  {s.attendanceTotal > 0 ? `${s.attendantDays}/${s.attendanceTotal}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <label className="label">Feedback <span className="text-stone-400 font-normal">(optional)</span></label>
        <textarea className="input resize-none" rows={3}
          placeholder="Add comments or instructions for the class leader…"
          value={feedback} onChange={e => setFeedback(e.target.value)} maxLength={1000} />
      </div>

      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
        <button
          onClick={() => submit('rejected')}
          disabled={review.isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
          <XCircle className="w-4 h-4" /> Reject
        </button>
        <button
          onClick={() => submit('approved')}
          disabled={review.isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-green-600 text-white hover:bg-green-700 transition-colors">
          <CheckCircle className="w-4 h-4" /> Approve
        </button>
      </div>
    </Modal>
  );
};

// ─── Page ─────────────────────────────────────────────────────────
export default function SectionReportsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewing, setReviewing]       = useState(null);
  const [expanded, setExpanded]         = useState(null);

  const { data: reports = [], isLoading } = useAllReports(statusFilter === 'all' ? null : statusFilter);

  const pending = reports.filter(r => r.status === 'pending').length;

  return (
    <AppShell navItems={REGISTRAR_NAV}>
      <PageHeader
        title="Section Reports"
        subtitle={pending > 0 ? `${pending} report${pending > 1 ? 's' : ''} awaiting review` : 'All reports reviewed'}
      />

      {/* Status filter */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl w-fit mb-5">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all',
              statusFilter === s ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'
            )}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="card">
          <EmptyState icon={ClipboardList} title="No reports yet"
            body="Class leaders haven't submitted any reports yet." />
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r, i) => (
            <motion.div key={r._id} className="card !p-0 overflow-hidden"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-stone-800">
                        {r.sectionId?.gradeId?.name} — Section {r.sectionId?.name}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-stone-400">
                      {r.term} · By {r.classLeaderId?.firstName} {r.classLeaderId?.lastName} ·{' '}
                      {format(new Date(r.createdAt), 'dd MMM yyyy')} ·{' '}
                      <span className="flex-shrink-0 inline-flex items-center gap-1">
                        <Users className="w-3 h-3" /> {r.students?.length} students
                      </span>
                    </p>
                    {r.feedback && (
                      <p className="text-xs mt-1.5 text-stone-500 italic">Feedback: "{r.feedback}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {r.status === 'pending' && (
                      <button className="btn-primary text-xs py-1.5 px-3" onClick={() => setReviewing(r)}>
                        Review
                      </button>
                    )}
                    <button
                      onClick={() => setExpanded(expanded === r._id ? null : r._id)}
                      className="btn-icon text-stone-400">
                      {expanded === r._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded student detail */}
              {expanded === r._id && (
                <div className="border-t border-stone-100 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-stone-50">
                        <th className="text-left px-4 py-2.5 text-stone-400 font-semibold">Rank</th>
                        <th className="text-left px-4 py-2.5 text-stone-400 font-semibold">Student</th>
                        <th className="text-left px-4 py-2.5 text-stone-400 font-semibold">Avg</th>
                        <th className="text-left px-4 py-2.5 text-stone-400 font-semibold">Subjects</th>
                        <th className="text-left px-4 py-2.5 text-stone-400 font-semibold">Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.students?.map((s, idx) => (
                        <tr key={idx} className="border-t border-stone-50">
                          <td className="px-4 py-2.5 font-bold text-stone-500">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${s.rank}`}
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-stone-700">{s.firstName} {s.lastName}</p>
                            <p className="text-stone-400">{s.studentCode}</p>
                          </td>
                          <td className={clsx('px-4 py-2.5 font-bold text-sm', pctColor(s.avgPct))}>
                            {s.avgPct !== null ? `${s.avgPct}%` : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-stone-500">{s.marks?.length || 0} recorded</td>
                          <td className="px-4 py-2.5 text-stone-500">
                            {s.attendanceTotal > 0
                              ? `${s.attendantDays}/${s.attendanceTotal}`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {reviewing && <ReviewModal report={reviewing} onClose={() => setReviewing(null)} />}
    </AppShell>
  );
}
