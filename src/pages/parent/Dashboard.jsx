import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle2, AlertCircle, Info, Wifi, WifiOff } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner.jsx';
import LogCard from '@/components/shared/LogCard';
import EmptyState from '@/components/ui/EmptyState';
import ProgressChart from '@/components/shared/ProgressChart';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useMe } from '@/hooks/useAuth';
import { useParentFeed } from '@/hooks/useLogs';
import { PARENT_NAV } from './nav';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import clsx from 'clsx';

const ConnectionBadge = ({ connected }) => (
  <div className={clsx(
    'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all',
    connected ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-stone-50 text-stone-400 border-stone-200'
  )}>
    {connected ? <><Wifi className="w-3 h-3" /> Live</> : <><WifiOff className="w-3 h-3" /> Offline</>}
  </div>
);

const ParentDashboard = () => {
  const { user }               = useAuth();
  const { data: me }           = useMe();
  const { connected }          = useSocket();
  const { data: logs = [], isLoading } = useParentFeed();

  const [newIds, setNewIds]    = useState(new Set());
  const prevLogIds             = useRef(new Set());

  useEffect(() => {
    const currentIds = new Set(logs.map(l => l._id));
    const added = [...currentIds].filter(id => !prevLogIds.current.has(id));
    if (added.length > 0 && prevLogIds.current.size > 0) {
      setNewIds(prev => { const n = new Set(prev); added.forEach(id => n.add(id)); return n; });
      setTimeout(() => {
        setNewIds(prev => { const n = new Set(prev); added.forEach(id => n.delete(id)); return n; });
      }, 8000);
    }
    prevLogIds.current = currentIds;
  }, [logs]);

  const childCount = me?.studentIds?.length ?? 0;
  const toneCount  = logs.reduce((acc, l) => {
    if (l.enriched && l.tone) acc[l.tone] = (acc[l.tone] || 0) + 1;
    return acc;
  }, {});

  const { permission, requestPermission } = usePushNotifications();

  return (
    <AppShell navItems={PARENT_NAV}>
      <AnnouncementBanner />
      {/* Push notification permission banner */}
      {permission === 'default' && import.meta.env.VITE_FIREBASE_API_KEY && (
        <div className="card mb-4 flex items-center gap-3 bg-amber-50 border-amber-100">
          <span className="text-xl flex-shrink-0">🔔</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-800 text-sm">Enable push notifications</p>
            <p className="text-xs text-amber-600">Get notified about your child even when the app is closed</p>
          </div>
          <button onClick={requestPermission} className="btn-primary text-xs py-1.5 px-3 flex-shrink-0 bg-amber-600 hover:bg-amber-700">
            Enable
          </button>
        </div>
      )}
      <motion.div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="min-w-0">
          <p className="text-sm text-amber-600 font-semibold">Parent portal</p>
          <h1 className="page-title font-display truncate">{user?.firstName} {user?.lastName}</h1>
          <p className="page-subtitle">
            {childCount > 0 ? `Tracking ${childCount} child${childCount > 1 ? 'ren' : ''}` : 'No children linked yet'}
          </p>
        </div>
        <ConnectionBadge connected={connected} />
      </motion.div>

      {/* Tone stats */}
      {logs.length > 0 && (
        <motion.div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {[
            { key: 'positive', label: 'Positive',  color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
            { key: 'neutral',  label: 'Neutral',   color: 'text-stone-600',   bg: 'bg-stone-50',   icon: Info },
            { key: 'concern',  label: 'Attention', color: 'text-amber-700',   bg: 'bg-amber-50',   icon: AlertCircle },
          ].map(({ key, label, color, bg, icon: Icon }) => (
            <div key={key} className={clsx('card !p-2.5 sm:!p-3 text-center', bg)}>
              <p className={clsx('text-lg sm:text-xl font-bold', color)}>{toneCount[key] || 0}</p>
              <p className={clsx('text-[11px] sm:text-xs opacity-70 truncate', color)}>{label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Feed header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold text-stone-800">Activity Feed</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {logs.length} update{logs.length !== 1 ? 's' : ''} · updates arrive in real-time
          </p>
        </div>
        <Activity className="w-4 h-4 text-stone-300" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="card">
          <EmptyState icon={Activity} title="No updates yet"
            body="When a teacher logs a note about your child, it will appear here instantly — enriched by AI." />
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {logs.map(log => (
              <LogCard key={log._id} log={log} isNew={newIds.has(log._id)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Progress charts — one per child */}
      {me?.studentIds?.length > 0 && (
        <div className="mt-8 space-y-4">
          <p className="section-label">Academic Progress</p>
          {me.studentIds.map(child => {
            const childId = child?._id || child;
            const childName = child?.firstName || '';
            return (
              <ProgressChart
                key={String(childId)}
                studentId={String(childId)}
                name={childName}
                compact
              />
            );
          })}
        </div>
      )}
    </AppShell>
  );
};

export default ParentDashboard;
