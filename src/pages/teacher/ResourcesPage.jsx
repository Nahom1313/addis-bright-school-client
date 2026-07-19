import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, FileText, Link2, Video, Upload, Download, X } from 'lucide-react';
import AppShell from '@/components/shared/AppShell.jsx';
import PageHeader from '@/components/ui/PageHeader.jsx';
import Modal from '@/components/ui/Modal.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useTeacherAssignments } from '@/hooks/useSchool.js';
import { useMyResources, useCreateResource, useDeleteResource } from '@/hooks/useResources.js';
import { TEACHER_NAV } from './nav.js';
import clsx from 'clsx';

const TYPE_META = {
  file:  { icon: FileText, label: 'File',  color: 'text-amber-700 bg-amber-100' },
  link:  { icon: Link2,    label: 'Link',  color: 'text-sky-700 bg-sky-100' },
  video: { icon: Video,    label: 'Video', color: 'text-purple-700 bg-purple-100' },
};

// ─── Resource card ──────────────────────────────────────────────────
const ResourceCard = ({ r, onDelete }) => {
  const meta = TYPE_META[r.type] || TYPE_META.file;
  const Icon = meta.icon;
  const href = r.type === 'file' ? r.fileUrl : r.externalUrl;

  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="card group">
      <div className="flex items-start gap-3">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', meta.color)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className="badge bg-amber-100 text-amber-800 font-semibold">{r.subject}</span>
            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', meta.color)}>{meta.label}</span>
          </div>
          <p className="font-semibold text-stone-800 truncate">{r.title}</p>
          {r.description && <p className="text-sm text-stone-500 mt-1 line-clamp-2">{r.description}</p>}
          <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
            <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-amber-600 hover:underline">
              <Download className="w-3 h-3" /> Open
            </a>
            <span>{r.downloadCount || 0} views</span>
          </div>
        </div>
        <button onClick={() => onDelete(r._id)}
          className="btn-icon text-stone-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Add resource modal ─────────────────────────────────────────────
const AddResourceModal = ({ open, onClose, subjects }) => {
  const create = useCreateResource();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ subject: subjects[0] ?? '', title: '', description: '', type: 'file', externalUrl: '' });
  const [file, setFile] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const reset = () => { setForm({ subject: subjects[0] ?? '', title: '', description: '', type: 'file', externalUrl: '' }); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('subject', form.subject);
    fd.append('title', form.title.trim());
    if (form.description.trim()) fd.append('description', form.description.trim());
    fd.append('type', form.type);
    if (form.type === 'file') {
      if (!file) return;
      fd.append('file', file);
    } else {
      fd.append('externalUrl', form.externalUrl.trim());
    }
    create.mutate(fd, { onSuccess: () => { onClose(); reset(); } });
  };

  return (
    <Modal open={open} onClose={() => { onClose(); reset(); }} title="Add to Study Library" size="md">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Subject</label>
          {subjects.length > 0 ? (
            <select className="input" value={form.subject} onChange={e => set('subject', e.target.value)} required>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <input className="input" placeholder="e.g. Mathematics" value={form.subject} onChange={e => set('subject', e.target.value)} required />
          )}
        </div>

        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="e.g. Chapter 4 notes — Algebra basics"
            value={form.title} onChange={e => set('title', e.target.value)} maxLength={150} required />
        </div>

        <div>
          <label className="label">Description <span className="text-stone-400 font-normal">(optional)</span></label>
          <textarea className="input resize-none" rows={2}
            placeholder="What's covered in this resource?"
            value={form.description} onChange={e => set('description', e.target.value)} maxLength={1000} />
        </div>

        <div>
          <label className="label">Type</label>
          <div className="grid grid-cols-3 gap-2">
            {['file', 'link', 'video'].map(t => {
              const meta = TYPE_META[t]; const Icon = meta.icon;
              return (
                <button key={t} type="button" onClick={() => set('type', t)}
                  className={clsx('flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all',
                    form.type === t ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-stone-200 text-stone-500 hover:border-stone-300')}>
                  <Icon className="w-4 h-4" /> {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {form.type === 'file' ? (
          <div>
            <label className="label flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /> File</label>
            <input ref={fileInputRef} type="file" className="input"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={e => setFile(e.target.files?.[0] || null)} required />
            <p className="text-xs text-stone-400 mt-1">PDF, Word, PowerPoint, or image — up to 20MB</p>
          </div>
        ) : (
          <div>
            <label className="label flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> URL</label>
            <input className="input" type="url"
              placeholder={form.type === 'video' ? 'https://youtube.com/…' : 'https://…'}
              value={form.externalUrl} onChange={e => set('externalUrl', e.target.value)} required />
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={() => { onClose(); reset(); }}>Cancel</button>
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={create.isPending}>
            {create.isPending
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding…</>
              : <><Plus className="w-3.5 h-3.5" /> Add resource</>
            }
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Page ────────────────────────────────────────────────────────────
export default function ResourcesPage() {
  const { user } = useAuth();
  const { data: assignments = [] } = useTeacherAssignments(user?._id);
  const { data: resources = [], isLoading } = useMyResources();
  const deleteResource = useDeleteResource();
  const [modal, setModal] = useState(false);

  const subjects = [...new Set(assignments.map(a => a.subject).filter(Boolean))].sort();

  return (
    <AppShell navItems={TEACHER_NAV}>
      <PageHeader
        title="Study Library"
        subtitle="Share notes, books, links and videos with students"
        action={
          <button className="btn-primary flex items-center gap-2" onClick={() => setModal(true)}>
            <Plus className="w-4 h-4" /> Add resource
          </button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState icon={BookOpen} title="Nothing uploaded yet"
          body="Add notes, past exam files, or links to help your students study." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {resources.map(r => <ResourceCard key={r._id} r={r} onDelete={(id) => deleteResource.mutate(id)} />)}
          </AnimatePresence>
        </div>
      )}

      <AddResourceModal open={modal} onClose={() => setModal(false)} subjects={subjects} />
    </AppShell>
  );
}
