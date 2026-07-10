import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, CalendarDays, Link, Clock, CheckCircle, ChevronDown } from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';
import AppShell from '@/components/shared/AppShell.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useParentHomework } from '@/hooks/useHomework.js';
import { PARENT_NAV } from './nav.js';
import clsx from 'clsx';

// ─── Urgency helpers ──────────────────────────────────────────────
const DueChip = ({ dueDate }) => {
  const past = isPast(new Date(dueDate));
  const days = differenceInDays(new Date(dueDate), new Date());
  if (past)       return <span className="badge bg-red-50 text-red-600 font-semibold">Overdue</span>;
  if (days === 0) return <span className="badge bg-amber-50 text-amber-700 font-semibold">Due today!</span>;
  if (days <= 2)  return <span className="badge bg-orange-50 text-orange-600">Due in {days}d</span>;
  return <span className="badge bg-stone-100 text-stone-500">Due in {days}d</span>;
};

const leftBorder = (dueDate) => {
  const past = isPast(new Date(dueDate));
  const days = differenceInDays(new Date(dueDate), new Date());
  if (past)    return 'border-l-4 border-red-400';
  if (days <= 1) return 'border-l-4 border-amber-500';
  if (days <= 3) return 'border-l-4 border-orange-300';
  return 'border-l-4 border-stone-200';
};

// ─── Homework card ────────────────────────────────────────────────
const HomeworkCard = ({ hw, index }) => {
  const childNames = hw.children?.map(c => c.firstName).join(', ') || '';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={clsx('card', leftBorder(hw.dueDate))}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className="badge bg-amber-100 text-amber-800 font-semibold">{hw.subject}</span>
            {childNames && (
              <span className="badge bg-blue-50 text-blue-600">For {childNames}</span>
            )}
            <DueChip dueDate={hw.dueDate} />
          </div>
          <p className="font-semibold text-stone-800">{hw.title}</p>
          {hw.description && (
            <p className="text-sm text-stone-500 mt-1 leading-relaxed">{hw.description}</p>
          )}
          <div className="flex items-center flex-wrap gap-4 mt-2">
            <span className="flex items-center gap-1 text-xs text-stone-400">
              <CalendarDays className="w-3 h-3" />
              {format(new Date(hw.dueDate), 'EEEE, dd MMM yyyy')}
            </span>
            {hw.resourceUrl && (
              <a href={hw.resourceUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-amber-600 hover:underline font-medium">
                <Link className="w-3 h-3" /> Open resource
              </a>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {hw.sectionId?.gradeId?.name} · Section {hw.sectionId?.name} ·{' '}
            {hw.teacherId?.firstName} {hw.teacherId?.lastName}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────
export default function ParentHomeworkPage() {
  const { data: homework = [], isLoading } = useParentHomework();
  const [filterChild, setFilterChild] = useState('all');

  // Get unique children from homework list
  const allChildren = Object.values(
    homework.flatMap(hw => hw.children || []).reduce((m, c) => {
      m[String(c._id)] = c;
      return m;
    }, {})
  );

  const filtered = filterChild === 'all'
    ? homework
    : homework.filter(hw => hw.children?.some(c => String(c._id) === filterChild));

  const upcoming = filtered.filter(hw => !isPast(new Date(hw.dueDate)));
  const past     = filtered.filter(hw =>  isPast(new Date(hw.dueDate)));

  return (
    <AppShell navItems={PARENT_NAV}>
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-amber-600" /> Homework
        </h1>
        <p className="page-subtitle">Assignments for your children</p>
      </div>

      {/* Child filter */}
      {allChildren.length > 1 && (
        <div className="relative mb-5 w-fit">
          <select className="input pr-8 text-sm appearance-none cursor-pointer"
            value={filterChild} onChange={e => setFilterChild(e.target.value)}>
            <option value="all">All children</option>
            {allChildren.map(c => (
              <option key={c._id} value={String(c._id)}>{c.firstName} {c.lastName}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : homework.length === 0 ? (
        <div className="card">
          <EmptyState icon={CheckCircle} title="No homework yet"
            body="When teachers post assignments for your children's sections, they'll appear here." />
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section>
              <p className="section-label mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Upcoming ({upcoming.length})
              </p>
              <div className="space-y-3">
                {upcoming.map((hw, i) => <HomeworkCard key={hw._id} hw={hw} index={i} />)}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <p className="section-label mb-3 text-stone-400">Past assignments ({past.length})</p>
              <div className="space-y-3 opacity-60">
                {past.map((hw, i) => <HomeworkCard key={hw._id} hw={hw} index={i} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </AppShell>
  );
}
