import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Link2, Video, Download, Search } from 'lucide-react';
import AppShell from '@/components/shared/AppShell.jsx';
import PageHeader from '@/components/ui/PageHeader.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useResources, useResourceSubjects, useTrackDownload } from '@/hooks/useResources.js';
import { STUDENT_NAV } from './nav.js';
import clsx from 'clsx';

const TYPE_META = {
  file:  { icon: FileText, label: 'File',  color: 'text-amber-700 bg-amber-100' },
  link:  { icon: Link2,    label: 'Link',  color: 'text-sky-700 bg-sky-100' },
  video: { icon: Video,    label: 'Video', color: 'text-purple-700 bg-purple-100' },
};

const ResourceCard = ({ r, onOpen }) => {
  const meta = TYPE_META[r.type] || TYPE_META.file;
  const Icon = meta.icon;
  const href = r.type === 'file' ? r.fileUrl : r.externalUrl;

  return (
    <motion.a
      href={href} target="_blank" rel="noopener noreferrer"
      onClick={() => onOpen(r._id)}
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="card card-hover flex items-start gap-3 cursor-pointer"
    >
      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', meta.color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2 mb-1">
          <span className="badge bg-amber-100 text-amber-800 font-semibold">{r.subject}</span>
          <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', meta.color)}>{meta.label}</span>
        </div>
        <p className="font-semibold text-stone-800 truncate">{r.title}</p>
        {r.description && <p className="text-sm text-stone-500 mt-1 line-clamp-2">{r.description}</p>}
        <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
          <span>By {r.teacherId?.firstName} {r.teacherId?.lastName}</span>
        </div>
      </div>
      <Download className="w-4 h-4 text-stone-300 flex-shrink-0 mt-1" />
    </motion.a>
  );
};

export default function LibraryPage() {
  const [subject, setSubject] = useState('All subjects');
  const [search, setSearch]   = useState('');

  const { data: subjectsRaw = [] } = useResourceSubjects();
  const { data: resources = [], isLoading } = useResources({
    subject: subject === 'All subjects' ? undefined : subject,
    q: search.trim() || undefined,
  });
  const trackDownload = useTrackDownload();

  const subjects = ['All subjects', ...subjectsRaw];

  return (
    <AppShell navItems={STUDENT_NAV}>
      <PageHeader title="Study Library" subtitle="Notes, books, links and videos from your teachers" />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input className="input pl-9" placeholder="Search resources…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-56" value={subject} onChange={e => setSubject(e.target.value)}>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState icon={BookOpen} title="Nothing here yet"
          body="Your teachers haven't added any study materials for this subject yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resources.map(r => <ResourceCard key={r._id} r={r} onOpen={(id) => trackDownload.mutate(id)} />)}
        </div>
      )}
    </AppShell>
  );
}
