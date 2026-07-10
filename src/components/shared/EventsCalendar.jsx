import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isSameDay, isToday, isFuture, isPast } from 'date-fns';
import { Calendar, Plus, Trash2, ChevronRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { useUpcomingEvents, useCreateEvent, useDeleteEvent } from '@/hooks/useSchool';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

const CATEGORY_STYLES = {
  holiday:  'bg-rose-50   text-rose-700   border-rose-100',
  exam:     'bg-red-50    text-red-700    border-red-100',
  meeting:  'bg-violet-50 text-violet-700 border-violet-100',
  sports:   'bg-green-50  text-green-700  border-green-100',
  cultural: 'bg-amber-50  text-amber-700  border-amber-100',
  deadline: 'bg-orange-50 text-orange-700 border-orange-100',
  other:    'bg-stone-50  text-stone-600  border-stone-100',
};

const CATEGORY_DOT = {
  holiday:  'bg-rose-500',
  exam:     'bg-red-500',
  meeting:  'bg-violet-500',
  sports:   'bg-green-500',
  cultural: 'bg-amber-500',
  deadline: 'bg-orange-500',
  other:    'bg-stone-400',
};

const CATEGORIES = ['holiday', 'exam', 'meeting', 'sports', 'cultural', 'deadline', 'other'];

const EventCard = ({ event, canDelete, onDelete }) => {
  const start = new Date(event.startDate);
  const today = isToday(start);
  const past  = isPast(start) && !today;

  return (
    <motion.div
      className={clsx(
        'flex items-start gap-4 p-4 rounded-2xl border transition-opacity',
        CATEGORY_STYLES[event.category] || CATEGORY_STYLES.other,
        past && 'opacity-50'
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: past ? 0.5 : 1, y: 0 }}
    >
      {/* Date block */}
      <div className="flex-shrink-0 text-center min-w-[3rem]">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
          {format(start, 'MMM')}
        </p>
        <p className="text-2xl font-bold leading-none">{format(start, 'd')}</p>
        {today && (
          <span className="text-[10px] font-bold uppercase tracking-wide bg-white/60 px-1.5 py-0.5 rounded-full">
            Today
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm">{event.title}</p>
          <span className={clsx(
            'text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full',
            'bg-white/50'
          )}>
            {event.category}
          </span>
          {event.scope === 'section' && event.sectionId && (
            <span className="text-[10px] bg-white/50 px-2 py-0.5 rounded-full">
              Section {event.sectionId.name}
            </span>
          )}
        </div>
        {event.description && (
          <p className="text-xs mt-1 opacity-70 line-clamp-2">{event.description}</p>
        )}
        <p className="text-xs mt-1 opacity-50">
          {format(start, 'EEEE, MMMM d, yyyy')}
          {event.endDate && ` → ${format(new Date(event.endDate), 'MMM d')}`}
          {' · '}{event.createdBy?.firstName} {event.createdBy?.lastName}
        </p>
      </div>

      {canDelete && (
        <button
          onClick={() => onDelete(event._id)}
          className="flex-shrink-0 p-1.5 rounded-lg bg-white/40 hover:bg-white/70 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
};

const CreateEventModal = ({ open, onClose, sectionId }) => {
  const create = useCreateEvent();
  const [f, setF] = useState({
    title: '', description: '', scope: sectionId ? 'section' : 'school',
    startDate: '', endDate: '', category: 'other',
    sectionId: sectionId || '',
  });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = e => {
    e.preventDefault();
    const payload = { ...f };
    if (!payload.endDate) delete payload.endDate;
    if (!payload.sectionId) delete payload.sectionId;
    create.mutate(payload, { onSuccess: () => { onClose(); setF({ title:'', description:'', scope:'school', startDate:'', endDate:'', category:'other', sectionId: sectionId||'' }); } });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Event" size="md">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={f.title} onChange={set('title')} required placeholder="e.g. End of Term Exams" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select className="input" value={f.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Scope</label>
            <select className="input" value={f.scope} onChange={set('scope')}>
              <option value="school">School-wide</option>
              <option value="section">Section only</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Start date</label>
            <input className="input" type="date" value={f.startDate} onChange={set('startDate')} required />
          </div>
          <div>
            <label className="label">End date (optional)</label>
            <input className="input" type="date" value={f.endDate} onChange={set('endDate')} />
          </div>
        </div>
        <div>
          <label className="label">Description (optional)</label>
          <textarea className="input" rows={2} value={f.description} onChange={set('description')} placeholder="Details about the event…" />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Create event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const EventsCalendar = ({ sectionId = null, showCreate = false, title = 'Upcoming Events' }) => {
  const { user } = useAuth();
  const { data: events = [], isLoading } = useUpcomingEvents(sectionId);
  const deleteEvent = useDeleteEvent();
  const [modal, setModal] = useState(false);

  const canDelete = ['director', 'teacher'].includes(user?.role);
  const canCreate = showCreate && ['director', 'teacher'].includes(user?.role);

  // Group by month
  const grouped = events.reduce((acc, ev) => {
    const key = format(new Date(ev.startDate), 'MMMM yyyy');
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold text-stone-800">{title}</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {events.length} upcoming event{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canCreate && (
          <button className="btn-primary flex items-center gap-2" onClick={() => setModal(true)}>
            <Plus className="w-4 h-4" /> Add event
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Calendar}
            title="No upcoming events"
            body="Events created by teachers and the director will appear here."
            action={canCreate ? <button className="btn-primary" onClick={() => setModal(true)}>Create event</button> : null}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, evs]) => (
            <div key={month}>
              <p className="section-label">{month}</p>
              <div className="space-y-2">
                {evs.map(ev => (
                  <EventCard
                    key={ev._id}
                    event={ev}
                    canDelete={canDelete}
                    onDelete={id => deleteEvent.mutate(id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateEventModal open={modal} onClose={() => setModal(false)} sectionId={sectionId} />
    </div>
  );
};

export default EventsCalendar;
