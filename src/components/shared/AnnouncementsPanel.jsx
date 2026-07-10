import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Trash2, AlertTriangle, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '@/components/ui/Modal.jsx';
import { useAllAnnouncements, useCreateAnnouncement, useRemoveAnnouncement } from '@/hooks/useAnnouncements.js';
import clsx from 'clsx';

const ROLES = [
  { key: 'teacher',   label: 'Teachers',   color: 'bg-violet-100 text-violet-700' },
  { key: 'student',   label: 'Students',   color: 'bg-amber-100 text-amber-700' },
  { key: 'parent',    label: 'Parents',    color: 'bg-green-100 text-green-700' },
  { key: 'registrar', label: 'Registrars', color: 'bg-blue-100 text-blue-700' },
  { key: 'director',  label: 'Directors',  color: 'bg-stone-100 text-stone-700' },
];

// ─── Create Modal ─────────────────────────────────────────────────
const CreateModal = ({ open, onClose }) => {
  const create = useCreateAnnouncement();
  const [form, setForm] = useState({
    title: '', body: '', priority: 'normal',
    targetRoles: [], expiresAt: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleRole = (role) => {
    setForm(f => ({
      ...f,
      targetRoles: f.targetRoles.includes(role)
        ? f.targetRoles.filter(r => r !== role)
        : [...f.targetRoles, role],
    }));
  };

  const selectAll = () => setForm(f => ({ ...f, targetRoles: ROLES.map(r => r.key) }));

  const submit = (e) => {
    e.preventDefault();
    create.mutate(
      { ...form, expiresAt: form.expiresAt || null },
      {
        onSuccess: () => {
          onClose();
          setForm({ title: '', body: '', priority: 'normal', targetRoles: [], expiresAt: '' });
        },
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Post Announcement" size="md">
      <form onSubmit={submit} className="space-y-4">
        {/* Priority toggle */}
        <div>
          <label className="label">Priority</label>
          <div className="flex gap-2">
            {[['normal', '📢 Normal', 'bg-amber-600'], ['urgent', '🚨 Urgent', 'bg-red-600']].map(([val, label, bg]) => (
              <button key={val} type="button"
                onClick={() => set('priority', val)}
                className={clsx(
                  'flex-1 py-2 rounded-xl text-sm font-semibold transition-colors',
                  form.priority === val
                    ? `${bg} text-white`
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                )}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="e.g. School closed tomorrow"
            value={form.title} onChange={e => set('title', e.target.value)}
            maxLength={150} required />
        </div>

        {/* Body */}
        <div>
          <label className="label">Message</label>
          <textarea className="input resize-none" rows={4}
            placeholder="Write your announcement here…"
            value={form.body} onChange={e => set('body', e.target.value)}
            maxLength={2000} required />
        </div>

        {/* Target roles */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Send to</label>
            <button type="button" onClick={selectAll}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium">
              Select all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ROLES.map(r => (
              <button key={r.key} type="button"
                onClick={() => toggleRole(r.key)}
                className={clsx(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all',
                  form.targetRoles.includes(r.key)
                    ? `${r.color} border-current`
                    : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                )}>
                {r.label}
              </button>
            ))}
          </div>
          {form.targetRoles.length === 0 && (
            <p className="text-xs text-red-400 mt-1">Select at least one role.</p>
          )}
        </div>

        {/* Optional expiry */}
        <div>
          <label className="label flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Expires at
            <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <input type="datetime-local" className="input"
            value={form.expiresAt}
            onChange={e => set('expiresAt', e.target.value)}
            min={new Date().toISOString().slice(0, 16)} />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2"
            disabled={create.isPending || !form.targetRoles.length}>
            {create.isPending
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Posting…</>
              : <><Megaphone className="w-3.5 h-3.5" /> Post announcement</>
            }
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Management panel (shown on director dashboard) ───────────────
export default function AnnouncementsPanel() {
  const [modal, setModal] = useState(false);
  const { data: announcements = [], isLoading } = useAllAnnouncements();
  const remove = useRemoveAnnouncement();

  const active   = announcements.filter(a => a.isActive);
  const inactive = announcements.filter(a => !a.isActive);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-amber-600" />
          <span className="font-semibold text-stone-800">Announcements</span>
          {active.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
              {active.length} active
            </span>
          )}
        </div>
        <button className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
          onClick={() => setModal(true)}>
          <Plus className="w-3.5 h-3.5" /> New
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-8">
          <Megaphone className="w-8 h-8 text-stone-200 mx-auto mb-2" />
          <p className="text-sm text-stone-400">No announcements posted yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {active.map(a => (
              <motion.div key={a._id} layout
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={clsx(
                  'flex items-start gap-3 p-3 rounded-xl border group',
                  a.priority === 'urgent'
                    ? 'bg-red-50 border-red-100'
                    : 'bg-amber-50 border-amber-100'
                )}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {a.priority === 'urgent' && <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />}
                    <p className="text-sm font-semibold text-stone-800 truncate">{a.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <Users className="w-3 h-3" />
                      {a.targetRoles.join(', ')}
                    </span>
                    <span className="text-xs text-stone-400">
                      {format(new Date(a.createdAt), 'dd MMM yyyy')}
                    </span>
                    {a.expiresAt && (
                      <span className="text-xs text-stone-400">
                        Expires {format(new Date(a.expiresAt), 'dd MMM')}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => remove.mutate(a._id)}
                  className="opacity-0 group-hover:opacity-100 btn-icon text-red-400 hover:text-red-600 hover:bg-red-50 transition-opacity flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {inactive.length > 0 && (
            <p className="text-xs text-stone-400 pt-1">{inactive.length} removed announcement{inactive.length !== 1 ? 's' : ''} not shown.</p>
          )}
        </div>
      )}

      <CreateModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}
