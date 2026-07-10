import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Edit2, GraduationCap, Plus, X, Crown } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ProfilePictureUpload from '@/components/ui/ProfilePictureUpload';
import { registrationApi } from '@/api/registration';
import { useGrades, useSections } from '@/hooks/useSchool';
import { useAssignLeader } from '@/hooks/useSectionReports';
import toast from 'react-hot-toast';
import { REGISTRAR_NAV } from './nav';
import clsx from 'clsx';

const toAvatar = (pic) => pic ? (pic.startsWith('http') ? pic : `/uploads/profiles/${pic}`) : null;

const SUBJECTS = ['Mathematics','English','Amharic','Science','Biology','Chemistry','Physics','History','Geography','Civics','Art','Physical Education','ICT'];

// ─── Assignment builder ───────────────────────────────────────────
const AssignmentBuilder = ({ assignments, onChange, grades, sections }) => {
  const add = () => onChange([...assignments, { subject: '', gradeId: '', sectionId: '' }]);
  const remove = i => onChange(assignments.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const next = [...assignments];
    next[i] = { ...next[i], [field]: val };
    if (field === 'gradeId') next[i].sectionId = '';
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {assignments.map((a, i) => {
        const filteredSecs = sections.filter(s => (s.gradeId?._id || s.gradeId) === a.gradeId);
        return (
          <div key={i} className="flex gap-2 items-center">
            <select className="input flex-1" value={a.subject} onChange={e => update(i, 'subject', e.target.value)}>
              <option value="">Subject…</option>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="input flex-1" value={a.gradeId} onChange={e => update(i, 'gradeId', e.target.value)}>
              <option value="">Grade…</option>
              {grades.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
            <select className="input flex-1" value={a.sectionId} onChange={e => update(i, 'sectionId', e.target.value)} disabled={!a.gradeId}>
              <option value="">Section…</option>
              {filteredSecs.map(s => <option key={s._id} value={s._id}>Sec {s.name}</option>)}
            </select>
            <button type="button" onClick={() => remove(i)} className="btn-icon text-red-400 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      <button type="button" onClick={add}
        className="flex items-center gap-2 text-xs text-amber-700 hover:text-amber-800 font-medium mt-1">
        <Plus className="w-3.5 h-3.5" /> Add subject assignment
      </button>
    </div>
  );
};

// ─── Teacher Form ─────────────────────────────────────────────────
const TeacherForm = ({ initial, onSave, onClose, grades, sections }) => {
  const [photo, setPhoto]           = useState(null);
  const [assignments, setAssignments] = useState(initial?.assignments?.map(a => ({
    subject: a.subject,
    gradeId: a.sectionId?.gradeId?._id || a.sectionId?.gradeId || '',
    sectionId: a.sectionId?._id || a.sectionId || '',
  })) || []);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    dateOfBirth: '', address: '', phone: '',
    ...initial,
  });

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    // Only include complete assignments
    const valid = assignments.filter(a => a.subject && a.sectionId);
    if (valid.length) fd.append('assignments', JSON.stringify(valid));
    if (photo) fd.append('profilePicture', photo);
    onSave(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ProfilePictureUpload current={initial?.profilePicture} onChange={setPhoto} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[['firstName','First name','Almaz',true],['lastName','Last name','Bekele',true],
          ['email','Email','teacher@school.edu',true],['password','Password','',false],
          ['dateOfBirth','Date of birth','',false,'date'],['phone','Phone number','+251 9...',false],
          ['address','Address','',false]].map(([field, label, placeholder, req, type='text']) => (
          <div key={field} className={field === 'address' ? 'sm:col-span-2' : ''}>
            <label className="label">{label}{req && <span className="text-red-400"> *</span>}</label>
            <input type={type} className="input" value={form[field] || ''} onChange={set(field)}
              required={req} placeholder={placeholder} />
          </div>
        ))}
      </div>

      <div>
        <label className="label">Subject assignments</label>
        <p className="text-xs text-stone-400 mb-2">Add what this teacher will teach, in which grade and section</p>
        <AssignmentBuilder assignments={assignments} onChange={setAssignments} grades={grades} sections={sections} />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary flex-1">{initial ? 'Save changes' : 'Register teacher'}</button>
      </div>
    </form>
  );
};

// ─── Assign Class Leader Modal ────────────────────────────────────
const AssignLeaderModal = ({ teacher, sections, onClose }) => {
  const [sectionId, setSectionId] = useState('');
  const assign = useAssignLeader();

  const submit = (e) => {
    e.preventDefault();
    assign.mutate({ sectionId, teacherId: teacher._id }, { onSuccess: onClose });
  };

  return (
    <Modal open={!!teacher} onClose={onClose} title="Assign as Class Leader" size="sm">
      <p className="text-sm text-stone-500 mb-4">
        Assign <span className="font-semibold text-stone-700">{teacher?.firstName} {teacher?.lastName}</span> as the class leader of a section.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Section</label>
          <select className="input" value={sectionId} onChange={e => setSectionId(e.target.value)} required>
            <option value="">Select a section…</option>
            {sections.map(s => (
              <option key={s._id} value={s._id}>
                {s.gradeId?.name || 'Grade'} — Section {s.name}
                {s.classLeaderId ? ` (currently: ${s.classLeaderId.firstName || 'assigned'})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2"
            disabled={assign.isPending}>
            <Crown className="w-3.5 h-3.5" /> Assign leader
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Teacher card ─────────────────────────────────────────────────
const TeacherCard = ({ teacher, onEdit, onAssignLeader }) => {
  const pic = toAvatar(teacher.profilePicture);
  const subjects = [...new Set((teacher.assignments || []).map(a => a.subject))];
  return (
    <motion.div className="card hover:shadow-md transition-shadow" layout
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {pic ? <img src={pic} alt="" className="w-full h-full object-cover" />
               : <span className="text-sm font-bold text-violet-600">{teacher.firstName?.[0]}{teacher.lastName?.[0]}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-stone-900 text-sm">{teacher.firstName} {teacher.lastName}</p>
          </div>
          <p className="text-xs text-stone-400 truncate">{teacher.email}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onAssignLeader(teacher)} title="Set as class leader"
            className="btn-icon text-amber-400 hover:text-amber-600 hover:bg-amber-50">
            <Crown className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(teacher)} className="btn-icon flex-shrink-0">
            <Edit2 className="w-4 h-4 text-stone-400" />
          </button>
        </div>
      </div>
      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {subjects.map(s => (
            <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">{s}</span>
          ))}
        </div>
      )}
      {teacher.assignments?.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {teacher.assignments.map((a, i) => (
            <p key={i} className="text-[11px] text-stone-400">
              {a.subject} · {a.sectionId?.gradeId?.name} Section {a.sectionId?.name}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────
export default function TeachersPage() {
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const [search, setSearch]         = useState('');
  const [modal, setModal]           = useState(false);
  const [editing, setEditing]       = useState(null);
  const [assigningLeader, setAssigningLeader] = useState(null);
  const { data: grades = [] }   = useGrades();
  const { data: sections = [] } = useSections();

  useEffect(() => { if (searchParams.get('new') === '1') setModal(true); }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['reg-teachers', search],
    queryFn: () => registrationApi.getTeachers({ search, limit: 100 }).then(r => r.data.data),
    keepPreviousData: true,
  });

  const teachers = data?.teachers || [];

  const createMutation = useMutation({
    mutationFn: fd => registrationApi.createTeacher(fd),
    onSuccess: () => { toast.success('Teacher registered!'); setModal(false); qc.invalidateQueries(['reg-teachers']); qc.invalidateQueries(['reg-teachers-count']); },
    onError: e => toast.error(e.response?.data?.message || 'Failed.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => registrationApi.updateTeacher(id, fd),
    onSuccess: () => { toast.success('Teacher updated!'); setEditing(null); qc.invalidateQueries(['reg-teachers']); },
    onError: e => toast.error(e.response?.data?.message || 'Failed.'),
  });

  return (
    <AppShell navItems={REGISTRAR_NAV}>
      <PageHeader title="Teachers" subtitle={`${data?.total ?? 0} registered teachers`}
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setModal(true)}><UserPlus className="w-4 h-4" /> Register teacher</button>} />

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input className="input pl-10" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-stone-100 rounded-2xl animate-pulse" />)}</div>
      ) : teachers.length === 0 ? (
        <div className="card text-center py-16"><GraduationCap className="w-10 h-10 text-stone-200 mx-auto mb-3" /><p className="text-stone-400">{search ? 'No teachers match.' : 'No teachers registered yet.'}</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          <AnimatePresence>{teachers.map(t => <TeacherCard key={t._id} teacher={t} onEdit={setEditing} onAssignLeader={setAssigningLeader} />)}</AnimatePresence>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Register New Teacher" size="lg">
        <TeacherForm grades={grades} sections={sections} onClose={() => setModal(false)} onSave={fd => createMutation.mutate(fd)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Teacher" size="lg">
        {editing && <TeacherForm initial={editing} grades={grades} sections={sections} onClose={() => setEditing(null)} onSave={fd => updateMutation.mutate({ id: editing._id, fd })} />}
      </Modal>
      {assigningLeader && (
        <AssignLeaderModal
          teacher={assigningLeader}
          sections={sections}
          onClose={() => setAssigningLeader(null)}
        />
      )}
    </AppShell>
  );
}
