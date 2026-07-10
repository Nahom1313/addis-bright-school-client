import { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isToday, isWithinInterval, parseISO,
  addMonths, subMonths, startOfWeek, endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '@/components/shared/AppShell';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useCalendar, useCreateEntry, useUpdateEntry, useDeleteEntry } from '@/hooks/useCalendar';
import { useTeacherAssignments } from '@/hooks/useSchool';
import clsx from 'clsx';

// ─── Constants ────────────────────────────────────────────────────
const TYPE_META = {
  term:    { label: 'Term',         color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
  exam:    { label: 'Exam',         color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  holiday: { label: 'Holiday',      color: '#2563eb', bg: '#dbeafe', border: '#93c5fd' },
  break:   { label: 'School Break', color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd' },
  special: { label: 'Special Day',  color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
};

const DIRECTOR_TYPES = ['term', 'exam', 'holiday', 'break', 'special'];
const TEACHER_TYPES  = ['exam'];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Entry form modal ─────────────────────────────────────────────
const EntryModal = ({ open, onClose, editing, userRole, sections = [] }) => {
  const create = useCreateEntry();
  const update = useUpdateEntry();
  const isEdit = !!editing;

  const allowedTypes = userRole === 'director' ? DIRECTOR_TYPES : TEACHER_TYPES;

  const [form, setForm] = useState({
    title:       editing?.title       || '',
    type:        editing?.type        || allowedTypes[0],
    startDate:   editing?.startDate   ? format(new Date(editing.startDate), 'yyyy-MM-dd') : '',
    endDate:     editing?.endDate     ? format(new Date(editing.endDate),   'yyyy-MM-dd') : '',
    description: editing?.description || '',
    sectionId:   editing?.sectionId?._id || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form, description: form.description || null };
    if (isEdit) {
      update.mutate({ id: editing._id, data: payload }, { onSuccess: onClose });
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Entry' : 'Add Calendar Entry'} size="sm">
      <form onSubmit={submit} className="space-y-4">
        {/* Type */}
        <div>
          <label className="label">Type</label>
          <div className="flex flex-wrap gap-2">
            {allowedTypes.map(t => (
              <button key={t} type="button"
                onClick={() => set('type', t)}
                style={{
                  backgroundColor: form.type === t ? TYPE_META[t].bg : undefined,
                  color: form.type === t ? TYPE_META[t].color : undefined,
                  borderColor: form.type === t ? TYPE_META[t].border : undefined,
                }}
                className={clsx(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all',
                  form.type !== t && 'border-stone-200 text-stone-400 hover:border-stone-300'
                )}>
                {TYPE_META[t].label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="e.g. Term 1 begins, Mid-term exam"
            value={form.title} onChange={e => set('title', e.target.value)}
            maxLength={150} required />
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Start date</label>
            <input type="date" className="input" value={form.startDate}
              onChange={e => set('startDate', e.target.value)} required />
          </div>
          <div>
            <label className="label">End date</label>
            <input type="date" className="input" value={form.endDate}
              min={form.startDate}
              onChange={e => set('endDate', e.target.value)} required />
          </div>
        </div>

        {/* Section picker for teacher exam entries */}
        {userRole === 'teacher' && sections.length > 0 && (
          <div>
            <label className="label">Section <span className="text-stone-400 font-normal">(optional)</span></label>
            <select className="input" value={form.sectionId} onChange={e => set('sectionId', e.target.value)}>
              <option value="">All my sections</option>
              {sections.map(s => (
                <option key={s._id} value={s._id}>
                  {s.gradeId?.name} — Section {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="label">Description <span className="text-stone-400 font-normal">(optional)</span></label>
          <textarea className="input resize-none" rows={2}
            placeholder="Any additional notes…"
            value={form.description} onChange={e => set('description', e.target.value)}
            maxLength={500} />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={pending}>
            {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Add entry'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Legend ───────────────────────────────────────────────────────
const Legend = () => (
  <div className="flex flex-wrap gap-2 mb-4">
    {Object.entries(TYPE_META).map(([key, meta]) => (
      <span key={key} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
        style={{ backgroundColor: meta.bg, color: meta.color }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
        {meta.label}
      </span>
    ))}
  </div>
);

// ─── Sidebar entry list ───────────────────────────────────────────
const EntryList = ({ entries, canEdit, onEdit, onDelete }) => {
  if (!entries.length) return (
    <p className="text-xs text-stone-400 py-4 text-center">No entries this month</p>
  );

  return (
    <div className="space-y-2">
      {entries.map(e => {
        const meta = TYPE_META[e.type];
        const canModify = canEdit && (canEdit === 'director' || String(e.createdBy?._id) === 'me');
        return (
          <div key={e._id} className="flex items-start gap-2 group">
            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: meta.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-stone-800 leading-snug">{e.title}</p>
              <p className="text-[10px] text-stone-400">
                {format(new Date(e.startDate), 'MMM d')}
                {format(new Date(e.startDate), 'yyyy-MM-dd') !== format(new Date(e.endDate), 'yyyy-MM-dd')
                  ? ` — ${format(new Date(e.endDate), 'MMM d')}`
                  : ''}
              </p>
              {e.sectionId && (
                <p className="text-[10px] text-stone-400">
                  {e.sectionId.gradeId?.name} — Section {e.sectionId.name}
                </p>
              )}
            </div>
            {canEdit && (
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => onEdit(e)} className="btn-icon text-stone-400 hover:text-amber-600 w-6 h-6">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => onDelete(e._id)} className="btn-icon text-stone-400 hover:text-red-500 w-6 h-6">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Main calendar page ───────────────────────────────────────────
export default function AcademicCalendarPage({ navItems, appShellRole }) {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);

  const year = `${currentMonth.getFullYear()}/${currentMonth.getFullYear() + 1}`;
  const { data: entries = [], isLoading } = useCalendar();
  const deleteEntry = useDeleteEntry();

  // Teacher's assigned sections for section picker
  const { data: assignments = [] } = useTeacherAssignments(
    user?.role === 'teacher' ? user._id : null
  );
  const teacherSections = [...new Map(
    assignments.map(a => [String(a.sectionId?._id), a.sectionId])
  ).values()].filter(Boolean);

  const canEdit = user?.role === 'director' || user?.role === 'teacher';

  // Build calendar grid
  const monthStart  = startOfMonth(currentMonth);
  const monthEnd    = endOfMonth(currentMonth);
  const calStart    = startOfWeek(monthStart);
  const calEnd      = endOfWeek(monthEnd);
  const calDays     = eachDayOfInterval({ start: calStart, end: calEnd });

  // Get entries that overlap with a given day
  const getEntriesForDay = (day) =>
    entries.filter(e =>
      isWithinInterval(day, {
        start: new Date(e.startDate),
        end:   new Date(e.endDate),
      })
    );

  // Entries for the whole visible month (for sidebar)
  const monthEntries = entries.filter(e => {
    const start = new Date(e.startDate);
    const end   = new Date(e.endDate);
    return start <= monthEnd && end >= monthStart;
  }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return (
    <AppShell navItems={navItems}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-600" /> Academic Calendar
          </h1>
          <p className="page-subtitle">School year {year}</p>
        </div>
        {canEdit && (
          <button className="btn-primary flex items-center gap-2"
            onClick={() => { setEditing(null); setModal(true); }}>
            <Plus className="w-4 h-4" /> Add entry
          </button>
        )}
      </div>

      <Legend />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar grid */}
        <div className="lg:col-span-2 card !p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button className="btn-icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="font-bold text-stone-800 text-lg font-display">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button className="btn-icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-stone-400 uppercase py-1.5">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          {isLoading ? (
            <div className="h-64 bg-stone-100 rounded-xl animate-pulse" />
          ) : (
            <div className="grid grid-cols-7 gap-px bg-stone-100 rounded-xl overflow-hidden border border-stone-100">
              {calDays.map((day, idx) => {
                const dayEntries  = getEntriesForDay(day);
                const inMonth     = isSameMonth(day, currentMonth);
                const todayClass  = isToday(day);

                return (
                  <div key={idx}
                    className={clsx(
                      'bg-white min-h-[72px] p-1.5 flex flex-col',
                      !inMonth && 'opacity-30'
                    )}>
                    <span className={clsx(
                      'text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center mb-1 flex-shrink-0',
                      todayClass ? 'bg-amber-600 text-white' : 'text-stone-600'
                    )}>
                      {format(day, 'd')}
                    </span>
                    <div className="space-y-0.5 flex-1">
                      {dayEntries.slice(0, 3).map(e => (
                        <div key={e._id}
                          className="text-[9px] font-semibold px-1 py-0.5 rounded truncate leading-tight"
                          style={{ backgroundColor: TYPE_META[e.type]?.bg, color: TYPE_META[e.type]?.color }}>
                          {e.title}
                        </div>
                      ))}
                      {dayEntries.length > 3 && (
                        <div className="text-[9px] text-stone-400 px-1">+{dayEntries.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar — this month's entries */}
        <div className="card">
          <h3 className="font-semibold text-stone-800 mb-3 text-sm">
            {format(currentMonth, 'MMMM')} Entries
          </h3>
          <EntryList
            entries={monthEntries}
            canEdit={canEdit ? user?.role : null}
            onEdit={(e) => { setEditing(e); setModal(true); }}
            onDelete={(id) => deleteEntry.mutate(id)}
          />
        </div>
      </div>

      <EntryModal
        open={modal}
        onClose={() => { setModal(false); setEditing(null); }}
        editing={editing}
        userRole={user?.role}
        sections={teacherSections}
      />
    </AppShell>
  );
}
