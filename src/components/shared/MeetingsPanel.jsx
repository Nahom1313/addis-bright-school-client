import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isFuture, isPast, addMinutes } from 'date-fns';
import { Video, Plus, Trash2, ExternalLink, Clock, Users, X, Calendar } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { useUpcomingMeetings, useCreateMeeting, useDeleteMeeting, useSections } from '@/hooks/useSchool';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

const JITSI_HOST = 'https://meet.jit.si';

// ─── Status helpers ───────────────────────────────────────────────
const getMeetingStatus = (meeting) => {
  const start = new Date(meeting.scheduledAt);
  const end = addMinutes(start, meeting.durationMinutes || 60);
  const now = new Date();
  if (now >= start && now <= end) return 'live';
  if (isFuture(start)) return 'upcoming';
  return 'ended';
};

const STATUS_STYLES = {
  live:     { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', card: 'border-emerald-200 bg-emerald-50/40' },
  upcoming: { badge: 'bg-violet-100 text-violet-700',   dot: 'bg-violet-400',  card: 'border-stone-100 bg-white' },
  ended:    { badge: 'bg-stone-100 text-stone-500',     dot: 'bg-stone-300',   card: 'border-stone-100 bg-white opacity-60' },
};

// ─── Jitsi Room Modal ─────────────────────────────────────────────
const JitsiModal = ({ meeting, user, onClose }) => {
  const displayName = `${user.firstName} ${user.lastName}`;
  const audioOnly = meeting.meetingType === 'audio';
  const config = audioOnly
    ? 'config.startWithVideoMuted=true&config.startAudioOnly=true'
    : 'config.startWithVideoMuted=false';
  const jitsiUrl = `${JITSI_HOST}/${meeting.roomName}?${config}#userInfo.displayName="${encodeURIComponent(displayName)}"`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-900">
      <div className="flex items-center justify-between px-5 py-3 bg-stone-800 border-b border-stone-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Live</span>
          </div>
          <span className="text-white font-semibold text-sm">{meeting.title}</span>
          {audioOnly && <span className="text-xs text-amber-400">🎙️ Audio only</span>}
        </div>
        <div className="flex items-center gap-2">
          <a href={jitsiUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-700">
            <ExternalLink className="w-3.5 h-3.5" /> Open in new tab
          </a>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-700 text-stone-300 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <iframe
        src={jitsiUrl}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="flex-1 w-full border-0"
        title={meeting.title}
      />
    </div>
  );
};

// ─── Schedule Meeting Modal ────────────────────────────────────────
const ScheduleModal = ({ open, onClose }) => {
  const create = useCreateMeeting();
  const { data: sections = [] } = useSections();
  const [f, setF] = useState({
    title: '', description: '', scheduledAt: '', durationMinutes: 60,
    scope: 'school', sectionId: '', meetingType: 'video',
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      title: f.title,
      description: f.description,
      scheduledAt: f.scheduledAt,
      durationMinutes: Number(f.durationMinutes),
      scope: f.scope,
      meetingType: f.meetingType,
    };
    if (f.scope === 'section' && f.sectionId) payload.sectionId = f.sectionId;
    create.mutate(payload, {
      onSuccess: () => {
        onClose();
        setF({ title: '', description: '', scheduledAt: '', durationMinutes: 60, scope: 'school', sectionId: '', meetingType: 'video' });
      },
    });
  };

  const minDt = new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16);

  return (
    <Modal open={open} onClose={onClose} title="Schedule Meeting" size="md">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Meeting title</label>
          <input className="input" value={f.title} onChange={set('title')} required placeholder="e.g. Parent-Teacher Conference" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date & time</label>
            <input className="input" type="datetime-local" min={minDt} value={f.scheduledAt} onChange={set('scheduledAt')} required />
          </div>
          <div>
            <label className="label">Duration</label>
            <select className="input" value={f.durationMinutes} onChange={set('durationMinutes')}>
              {[15, 30, 45, 60, 90, 120, 180].map(m => (
                <option key={m} value={m}>{m} min</option>
              ))}
            </select>
          </div>
        </div>

        {/* Meeting type */}
        <div>
          <label className="label">Meeting type</label>
          <div className="flex gap-2">
            {[['video', '📹 Video & Audio'], ['audio', '🎙️ Audio only']].map(([val, label]) => (
              <button key={val} type="button"
                onClick={() => setF(p => ({ ...p, meetingType: val }))}
                className={clsx('flex-1 py-2 rounded-xl border text-sm font-medium transition-colors',
                  f.meetingType === val
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                )}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Audience */}
        <div>
          <label className="label">Audience</label>
          <select className="input" value={f.scope} onChange={set('scope')}>
            <option value="school">School-wide (everyone)</option>
            <option value="section">Specific section</option>
          </select>
        </div>

        {/* Section picker — only when scope is section */}
        {f.scope === 'section' && (
          <div>
            <label className="label">Select section</label>
            <select className="input" value={f.sectionId} onChange={set('sectionId')} required>
              <option value="">Choose a section…</option>
              {sections.map(s => (
                <option key={s._id} value={s._id}>
                  {s.gradeId?.name || 'Grade'} — Section {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label">Description (optional)</label>
          <textarea className="input" rows={2} value={f.description} onChange={set('description')} placeholder="Agenda, topics to cover…" />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={create.isPending}>
            {create.isPending ? 'Scheduling…' : 'Schedule meeting'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Meeting Card ─────────────────────────────────────────────────
const MeetingCard = ({ meeting, canManage, onDelete, onJoin }) => {
  const status = getMeetingStatus(meeting);
  const styles = STATUS_STYLES[status];
  const start = new Date(meeting.scheduledAt);
  const end = addMinutes(start, meeting.durationMinutes || 60);

  return (
    <motion.div
      className={clsx('flex items-start gap-4 p-4 rounded-2xl border transition-all', styles.card)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: status === 'ended' ? 0.6 : 1, y: 0 }}
    >
      {/* Date block */}
      <div className="flex-shrink-0 text-center min-w-[3rem]">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
          {format(start, 'MMM')}
        </p>
        <p className="text-2xl font-bold leading-none text-stone-800">{format(start, 'd')}</p>
        <p className="text-[10px] text-stone-400 mt-0.5">{format(start, 'EEE')}</p>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm text-stone-900">{meeting.title}</p>
          <span className={clsx('text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex items-center gap-1', styles.badge)}>
            {status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            {status}
          </span>
          {meeting.scope === 'section' && meeting.sectionId && (
            <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
              Section {meeting.sectionId.name}
            </span>
          )}
        </div>
        {meeting.description && (
          <p className="text-xs mt-1 text-stone-500 line-clamp-2">{meeting.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {meeting.createdBy?.firstName} {meeting.createdBy?.lastName}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {(status === 'live' || status === 'upcoming') && (
          <button
            onClick={() => onJoin(meeting)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
              status === 'live'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-violet-600 hover:bg-violet-700 text-white'
            )}
          >
            <Video className="w-3.5 h-3.5" />
            {status === 'live' ? 'Join now' : 'Join'}
          </button>
        )}
        {canManage && (
          <button
            onClick={() => onDelete(meeting._id)}
            className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-50 hover:text-red-600 text-stone-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main Panel ───────────────────────────────────────────────────
const MeetingsPanel = ({ sectionId = null, showCreate = false, title = 'Virtual Meetings' }) => {
  const { user } = useAuth();
  const { data: meetings = [], isLoading } = useUpcomingMeetings(sectionId);
  const deleteMeeting = useDeleteMeeting();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);

  const canManage = ['director', 'teacher'].includes(user?.role);
  const canCreate = showCreate && canManage;

  // Group by date
  const grouped = meetings.reduce((acc, m) => {
    const key = format(new Date(m.scheduledAt), 'EEEE, MMMM d, yyyy');
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const liveMeetings = meetings.filter(m => getMeetingStatus(m) === 'live');

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-stone-800">{title}</p>
            <p className="text-xs text-stone-400 mt-0.5">
              {liveMeetings.length > 0
                ? `${liveMeetings.length} meeting${liveMeetings.length !== 1 ? 's' : ''} in progress`
                : `${meetings.length} scheduled`}
            </p>
          </div>
          {canCreate && (
            <button className="btn-primary flex items-center gap-2" onClick={() => setScheduleOpen(true)}>
              <Plus className="w-4 h-4" /> Schedule meeting
            </button>
          )}
        </div>

        {/* Live banner */}
        {liveMeetings.length > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-800 flex-1">
              {liveMeetings.length === 1
                ? `"${liveMeetings[0].title}" is happening now`
                : `${liveMeetings.length} meetings are in progress`}
            </p>
            <button
              onClick={() => setActiveMeeting(liveMeetings[0])}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <Video className="w-3.5 h-3.5" /> Join
            </button>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : meetings.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Video}
              title="No upcoming meetings"
              body="Virtual meetings scheduled by staff will appear here."
              action={canCreate ? (
                <button className="btn-primary" onClick={() => setScheduleOpen(true)}>
                  Schedule first meeting
                </button>
              ) : null}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([day, dayMeetings]) => (
              <div key={day}>
                <p className="section-label">{day}</p>
                <div className="space-y-2">
                  {dayMeetings.map(m => (
                    <MeetingCard
                      key={m._id}
                      meeting={m}
                      canManage={canManage}
                      onDelete={(id) => deleteMeeting.mutate(id)}
                      onJoin={setActiveMeeting}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule modal */}
      <ScheduleModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />

      {/* Jitsi fullscreen room */}
      <AnimatePresence>
        {activeMeeting && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <JitsiModal
              meeting={activeMeeting}
              user={user}
              onClose={() => setActiveMeeting(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MeetingsPanel;
