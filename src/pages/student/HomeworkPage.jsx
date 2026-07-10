import { motion } from 'framer-motion';
import { BookMarked, CalendarDays, Link, Clock, CheckCircle } from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';
import AppShell from '@/components/shared/AppShell.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useStudentHomework } from '@/hooks/useHomework.js';
import { STUDENT_NAV } from './nav.js';
import clsx from 'clsx';

// ─── Due label with colour coding ────────────────────────────────
const DueLabel = ({ dueDate }) => {
  const past = isPast(new Date(dueDate));
  const days = differenceInDays(new Date(dueDate), new Date());

  if (past)       return <span className="text-xs font-semibold text-red-500">Overdue</span>;
  if (days === 0) return <span className="text-xs font-semibold text-amber-600">Due today!</span>;
  if (days === 1) return <span className="text-xs font-semibold text-orange-500">Due tomorrow</span>;
  if (days <= 3)  return <span className="text-xs font-semibold text-orange-400">Due in {days} days</span>;
  return <span className="text-xs text-stone-400">Due in {days} days</span>;
};

const urgencyColor = (dueDate) => {
  const past = isPast(new Date(dueDate));
  const days = differenceInDays(new Date(dueDate), new Date());
  if (past)    return 'border-l-4 border-red-400';
  if (days <= 1) return 'border-l-4 border-amber-500';
  if (days <= 3) return 'border-l-4 border-orange-300';
  return 'border-l-4 border-stone-200';
};

// ─── Homework card ────────────────────────────────────────────────
const HomeworkCard = ({ hw, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
    className={clsx('card', urgencyColor(hw.dueDate))}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="badge bg-amber-100 text-amber-800 font-semibold">{hw.subject}</span>
          <DueLabel dueDate={hw.dueDate} />
        </div>
        <p className="font-semibold text-stone-800">{hw.title}</p>
        {hw.description && (
          <p className="text-sm text-stone-500 mt-1 leading-relaxed">{hw.description}</p>
        )}
        <div className="flex items-center gap-4 mt-2">
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
          Posted by {hw.teacherId?.firstName} {hw.teacherId?.lastName}
        </p>
      </div>
    </div>
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────
export default function StudentHomeworkPage() {
  const { user } = useAuth();
  const sectionId = user?.sectionId;

  const { data: homework = [], isLoading } = useStudentHomework(sectionId);

  const upcoming = homework.filter(hw => !isPast(new Date(hw.dueDate)));
  const past     = homework.filter(hw => isPast(new Date(hw.dueDate)));

  return (
    <AppShell navItems={STUDENT_NAV}>
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-amber-600" /> Homework
        </h1>
        <p className="page-subtitle">Assignments from your teachers</p>
      </div>

      {!sectionId ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🏫</p>
          <p className="font-medium text-stone-700">You are not enrolled in a section yet</p>
          <p className="text-sm text-stone-400 mt-1">Ask your school administrator to enroll you.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : homework.length === 0 ? (
        <div className="card">
          <EmptyState icon={CheckCircle} title="All caught up!"
            body="No homework assigned yet. Check back after your next class." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
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

          {/* Past */}
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
