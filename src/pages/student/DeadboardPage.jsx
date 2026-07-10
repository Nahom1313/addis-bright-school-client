import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, AlertTriangle, CheckCircle2, CalendarDays } from 'lucide-react';
import { formatDistanceToNow, isPast, isToday, differenceInDays, format } from 'date-fns';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useMe } from '@/hooks/useAuth';
import { useUpcomingEvents } from '@/hooks/useSchool';
import { STUDENT_NAV } from './nav';
import clsx from 'clsx';

const DEADLINE_CATEGORIES = ['exam', 'deadline'];

const urgencyConfig = (daysLeft) => {
  if (daysLeft < 0)  return { label: 'Past due',    bar: 'bg-stone-300',  badge: 'badge-stone',  icon: <CheckCircle2  className="w-4 h-4" />, text: 'text-stone-400' };
  if (daysLeft === 0) return { label: 'Today!',     bar: 'bg-red-500',    badge: 'badge-rose',   icon: <AlertTriangle className="w-4 h-4" />, text: 'text-red-600'   };
  if (daysLeft <= 2)  return { label: `${daysLeft}d left`, bar: 'bg-red-400',   badge: 'badge-rose',   icon: <AlertTriangle className="w-4 h-4" />, text: 'text-red-500'   };
  if (daysLeft <= 7)  return { label: `${daysLeft}d left`, bar: 'bg-amber-400', badge: 'badge-amber',  icon: <Clock         className="w-4 h-4" />, text: 'text-amber-600' };
  return               { label: `${daysLeft}d left`, bar: 'bg-sky-400',    badge: 'badge-sky',    icon: <Clock         className="w-4 h-4" />, text: 'text-sky-600'   };
};

const DeadlineCard = ({ event, index }) => {
  const start     = new Date(event.startDate);
  const daysLeft  = differenceInDays(start, new Date());
  const past      = isPast(start) && !isToday(start);
  const urg       = urgencyConfig(daysLeft);

  return (
    <motion.div
      className={clsx('card !p-0 overflow-hidden', past && 'opacity-50')}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: past ? 0.5 : 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Urgency bar */}
      <div className={clsx('h-1 w-full', urg.bar)} />

      <div className="flex items-center gap-4 p-4">
        {/* Date block */}
        <div className="flex-shrink-0 text-center w-12">
          <p className="text-xs font-semibold text-stone-400 uppercase">{format(start, 'MMM')}</p>
          <p className="text-2xl font-bold text-stone-800 leading-none">{format(start, 'd')}</p>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-stone-100 flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-stone-800 text-sm">{event.title}</p>
            <span className={clsx('badge text-[10px]', event.category === 'exam' ? 'badge-rose' : 'badge-amber')}>
              {event.category}
            </span>
          </div>
          {event.description && (
            <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{event.description}</p>
          )}
        </div>

        {/* Countdown */}
        <div className={clsx('flex items-center gap-1 text-xs font-semibold flex-shrink-0', urg.text)}>
          {urg.icon}
          <span>{urg.label}</span>
        </div>
      </div>
    </motion.div>
  );
};

const DeadboardPage = () => {
  const { data: me } = useMe();
  const sectionId = me?.sectionId?._id || me?.sectionId;
  const { data: events = [], isLoading } = useUpcomingEvents(sectionId);

  // Filter to exams and deadlines only, include past ones within last 7 days
  const deadlines = useMemo(() => {
    return events
      .filter(e => DEADLINE_CATEGORIES.includes(e.category))
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [events]);

  const upcoming  = deadlines.filter(e => !isPast(new Date(e.startDate)) || isToday(new Date(e.startDate)));
  const past      = deadlines.filter(e => isPast(new Date(e.startDate)) && !isToday(new Date(e.startDate)));

  return (
    <AppShell navItems={STUDENT_NAV}>
      <PageHeader
        title="Deadboard"
        subtitle="Your upcoming exams and assignment deadlines"
      />

      {/* Summary pills */}
      {deadlines.length > 0 && (
        <motion.div
          className="flex gap-3 mb-6 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span className="text-sm font-medium text-red-700">
              {upcoming.filter(e => differenceInDays(new Date(e.startDate), new Date()) <= 7).length} this week
            </span>
          </div>
          <div className="flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-xl px-3 py-2">
            <CalendarDays className="w-3.5 h-3.5 text-sky-500" />
            <span className="text-sm font-medium text-sky-700">
              {upcoming.length} upcoming
            </span>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : deadlines.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={BookOpen}
            title="All clear!"
            body="No upcoming exams or deadlines. Check back later — teachers will post them here."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <p className="section-label">Upcoming</p>
              <div className="space-y-2">
                {upcoming.map((e, i) => <DeadlineCard key={e._id} event={e} index={i} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <p className="section-label">Past</p>
              <div className="space-y-2">
                {past.map((e, i) => <DeadlineCard key={e._id} event={e} index={i} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
};

export default DeadboardPage;
