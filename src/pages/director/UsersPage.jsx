import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Trash2, Users, Pencil, Eye, EyeOff } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useUsers, useCreateTeacher, useCreateStudent, useCreateParent, useDeactivateUser } from '@/hooks/useSchool';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { DIRECTOR_NAV } from './nav';

const ROLE_TABS = [
  { key: 'teacher', label: 'Teachers', badge: 'badge-violet' },
  { key: 'student', label: 'Students', badge: 'badge-amber'  },
  { key: 'parent',  label: 'Parents',  badge: 'badge-green'  },
  { key: 'registrar', label: 'Registrars', badge: 'badge-stone' },
];

const ROLE_BADGE = { teacher: 'badge-violet', student: 'badge-amber', parent: 'badge-green', director: 'badge-stone', registrar: 'badge-stone' };

const UserRow = ({ user, onDeactivate, onEdit }) => (
  <motion.tr className="table-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <td className="px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600 flex-shrink-0">
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div>
          <p className="font-medium text-stone-800 text-sm">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-stone-400">{user.email}</p>
        </div>
      </div>
    </td>
    <td className="px-5 py-3.5"><span className={ROLE_BADGE[user.role] || 'badge-stone'}>{user.role}</span></td>
    <td className="px-5 py-3.5 text-xs text-stone-400">{user.studentCode || user.phone || '—'}</td>
    <td className="px-5 py-3.5">
      <div className="flex items-center gap-1">
        <button onClick={() => onEdit(user)} className="btn-icon text-stone-400 hover:text-amber-600 hover:bg-amber-50">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => onDeactivate(user._id)} className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </td>
  </motion.tr>
);

const FieldRow = ({ label, children }) => (
  <div><label className="label">{label}</label>{children}</div>
);

// ─── Edit modal ────────────────────────────────────────────────────
const EditUserModal = ({ user, onClose }) => {
  const qc = useQueryClient();
  const [email, setEmail]       = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);

  const mutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/users/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Account updated.');
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update.'),
  });

  const submit = (e) => {
    e.preventDefault();
    const data = {};
    if (email !== user.email) data.email = email;
    if (password) data.password = password;
    if (!Object.keys(data).length) return toast('Nothing changed.');
    mutation.mutate({ id: user._id, data });
  };

  return (
    <Modal open={!!user} onClose={onClose} title={`Edit ${user?.firstName} ${user?.lastName}`} size="sm">
      <form onSubmit={submit} className="space-y-4">
        <div className="text-xs text-stone-400 bg-stone-50 rounded-xl px-3 py-2">
          Role: <span className="font-medium text-stone-600 capitalize">{user?.role}</span>
        </div>

        <FieldRow label="Email address">
          <input className="input" type="email" value={email}
            onChange={e => setEmail(e.target.value)} required />
        </FieldRow>

        <FieldRow label="New password">
          <div className="relative">
            <input className="input pr-10" type={showPw ? 'text' : 'password'}
              placeholder="Leave blank to keep current password"
              value={password} onChange={e => setPassword(e.target.value)}
              minLength={password ? 6 : undefined} />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && password.length < 6 && (
            <p className="text-xs text-red-500 mt-1">At least 6 characters required</p>
          )}
        </FieldRow>

        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Create modal ──────────────────────────────────────────────────
const CreateUserForm = ({ role, onClose }) => {
  const createTeacher = useCreateTeacher();
  const createStudent = useCreateStudent();
  const createParent  = useCreateParent();
  const [f, setF] = useState({ firstName: '', lastName: '', email: '', password: 'Teacher1', phone: '' });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const mutate = { teacher: createTeacher, student: createStudent, parent: createParent }[role];

  if (!mutate) return <p className="text-sm text-stone-400 py-4 text-center">Cannot create {role} accounts from here.</p>;

  const submit = e => {
    e.preventDefault();
    mutate.mutate(f, { onSuccess: onClose });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="First name"><input className="input" value={f.firstName} onChange={set('firstName')} required /></FieldRow>
        <FieldRow label="Last name"><input  className="input" value={f.lastName}  onChange={set('lastName')}  required /></FieldRow>
      </div>
      <FieldRow label="Email"><input className="input" type="email" value={f.email} onChange={set('email')} required /></FieldRow>
      <FieldRow label="Password"><input className="input" type="password" value={f.password} onChange={set('password')} required /></FieldRow>
      <FieldRow label="Phone (optional)"><input className="input" value={f.phone} onChange={set('phone')} /></FieldRow>
      <div className="flex gap-3 pt-2">
        <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary flex-1" disabled={mutate.isPending}>
          {mutate.isPending ? 'Creating…' : `Create ${role}`}
        </button>
      </div>
    </form>
  );
};

// ─── Page ──────────────────────────────────────────────────────────
const UsersPage = () => {
  const [tab, setTab]         = useState('teacher');
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const { data: users = [], isLoading } = useUsers(tab);
  const deactivate = useDeactivateUser();

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell navItems={DIRECTOR_NAV}>
      <PageHeader
        title="User Management"
        subtitle="Create and manage all school accounts"
        action={
          tab !== 'registrar' && (
            <button className="btn-primary flex items-center gap-2" onClick={() => setModal(true)}>
              <UserPlus className="w-4 h-4" /> Add {tab}
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl w-fit mb-5">
        {ROLE_TABS.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSearch(''); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input className="input pl-9" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Users} title={`No ${tab}s found`} body="Try a different search or add a new account." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-5 py-3 section-label">Name</th>
                  <th className="text-left px-5 py-3 section-label">Role</th>
                  <th className="text-left px-5 py-3 section-label">Code / Phone</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <UserRow key={u._id} user={u}
                    onEdit={setEditing}
                    onDeactivate={id => deactivate.mutate(id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={`Add ${tab}`}>
        <CreateUserForm role={tab} onClose={() => setModal(false)} />
      </Modal>

      {/* Edit modal */}
      {editing && <EditUserModal user={editing} onClose={() => setEditing(null)} />}
    </AppShell>
  );
};

export default UsersPage;
