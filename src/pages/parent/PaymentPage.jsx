import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Copy, CheckCheck, Building2, Upload, Image as ImageIcon, X, Clock, CheckCircle2, XCircle, Trash2, Loader2, FileText } from 'lucide-react';
import { useState, useRef } from 'react';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import { useSchoolInfo } from '@/hooks/useSchool';
import { useMe } from '@/hooks/useAuth';
import { useMyPayments, useSubmitPayment, useDeletePayment } from '@/hooks/usePayments';
import { PARENT_NAV } from './nav';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import clsx from 'clsx';

const CopyButton = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const Icon = copied ? CheckCheck : Copy;
  return (
    <button onClick={copy} className={`btn-icon ${copied ? 'text-emerald-600' : 'text-stone-400'}`}>
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
};

const BankCard = ({ account, i }) => (
  <motion.div
    className="card border border-stone-100"
    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
        <CreditCard className="w-5 h-5 text-amber-700" />
      </div>
      <div>
        <p className="font-semibold text-stone-800">{account.bankName}</p>
        {account.branch && <p className="text-xs text-stone-400">{account.branch}</p>}
      </div>
    </div>

    <div className="space-y-3 text-sm">
      <div>
        <p className="text-xs text-stone-400 mb-0.5">Account name</p>
        <p className="font-medium text-stone-700">{account.accountName}</p>
      </div>
      <div>
        <p className="text-xs text-stone-400 mb-0.5">Account number</p>
        <div className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2">
          <span className="font-mono font-semibold text-stone-800 flex-1 tracking-wide">{account.accountNumber}</span>
          <CopyButton value={account.accountNumber} />
        </div>
      </div>
      {account.notes && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">{account.notes}</p>
      )}
    </div>
  </motion.div>
);

// ─── Status badge ───────────────────────────────────────────────────
const STATUS_STYLE = {
  pending:  { label: 'Pending review', icon: Clock,       cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  approved: { label: 'Approved',       icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  rejected: { label: 'Rejected',       icon: XCircle,      cls: 'bg-red-50 text-red-700 border-red-100' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  const Icon = s.icon;
  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border', s.cls)}>
      <Icon className="w-3.5 h-3.5" /> {s.label}
    </span>
  );
};

const API_BASE = import.meta.env.VITE_API_URL || '';
const fileUrl = (path) => (path?.startsWith('http') ? path : `${API_BASE}${path}`);

// ─── Upload form ──────────────────────────────────────────────────
const UploadForm = ({ students, currency }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [studentId, setStudentId] = useState(students?.[0]?._id || '');
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [paidOn, setPaidOn] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');

  const submitMutation = useSubmitPayment();

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(f.type)) {
      toast.error('Please upload a JPEG, PNG, WebP, or PDF file.');
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.error('File is too large — max 8MB.');
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null); // PDF — no thumbnail
    }
  };

  const reset = () => {
    setFile(null); setPreview(null); setAmount(''); setBankName(''); setNote('');
    setPaidOn(format(new Date(), 'yyyy-MM-dd'));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please attach a screenshot or photo of your receipt.');
    if (!studentId) return toast.error('Please select which child this payment is for.');
    if (!amount || Number(amount) <= 0) return toast.error('Please enter the amount you paid.');
    if (!bankName.trim()) return toast.error('Please enter which bank you paid through.');
    if (!paidOn) return toast.error('Please enter the date you paid.');

    const fd = new FormData();
    fd.append('screenshot', file);
    fd.append('studentId', studentId);
    fd.append('amount', amount);
    fd.append('bankName', bankName.trim());
    fd.append('paidOn', paidOn);
    if (note.trim()) fd.append('note', note.trim());

    submitMutation.mutate(fd, { onSuccess: reset });
  };

  return (
    <form onSubmit={handleSubmit} className="card border border-stone-100">
      <h3 className="font-bold text-stone-900 mb-1">Upload payment proof</h3>
      <p className="text-sm text-stone-400 mb-5">
        Pay through any bank you prefer, then upload a screenshot or photo of the receipt here for the registrar to confirm.
      </p>

      {/* File dropzone */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {!file ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-stone-200 rounded-2xl py-8 flex flex-col items-center gap-2 text-stone-400 hover:border-amber-300 hover:text-amber-600 transition-colors"
          >
            <Upload className="w-6 h-6" />
            <span className="text-sm font-medium">Tap to attach a screenshot or photo</span>
            <span className="text-xs">JPEG, PNG, WebP, or PDF — up to 8MB</span>
          </button>
        ) : (
          <div className="relative border border-stone-100 rounded-2xl p-3 flex items-center gap-3">
            {preview ? (
              <img src={preview} alt="Receipt preview" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-stone-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-stone-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-700 truncate">{file.name}</p>
              <p className="text-xs text-stone-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <button type="button" onClick={() => { setFile(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="btn-icon text-stone-400 hover:text-red-500 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {students?.length > 1 && (
          <div className="sm:col-span-2">
            <label className="label">Which child is this for?</label>
            <select className="input" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label">Amount paid {currency ? `(${currency})` : ''}</label>
          <input type="number" min="0" step="0.01" className="input" placeholder="0.00"
            value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>

        <div>
          <label className="label">Bank you paid through</label>
          <input type="text" className="input" placeholder="e.g. Commercial Bank of Ethiopia"
            value={bankName} onChange={(e) => setBankName(e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className="label">Date you paid</label>
          <input type="date" className="input" max={format(new Date(), 'yyyy-MM-dd')}
            value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className="label">Note (optional)</label>
          <textarea className="input resize-none" rows={2} placeholder="Anything the registrar should know"
            value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>

      <button type="submit" disabled={submitMutation.isPending} className="btn-primary w-full flex items-center justify-center gap-2">
        {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {submitMutation.isPending ? 'Submitting…' : 'Submit for review'}
      </button>
    </form>
  );
};

// ─── Submission history ─────────────────────────────────────────────
const PaymentHistory = () => {
  const { data: payments = [], isLoading } = useMyPayments();
  const deleteMutation = useDeletePayment();
  const [lightbox, setLightbox] = useState(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  if (!payments.length) {
    return (
      <div className="card text-center py-12 text-stone-400">
        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No payment receipts submitted yet</p>
      </div>
    );
  }

  const isImage = (name) => !/\.pdf$/i.test(name || '');

  return (
    <>
      <div className="space-y-3">
        {payments.map((p) => (
          <motion.div key={p._id} className="card border border-stone-100 flex items-center gap-3"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <button
              type="button"
              onClick={() => isImage(p.screenshotName) && setLightbox(p)}
              className="w-14 h-14 rounded-xl bg-stone-50 flex items-center justify-center flex-shrink-0 overflow-hidden"
            >
              {isImage(p.screenshotName) ? (
                <img src={fileUrl(p.screenshotUrl)} alt="Receipt" className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-6 h-6 text-stone-300" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-stone-800 text-sm">
                  {p.amount?.toLocaleString()} {p.currency}
                </p>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {p.bankName} · Paid {format(new Date(p.paidOn), 'MMM d, yyyy')}
                {p.studentId && <> · For {p.studentId.firstName} {p.studentId.lastName}</>}
              </p>
              {p.status === 'rejected' && p.reviewNote && (
                <p className="text-xs text-red-600 mt-1">Reason: {p.reviewNote}</p>
              )}
            </div>

            {p.status === 'pending' && (
              <button
                onClick={() => { if (confirm('Remove this submission?')) deleteMutation.mutate(p._id); }}
                className="btn-icon text-stone-300 hover:text-red-500 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={fileUrl(lightbox.screenshotUrl)}
              alt="Receipt"
              className="max-w-full max-h-full rounded-xl"
              initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white/80 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Main page ────────────────────────────────────────────────────
const PaymentPage = () => {
  const { data: info, isLoading } = useSchoolInfo();
  const { data: me } = useMe();
  const students = me?.studentIds || [];

  return (
    <AppShell navItems={PARENT_NAV}>
      <PageHeader title="Payment Information" subtitle="Bank accounts for manual tuition transfers" />

      {/* Tuition amount */}
      {info?.tuitionAmount && (
        <motion.div className="card mb-6 bg-amber-50 border-amber-100" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <div>
              <p className="text-sm text-stone-600">Current tuition amount</p>
              <p className="text-2xl font-bold text-stone-900 font-display">
                {info.tuitionAmount.toLocaleString()} <span className="text-base font-normal text-stone-500">{info.currency}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="card-sm border border-stone-100 mb-6 bg-stone-50">
        <p className="text-sm text-stone-600 leading-relaxed">
          Pay tuition to any of the accounts below from your own bank (transfer, mobile banking, or in person), then upload a screenshot or photo of the receipt below. The registrar will review and confirm it.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[1, 2].map((i) => <div key={i} className="h-44 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {(info?.bankAccounts || []).map((account, i) => <BankCard key={i} account={account} i={i} />)}
          {!info?.bankAccounts?.length && (
            <div className="card text-center py-12 col-span-2 text-stone-400">
              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Payment information not yet configured</p>
            </div>
          )}
        </div>
      )}

      <div className="mb-8">
        <UploadForm students={students} currency={info?.currency} />
      </div>

      <h3 className="font-bold text-stone-900 mb-3">Your submissions</h3>
      <PaymentHistory />
    </AppShell>
  );
};

export default PaymentPage;
