import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAnnouncements } from '@/hooks/useAnnouncements.js';
import clsx from 'clsx';

const AnnouncementItem = ({ a }) => {
  const [expanded, setExpanded] = useState(false);
  const isUrgent = a.priority === 'urgent';
  const isLong   = a.body.length > 120;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={clsx(
        'rounded-2xl px-4 py-3 border',
        isUrgent
          ? 'bg-red-50 border-red-200'
          : 'bg-amber-50 border-amber-200'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={clsx(
          'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
          isUrgent ? 'bg-red-100' : 'bg-amber-100'
        )}>
          {isUrgent
            ? <AlertTriangle className="w-4 h-4 text-red-600" />
            : <Megaphone className="w-4 h-4 text-amber-700" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={clsx('text-sm font-bold', isUrgent ? 'text-red-700' : 'text-amber-800')}>
              {a.title}
            </span>
            {isUrgent && (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                Urgent
              </span>
            )}
          </div>

          <p className={clsx(
            'text-sm leading-relaxed',
            isUrgent ? 'text-red-700' : 'text-amber-800',
            !expanded && isLong && 'line-clamp-2'
          )}>
            {a.body}
          </p>

          <div className="flex items-center justify-between mt-1.5">
            <p className={clsx('text-xs', isUrgent ? 'text-red-400' : 'text-amber-600')}>
              {a.createdBy?.firstName} {a.createdBy?.lastName} ·{' '}
              {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(v => !v)}
                className={clsx(
                  'flex items-center gap-0.5 text-xs font-medium',
                  isUrgent ? 'text-red-500 hover:text-red-700' : 'text-amber-600 hover:text-amber-800'
                )}
              >
                {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Drop this at the top of any role's dashboard.
 * It fetches announcements targeted at the logged-in user's role automatically.
 */
export default function AnnouncementBanner() {
  const { data: announcements = [], isLoading } = useAnnouncements();
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || dismissed || !announcements.length) return null;

  // Sort: urgent first
  const sorted = [...announcements].sort((a, b) => {
    if (a.priority === b.priority) return new Date(b.createdAt) - new Date(a.createdAt);
    return a.priority === 'urgent' ? -1 : 1;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 space-y-2 relative"
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors"
        title="Dismiss"
      >
        <X className="w-3 h-3 text-stone-600" />
      </button>

      <AnimatePresence>
        {sorted.map(a => <AnnouncementItem key={a._id} a={a} />)}
      </AnimatePresence>
    </motion.div>
  );
}
