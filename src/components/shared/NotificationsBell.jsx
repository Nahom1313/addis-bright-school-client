import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Trash2, BookMarked, Calendar, Video, ClipboardList, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications, useMarkRead, useMarkAllRead, useDeleteNotification } from '@/hooks/useNotifications.js';
import clsx from 'clsx';

const TYPE_ICON = {
  homework: BookMarked,
  event:    Calendar,
  meeting:  Video,
  log:      ClipboardList,
};

const NotifItem = ({ notif, onRead, onDelete }) => {
  const navigate  = useNavigate();
  const Icon = TYPE_ICON[notif.type] || Info;

  const handleClick = () => {
    if (!notif.read) onRead(notif._id);
    if (notif.link)  navigate(notif.link);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className={clsx(
        'flex items-start gap-3 px-4 py-3 group cursor-pointer transition-colors hover:bg-stone-50',
        !notif.read && 'bg-amber-50/60'
      )}
      onClick={handleClick}
    >
      <div className={clsx(
        'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
        notif.read ? 'bg-stone-100' : 'bg-amber-100'
      )}>
        <Icon className={clsx('w-4 h-4', notif.read ? 'text-stone-400' : 'text-amber-700')} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm leading-snug', notif.read ? 'text-stone-600' : 'text-stone-800 font-medium')}>
          {notif.title}
        </p>
        <p className="text-xs text-stone-400 truncate mt-0.5">{notif.body}</p>
        <p className="text-xs text-stone-300 mt-1">
          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
        </p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(notif._id); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity btn-icon text-stone-300 hover:text-red-400 flex-shrink-0"
        aria-label="Delete"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

const NotificationsBell = () => {
  const [open, setOpen]   = useState(false);
  const ref               = useRef(null);
  const { data, isLoading } = useNotifications();
  const markRead    = useMarkRead();
  const markAllRead = useMarkAllRead();
  const deleteNotif = useDeleteNotification();

  const notifications = data?.notifications || [];
  const unreadCount   = data?.unreadCount   || 0;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative btn-icon"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-stone-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-stone-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <span className="font-semibold text-stone-800 text-sm">Notifications</span>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="btn-icon text-stone-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />)}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 text-stone-200 mx-auto mb-2" />
                  <p className="text-sm text-stone-400">No notifications yet</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {notifications.map(n => (
                    <NotifItem
                      key={n._id}
                      notif={n}
                      onRead={(id) => markRead.mutate(id)}
                      onDelete={(id) => deleteNotif.mutate(id)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsBell;
