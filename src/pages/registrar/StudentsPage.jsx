import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Edit2, Users, X, Check, Hash, ArrowRightLeft, History } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ProfilePictureUpload from '@/components/ui/ProfilePictureUpload';
import { registrationApi } from '@/api/registration';
import api from '@/api/client';
import { useGrades, useSections } from '@/hooks/useSchool';
import { useTransferStudent, useTransferHistory } from '@/hooks/useTransfers';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { REGISTRAR_NAV } from './nav';
import clsx from 'clsx';

const toAvatar = (pic) => pic ? (pic.startsWith('http') ? pic : `/uploads/profiles/${pic}`) : null;

// ─── Registration Form ────────────────────────────────────────────
const StudentForm = ({ initial, onSave, onClose, grades, sections }) => {
  const [photo, setPhoto]   = useState(null);
  const [form, setForm]     = useState({
    firstName: '', lastName: '', email: '', password: '',
    dateOfBirth: '', address: '', phone: '', familyPhone: '',
    gradeId: '', sectionId: '',
    ...initial,
  });

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const filteredSections = sections.filter(s =>
    (s.gradeId?._id || s.gradeId) === form.gradeId
  );

  const handleSubmit = e => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v && k !== 'gradeId') fd.append(k, v); });
    if (photo) fd.append('profilePicture', photo);
    onSave(fd);
  };

  const Field = ({ label, field, type = 'text', required, placeholder, half }) => (
    <div className={half ? '' : 'sm:col-span-2'}>
      <label className="label">{label}{required && <span className="text-red-400"> *</span>}</label>
      <input type={type} className="input" value={form[field]} onChange={set(field)}
        required={required} placeholder={placeholder} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Photo */}
      <ProfilePictureUpload current={initial?.profilePicture} onChange={setPhoto} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First name"   field="firstName"   required half placeholder="Yonas" />
        <Field label="Last name"    field="lastName"    required half placeholder="Alemu" />
        <Field label="Email"        field="email"       type="email" required placeholder="yonas@school.edu" />
        <Field label="Password"     field="password"    type="password" placeholder={initial ? 'Leave blank to keep' : 'Min. 8 chars'} half />
        <Field label="Date of birth" field="dateOfBirth" type="date" half />
        <Field label="Phone number" field="phone"       placeholder="+251 9..." half />
        <Field label="Family phone" field="familyPhone" placeholder="If no personal phone" half />
        <div className="sm:col-span-2">
          <label className="label">Address</label>
          <input className="input" value={form.address} onChange={set('address')} placeholder="Sub-city, Woreda, House no." />
        </div>

        {/* Grade */}
        <div>
          <label className="label">Grade</label>
          <select className="input" value={form.gradeId} onChange={e => { set('gradeId')(e); setForm(p => ({ ...p, sectionId: '' })); }}>
            <option value="">Select grade…</option>
            {grades.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
        </div>

        {/* Section */}
        <div>
          <label className="label">Section</label>
          <select className="input" value={form.sectionId} onChange={set('sectionId')} disabled={!form.gradeId}>
            <option value="">{form.gradeId ? 'Select section…' : 'Choose grade first'}</option>
            {filteredSections.map(s => <option key={s._id} value={s._id}>Section {s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary flex-1">
          {initial ? 'Save changes' : 'Register student'}
        </button>
      </div>
    </form>
  );
};

// ─── Student card ─────────────────────────────────────────────────
// ─── Transfer Modal ───────────────────────────────────────────────
const TransferModal = ({ student, sections, onClose }) => {
  const [toSectionId, setToSectionId] = useState('');
  const [reason, setReason]           = useState('');
  const [tab, setTab]                 = useState('transfer'); // 'transfer' | 'history'
  const transfer = useTransferStudent();
  const { data: history = [] } = useTransferHistory(student?._id);

  const submit = (e) => {
    e.preventDefault();
    transfer.mutate(
      { studentId: student._id, toSectionId, reason: reason.trim() || undefined },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal open={!!student} onClose={onClose}
      title={`${student?.firstName} ${student?.lastName}`} size="sm">

      {/* Tab toggle */}
      <div className="flex rounded-xl border border-stone-200 overflow-hidden text-sm w-fit mb-4">
        {[['transfer', '↗ Transfer'], ['history', '📋 History']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={clsx('px-4 py-2 transition-colors',
              tab === key ? 'bg-amber-600 text-white font-medium' : 'bg-white text-stone-500 hover:bg-stone-50'
            )}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'transfer' ? (
        <form onSubmit={submit} className="space-y-4">
          {/* Current section */}
          {student?.sectionId && (
            <div className="px-3 py-2 bg-stone-50 rounded-xl text-sm">
              <span className="text-stone-400">Current section: </span>
              <span className="font-semibold text-stone-700">
                {student.sectionId?.gradeId?.name} — Section {student.sectionId?.name}
              </span>
            </div>
          )}

          <div>
            <label className="label">Transfer to</label>
            <select className="input" value={toSectionId}
              onChange={e => setToSectionId(e.target.value)} required>
              <option value="">Select new section…</option>
              {sections
                .filter(s => String(s._id) !== String(student?.sectionId?._id || student?.sectionId))
                .map(s => (
                  <option key={s._id} value={s._id}>
                    {s.gradeId?.name} — Section {s.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="label">Reason <span className="text-stone-400 font-normal">(optional)</span></label>
            <textarea className="input resize-none" rows={2}
              placeholder="e.g. Parent request, class size balancing…"
              value={reason} onChange={e => setReason(e.target.value)}
              maxLength={500} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={transfer.isPending}>
              {transfer.isPending
                ? 'Transferring…'
                : <><ArrowRightLeft className="w-3.5 h-3.5" /> Transfer</>
              }
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-6">No transfer history yet.</p>
          ) : history.map((t, i) => (
            <div key={t._id} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl text-xs">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ArrowRightLeft className="w-3 h-3 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-700">
                  {t.fromSectionId
                    ? <>{t.fromSectionId?.gradeId?.name} Sec {t.fromSectionId?.name} → {t.toSectionId?.gradeId?.name} Sec {t.toSectionId?.name}</>
                    : <>Enrolled in {t.toSectionId?.gradeId?.name} — Section {t.toSectionId?.name}</>
                  }
                </p>
                {t.reason && <p className="text-stone-400 mt-0.5">"{t.reason}"</p>}
                <p className="text-stone-400 mt-0.5">
                  By {t.transferredBy?.firstName} {t.transferredBy?.lastName} · {format(new Date(t.createdAt), 'dd MMM yyyy')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

// ─── Student card ─────────────────────────────────────────────────
const StudentCard = ({ student, onEdit, onTransfer }) => {
  const pic = toAvatar(student.profilePicture);

  return (
    <motion.div className="card flex items-center gap-4 hover:shadow-md transition-shadow" layout
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="w-12 h-12 rounded-2xl bg-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {pic
          ? <img src={pic} alt="" className="w-full h-full object-cover" />
          : <span className="text-sm font-bold text-stone-400">{student.firstName?.[0]}{student.lastName?.[0]}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-900 text-sm">{student.firstName} {student.lastName}</p>
        <p className="text-xs text-stone-400 truncate">{student.email}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {student.studentCode && (
            <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded">{student.studentCode}</span>
          )}
          {student.sectionId && (
            <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded">
              {student.sectionId?.gradeId?.name} · Section {student.sectionId?.name}
            </span>
          )}
          {student.dateOfBirth && (
            <span className="text-[10px] text-stone-400">Age {Math.floor((Date.now() - new Date(student.dateOfBirth)) / (1000*60*60*24*365.25))}</span>
          )}
          <span className={clsx('text-[10px] px-2 py-0.5 rounded-full', student.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500')}>
            {student.isActive ? 'Active' : 'Blocked'}
          </span>
        </div>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button onClick={() => onTransfer(student)} title="Transfer section"
          className="btn-icon text-stone-400 hover:text-sky-600 hover:bg-sky-50">
          <ArrowRightLeft className="w-4 h-4" />
        </button>
        <button onClick={() => onEdit(student)} className="btn-icon">
          <Edit2 className="w-4 h-4 text-stone-400" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────
export default function StudentsPage() {
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const [search,       setSearch]       = useState('');
  const [modal,        setModal]        = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [transferring, setTransferring] = useState(null);

  const { data: grades   = [] } = useGrades();
  const { data: sections = [] } = useSections();

  const { data, isLoading } = useQuery({
    queryKey: ['reg-students', search],
    queryFn: () => registrationApi.getStudents({ search, limit: 100 }).then(r => r.data.data),
    keepPreviousData: true,
  });

  const students = data?.students || [];

  // Auto-open form if ?new=1
  useEffect(() => { if (searchParams.get('new') === '1') setModal(true); }, []);

  const createMutation = useMutation({
    mutationFn: (fd) => registrationApi.createStudent(fd),
    onSuccess: () => { toast.success('Student registered!'); setModal(false); qc.invalidateQueries(['reg-students']); qc.invalidateQueries(['reg-students-count']); },
    onError: e => toast.error(e.response?.data?.message || 'Failed to register.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => registrationApi.updateStudent(id, fd),
    onSuccess: () => { toast.success('Student updated!'); setEditing(null); qc.invalidateQueries(['reg-students']); },
    onError: e => toast.error(e.response?.data?.message || 'Failed to update.'),
  });

  return (
    <AppShell navItems={REGISTRAR_NAV}>
      <PageHeader
        title="Students"
        subtitle={`${data?.total ?? 0} registered students`}
        action={
          <div className="flex gap-2">
            <button
              className="btn-secondary flex items-center gap-2 text-sm"
              onClick={() => api.post('/registration/backfill-codes').then(r => {
                const n = r.data.data.updated;
                toast.success(n > 0 ? `Assigned codes to ${n} student${n > 1 ? 's' : ''}` : 'All students already have codes');
                qc.invalidateQueries({ queryKey: ['students'] });
              }).catch(() => toast.error('Failed to backfill codes'))}
            >
              <Hash className="w-4 h-4" /> Assign missing codes
            </button>
            <button className="btn-primary flex items-center gap-2" onClick={() => setModal(true)}>
              <UserPlus className="w-4 h-4" /> Register student
            </button>
          </div>
        }
      />

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input className="input pl-10" placeholder="Search name, code or email…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}</div>
      ) : students.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-10 h-10 text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400">{search ? 'No students match your search.' : 'No students registered yet.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {students.map(s => <StudentCard key={s._id} student={s} onEdit={setEditing} onTransfer={setTransferring} />)}
          </AnimatePresence>
        </div>
      )}

      {/* Create modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Register New Student" size="lg">
        <StudentForm
          grades={grades} sections={sections}
          onClose={() => setModal(false)}
          onSave={fd => createMutation.mutate(fd)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Student" size="lg">
        {editing && (
          <StudentForm
            initial={{ ...editing, gradeId: editing.sectionId?.gradeId?._id || editing.sectionId?.gradeId || '', sectionId: editing.sectionId?._id || editing.sectionId || '' }}
            grades={grades} sections={sections}
            onClose={() => setEditing(null)}
            onSave={fd => updateMutation.mutate({ id: editing._id, fd })}
          />
        )}
      </Modal>
      <TransferModal
        student={transferring}
        sections={sections}
        onClose={() => setTransferring(null)}
      />
    </AppShell>
  );
}
