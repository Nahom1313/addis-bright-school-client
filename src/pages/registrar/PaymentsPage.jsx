import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle2, XCircle, Clock, FileText, X, Loader2 } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import { useAllPayments, useReviewPayment } from '@/hooks/usePayments';
import { REGISTRAR_NAV } from './nav';
import { format } from 'date-fns';
import clsx from 'clsx';

const API_BASE = import.meta.env.VITE_API_URL || '';
const fileUrl = (path) => (path?.startsWith('http') ? path : `${API_BASE}${path}`);
const isImage = (name) => !/\.pdf$/i.test(name || '');

const TABS = [
  { key: 'pending',  label: 'Pending',  icon: Clock },
  { key: 'approved', label: 'Approved', icon: CheckCircle2 },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
  { key: 'all',      label: 'All',      icon: CreditCard },
];

// ─── Review modal ───────────────────────────────────────────────────
const ReviewModal = ({ payment, onClose }) => {
  const [reviewNote, setReviewNote] = useState('');
  const reviewMutation = useReviewPayment();

  if (!payment) return null;

  const act = (status) => {
    if (status === 'rejected' && !reviewNote.trim()) {
      // Let them proceed without a note, but nudge — a note helps the parent.
    }
    reviewMutation.mutate({ id: payment._id, status, reviewNote: reviewNote.trim() }, {
      onSuccess: onClose,
    });
  };

  return (
    <Modal open={!!payment} onClose={onClose} title="Review payment receipt" size="lg">
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Receipt preview */}
        <div className="sm:w-64 flex-shrink-0">
          {isImage(payment.screenshotName) ? (
            <img src={fileUrl(payment.screenshotUrl)} alt="Receipt" className="w-full rounded-xl border border-stone-100" />
          ) : (
            <a href={fileUrl(payment.screenshotUrl)} target="_blank" rel="noreferrer"
              className="w-full h-48 rounded-xl border border-stone-100 bg-stone-50 flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-amber-600">
              <FileText className="w-8 h-8" />
              <span className="text-xs font-medium">Open PDF receipt</span>
            </a>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-3 text-sm">
          <div>
            <p className="text-xs text-stone-400">Parent</p>
            <p className="font-medium text-stone-800">{payment.parentId?.firstName} {payment.parentId?.lastName}</p>
            <p className="text-xs text-stone-400">{payment.parentId?.email} {payment.parentId?.phone && `· ${payment.parentId.phone}`}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400">Student</p>
            <p className="font-medium text-stone-800">
              {payment.studentId?.firstName} {payment.studentId?.lastName}
              {payment.studentId?.studentCode && <span className="text-stone-400 font-normal"> · {payment.studentId.studentCode}</span>}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-stone-400">Amount</p>
              <p className="font-semibold text-stone-800">{payment.amount?.toLocaleString()} {payment.currency}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400">Bank</p>
              <p className="font-medium text-stone-800">{payment.bankName}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400">Date paid</p>
              <p className="font-medium text-stone-800">{format(new Date(payment.paidOn), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400">Submitted</p>
              <p className="font-medium text-stone-800">{format(new Date(payment.createdAt), 'MMM d, yyyy')}</p>
            </div>
          </div>
          {payment.note && (
            <div>
              <p className="text-xs text-stone-400">Parent's note</p>
              <p className="text-stone-700">{payment.note}</p>
            </div>
          )}

          {payment.status === 'pending' ? (
            <div className="pt-2">
              <label className="label">Review note (optional, shown to parent if rejecting)</label>
              <textarea className="input resize-none mb-3" rows={2}
                value={reviewNote} onChange={(e) => setReviewNote(e.target.value)}
                placeholder="e.g. Amount doesn't match — please re-check" />
              <div className="flex gap-3">
                <button onClick={() => act('rejected')} disabled={reviewMutation.isPending}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 text-red-600">
                  {reviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reject
                </button>
                <button onClick={() => act('approved')} disabled={reviewMutation.isPending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {reviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Approve
                </button>
              </div>
            </div>
          ) : (
            <div className={clsx('rounded-xl px-3 py-2 text-sm',
              payment.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
              {payment.status === 'approved' ? 'Approved' : 'Rejected'} by {payment.reviewedBy?.firstName} {payment.reviewedBy?.lastName} on {format(new Date(payment.reviewedAt), 'MMM d, yyyy')}
              {payment.reviewNote && <p className="mt-1 font-normal">Note: {payment.reviewNote}</p>}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ─── Status pill (list row) ─────────────────────────────────────────
const STATUS_STYLE = {
  pending:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-100' },
};

const StatusPill = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  return <span className={clsx('text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0', s.cls)}>{s.label}</span>;
};

// ─── Main page ────────────────────────────────────────────────────
export default function RegistrarPaymentsPage() {
  const [tab, setTab] = useState('pending');
  const [selected, setSelected] = useState(null);
  const { data: payments = [], isLoading } = useAllPayments(tab);

  return (
    <AppShell navItems={REGISTRAR_NAV}>
      <PageHeader title="Payments" subtitle="Review parent-submitted tuition payment receipts" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={clsx('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                active ? 'bg-amber-600 text-white' : 'bg-stone-50 text-stone-500 hover:bg-stone-100')}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : !payments.length ? (
        <div className="card text-center py-16 text-stone-400">
          <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No {tab !== 'all' ? tab : ''} payment receipts</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {payments.map((p) => (
              <motion.button
                key={p._id}
                onClick={() => setSelected(p)}
                className="w-full card border border-stone-100 flex items-center gap-3 text-left hover:border-amber-200 transition-colors"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {isImage(p.screenshotName) ? (
                    <img src={fileUrl(p.screenshotUrl)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-5 h-5 text-stone-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-stone-800 text-sm truncate">
                      {p.studentId?.firstName} {p.studentId?.lastName}
                    </p>
                    <StatusPill status={p.status} />
                  </div>
                  <p className="text-xs text-stone-400 truncate">
                    {p.parentId?.firstName} {p.parentId?.lastName} · {p.amount?.toLocaleString()} {p.currency} · {p.bankName}
                  </p>
                </div>
                <p className="text-xs text-stone-300 flex-shrink-0">{format(new Date(p.createdAt), 'MMM d')}</p>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ReviewModal payment={selected} onClose={() => setSelected(null)} />
    </AppShell>
  );
}
