import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Edit2, Users, X } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import ProfilePictureUpload from '@/components/ui/ProfilePictureUpload';
import { registrationApi } from '@/api/registration';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { REGISTRAR_NAV } from './nav';
import { toAvatarUrl as toAvatar } from '@/utils/avatar';


const ParentForm = ({ initial, onSave, onClose }) => {
  const [photo, setPhoto] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [linkedStudents, setLinkedStudents] = useState(initial?.studentIds || []);
  const [form, setForm] = useState(() => {
    const { studentIds: _, ...rest } = initial || {};
    return {
      firstName: '', lastName: '', email: '', password: '',
      dateOfBirth: '', address: '', phone: '',
      ...rest,
    };
  });

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  // Search students to link
  const { data: studentResults } = useQuery({
    queryKey: ['student-search', studentSearch],
    queryFn: () => api.get('/users?role=student&limit=10', { params: { search: studentSearch } }).then(r => r.data.data?.users || []),
    enabled: studentSearch.length > 1,
  });

  const addStudent = s => {
    if (!linkedStudents.find(x => (x._id || x) === s._id)) {
      setLinkedStudents(p => [...p, s]);
    }
    setStudentSearch('');
  };

  const removeStudent = id => setLinkedStudents(p => p.filter(s => (s._id || s) !== id));

  const handleSubmit = e => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    fd.append('studentIds', JSON.stringify(linkedStudents.map(s => s._id || s)));
    if (photo) fd.append('profilePicture', photo);
    onSave(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ProfilePictureUpload current={initial?.profilePicture} onChange={setPhoto} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[['firstName','First name','Tigist',true],['lastName','Last name','Haile',true],
          ['email','Email','parent@email.com',true],['password','Password','',false],
          ['dateOfBirth','Date of birth','',false,'date'],['phone','Phone','+251 9...',false],
          ['address','Address','',false]].map(([field,label,placeholder,req,type='text']) => (
          <div key={field} className={field==='address'?'sm:col-span-2':''}>
            <label className="label">{label}{req && <span className="text-red-400"> *</span>}</label>
            <input type={type} className="input" value={form[field]||''} onChange={set(field)} required={req} placeholder={placeholder} />
          </div>
        ))}
      </div>

      {/* Link children */}
      <div>
        <label className="label">Linked children</label>
        <input className="input mb-2" placeholder="Search student by name or code…"
          value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
        {studentResults?.length > 0 && studentSearch && (
          <div className="border border-stone-200 rounded-xl overflow-hidden mb-2">
            {studentResults.map(s => (
              <button key={s._id} type="button" onClick={() => addStudent(s)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50 border-b border-stone-100 last:border-0 flex justify-between">
                <span>{s.firstName} {s.lastName}</span>
                <span className="text-stone-400 text-xs">{s.studentCode}</span>
              </button>
            ))}
          </div>
        )}
        {linkedStudents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {linkedStudents.map(s => {
              const id = s._id || s;
              const name = s.firstName ? `${s.firstName} ${s.lastName}` : id;
              return (
                <span key={id} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full">
                  {name}
                  <button type="button" onClick={() => removeStudent(id)}>
                    <X className="w-3 h-3 ml-0.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary flex-1">{initial ? 'Save changes' : 'Register parent'}</button>
      </div>
    </form>
  );
};

const ParentCard = ({ parent, onEdit }) => {
  const pic = toAvatar(parent.profilePicture);
  return (
    <motion.div className="card flex items-center gap-4 hover:shadow-md transition-shadow" layout
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="w-12 h-12 rounded-2xl bg-emerald-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {pic ? <img src={pic} alt="" className="w-full h-full object-cover" />
             : <span className="text-sm font-bold text-emerald-600">{parent.firstName?.[0]}{parent.lastName?.[0]}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-900 text-sm">{parent.firstName} {parent.lastName}</p>
        <p className="text-xs text-stone-400 truncate">{parent.email}</p>
        {parent.studentIds?.length > 0 && (
          <p className="text-xs text-emerald-600 mt-0.5">
            {parent.studentIds.length} child{parent.studentIds.length > 1 ? 'ren' : ''} linked
          </p>
        )}
      </div>
      <button onClick={() => onEdit(parent)} className="btn-icon flex-shrink-0"><Edit2 className="w-4 h-4 text-stone-400" /></button>
    </motion.div>
  );
};

export default function ParentsPage() {
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { if (searchParams.get('new') === '1') setModal(true); }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['reg-parents', search],
    queryFn: () => registrationApi.getParents({ search, limit: 100 }).then(r => r.data.data),
    keepPreviousData: true,
  });

  const parents = data?.parents || [];

  const createMutation = useMutation({
    mutationFn: fd => registrationApi.createParent(fd),
    onSuccess: () => { toast.success('Parent registered!'); setModal(false); qc.invalidateQueries(['reg-parents']); qc.invalidateQueries(['reg-parents-count']); },
    onError: e => toast.error(e.response?.data?.message || 'Failed.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => registrationApi.updateParent(id, fd),
    onSuccess: () => { toast.success('Parent updated!'); setEditing(null); qc.invalidateQueries(['reg-parents']); },
    onError: e => toast.error(e.response?.data?.message || 'Failed.'),
  });

  return (
    <AppShell navItems={REGISTRAR_NAV}>
      <PageHeader title="Parents" subtitle={`${data?.total ?? 0} registered parents`}
        action={<button className="btn-primary flex items-center gap-2" onClick={() => setModal(true)}><UserPlus className="w-4 h-4" /> Register parent</button>} />

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input className="input pl-10" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}</div>
      ) : parents.length === 0 ? (
        <div className="card text-center py-16"><Users className="w-10 h-10 text-stone-200 mx-auto mb-3" /><p className="text-stone-400">{search ? 'No parents match.' : 'No parents registered yet.'}</p></div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>{parents.map(p => <ParentCard key={p._id} parent={p} onEdit={setEditing} />)}</AnimatePresence>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Register New Parent" size="lg">
        <ParentForm onClose={() => setModal(false)} onSave={fd => createMutation.mutate(fd)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Parent" size="lg">
        {editing && <ParentForm initial={editing} onClose={() => setEditing(null)} onSave={fd => updateMutation.mutate({ id: editing._id, fd })} />}
      </Modal>
    </AppShell>
  );
}
