import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound, Users, ShieldCheck, ShieldOff, Search,
  CheckCircle2, XCircle, Loader2, AlertTriangle, Eye, EyeOff,
  Settings, UserCheck, UserX,
} from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { DIRECTOR_NAV } from './nav';
import clsx from 'clsx';

// ─── Helpers ──────────────────────────────────────────────────────
const ROLE_TABS = [
  { key: 'teacher', label: 'Teachers', color: 'text-violet-700 bg-violet-50' },
  { key: 'student', label: 'Students', color: 'text-amber-700 bg-amber-50' },
  { key: 'parent',  label: 'Parents',  color: 'text-emerald-700 bg-emerald-50' },
];

const SECTION_TITLE = 'text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3';

// ─── Change Password Panel ─────────────────────────────────────────
const ChangePasswordPanel = () => {
  const [form, setForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [show, setShow]   = useState({ cur: false, new: false, con: false });
  const [errors, setErrors] = useState({});
  const [done, setDone]   = useState(false);

  const set = f => e => { setErrors(p => ({ ...p, [f]: '' })); setForm(p => ({ ...p, [f]: e.target.value })); };

  const validate = () => {
    const e = {};
    if (!form.currentPassword)              e.currentPassword = 'Required';
    if (!form.newPassword)                  e.newPassword     = 'Required';
    else if (form.newPassword.length < 8)   e.newPassword     = 'Min. 8 characters';
    if (form.newPassword === form.currentPassword) e.newPassword = 'Must differ from current';
    if (form.newPassword !== form.confirm)  e.confirm         = 'Passwords do not match';
    return e;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.patch('/auth/change-password', {
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    }),
    onSuccess: () => { setDone(true); setForm({ currentPassword: '', newPassword: '', confirm: '' }); toast.success('Password updated!'); },
    onError: err => {
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('incorrect')) setErrors({ currentPassword: 'Incorrect password' });
      else toast.error(msg || 'Failed to update password.');
    },
  });

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setDone(false);
    mutate();
  };

  const PwField = ({ label, field, showKey, autoComplete }) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? 'text' : 'password'}
          value={form[field]}
          onChange={set(field)}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className={`input pr-10 ${errors[field] ? 'border-red-300' : ''}`}
        />
        <button type="button" tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}>
          {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="card max-w-md">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <KeyRound className="w-4 h-4 text-amber-700" />
        </div>
        <div>
          <h3 className="font-semibold text-stone-900 text-sm">Change Password</h3>
          <p className="text-xs text-stone-400">Update your director account password</p>
        </div>
      </div>

      {done && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 mb-4 text-sm text-emerald-700">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Password updated successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <PwField label="Current Password"     field="currentPassword" showKey="cur" autoComplete="current-password" />
        <PwField label="New Password"         field="newPassword"     showKey="new" autoComplete="new-password" />
        <PwField label="Confirm New Password" field="confirm"         showKey="con" autoComplete="new-password" />
        <button type="submit" disabled={isPending}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-1">
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

// ─── User Row in Block/Unblock table ─────────────────────────────
const UserManagementRow = ({ user, onBlock, onUnblock, isLoading }) => {
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;
  return (
    <motion.tr className="table-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
            user.isActive ? 'bg-stone-100 text-stone-600' : 'bg-red-100 text-red-400'
          )}>
            {initials}
          </div>
          <div>
            <p className="font-medium text-stone-800 text-sm">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-stone-400">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className={clsx(
          'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
          user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
        )}>
          {user.isActive
            ? <><CheckCircle2 className="w-3 h-3" /> Active</>
            : <><XCircle className="w-3 h-3" /> Blocked</>
          }
        </span>
      </td>
      <td className="px-5 py-3.5 text-xs text-stone-400">
        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
      </td>
      <td className="px-5 py-3.5">
        {user.isActive ? (
          <button
            onClick={() => onBlock(user._id)}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
          >
            <ShieldOff className="w-3.5 h-3.5" /> Block
          </button>
        ) : (
          <button
            onClick={() => onUnblock(user._id)}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Unblock
          </button>
        )}
      </td>
    </motion.tr>
  );
};

// ─── User Management Panel ────────────────────────────────────────
const UserManagementPanel = () => {
  const qc = useQueryClient();
  const [tab, setTab]       = useState('teacher');
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null); // { type: 'block'|'unblock', userId, name }

  const { data, isLoading } = useQuery({
    queryKey: ['users-all', tab],
    queryFn: () => api.get(`/users?role=${tab}&includeInactive=true&limit=200`).then(r => r.data.data.users || []),
  });

  const blockMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success('User blocked.');
      qc.invalidateQueries({ queryKey: ['users-all', tab] });
      qc.invalidateQueries({ queryKey: ['users', tab] });
      setConfirm(null);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed to block user.'),
  });

  const unblockMutation = useMutation({
    mutationFn: (id) => api.patch(`/users/${id}/reactivate`),
    onSuccess: () => {
      toast.success('User unblocked.');
      qc.invalidateQueries({ queryKey: ['users-all', tab] });
      qc.invalidateQueries({ queryKey: ['users', tab] });
      setConfirm(null);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed to unblock user.'),
  });

  const filtered = (data || []).filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount   = (data || []).filter(u => u.isActive).length;
  const blockedCount  = (data || []).filter(u => !u.isActive).length;

  const handleBlock = (userId) => {
    const user = (data || []).find(u => u._id === userId);
    setConfirm({ type: 'block', userId, name: `${user?.firstName} ${user?.lastName}` });
  };

  const handleUnblock = (userId) => {
    const user = (data || []).find(u => u._id === userId);
    setConfirm({ type: 'unblock', userId, name: `${user?.firstName} ${user?.lastName}` });
  };

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-violet-700" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">User Access Control</h3>
            <p className="text-xs text-stone-400">Block or unblock account access</p>
          </div>
        </div>

        {/* Role tabs */}
        <div className="flex gap-1 p-1 bg-stone-100 rounded-xl w-fit mb-4">
          {ROLE_TABS.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(''); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === t.key ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Stats chips */}
        <div className="flex gap-2 mb-4">
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
            <UserCheck className="w-3 h-3" /> {activeCount} active
          </span>
          {blockedCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-medium">
              <UserX className="w-3 h-3" /> {blockedCount} blocked
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input className="input pl-9 text-sm py-2" placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-sm">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/60">
                <th className="text-left px-5 py-3 section-label">User</th>
                <th className="text-left px-5 py-3 section-label">Status</th>
                <th className="text-left px-5 py-3 section-label">Last Login</th>
                <th className="px-5 py-3 section-label text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <UserManagementRow
                  key={u._id}
                  user={u}
                  onBlock={handleBlock}
                  onUnblock={handleUnblock}
                  isLoading={blockMutation.isPending || unblockMutation.isPending}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.type === 'block' ? 'Block User' : 'Unblock User'}
        size="sm"
      >
        {confirm && (
          <div className="space-y-4">
            <div className={clsx(
              'flex items-start gap-3 p-4 rounded-xl',
              confirm.type === 'block' ? 'bg-red-50' : 'bg-emerald-50'
            )}>
              <AlertTriangle className={clsx('w-5 h-5 mt-0.5 flex-shrink-0', confirm.type === 'block' ? 'text-red-500' : 'text-emerald-600')} />
              <p className="text-sm text-stone-700">
                {confirm.type === 'block'
                  ? <>Are you sure you want to <strong>block {confirm.name}</strong>? They will not be able to log in until unblocked.</>
                  : <>Restore access for <strong>{confirm.name}</strong>? They will be able to log in again immediately.</>
                }
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setConfirm(null)}>Cancel</button>
              <button
                className={clsx('flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all',
                  confirm.type === 'block' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'
                )}
                disabled={blockMutation.isPending || unblockMutation.isPending}
                onClick={() => confirm.type === 'block'
                  ? blockMutation.mutate(confirm.userId)
                  : unblockMutation.mutate(confirm.userId)
                }
              >
                {(blockMutation.isPending || unblockMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirm.type === 'block' ? 'Block User' : 'Unblock User'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ─── Main Settings Page ───────────────────────────────────────────
const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <AppShell navItems={DIRECTOR_NAV}>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and control user access"
        icon={Settings}
      />

      {/* Account info banner */}
      <div className="card mb-6 flex items-center gap-4 bg-gradient-to-r from-violet-50 to-stone-50 border-violet-100">
        <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <p className="font-semibold text-stone-900">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-stone-500">{user?.email}</p>
          <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 capitalize">{user?.role}</span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Password Section */}
        <section>
          <p className={SECTION_TITLE}>Account Security</p>
          <ChangePasswordPanel />
        </section>

        {/* User Management Section */}
        <section>
          <p className={SECTION_TITLE}>User Access Control</p>
          <UserManagementPanel />
        </section>
      </div>
    </AppShell>
  );
};

export default SettingsPage;
