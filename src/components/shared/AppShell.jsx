import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, LogOut, Menu, X } from 'lucide-react';
import { useLogout } from '@/hooks/useAuth';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '@/components/ui/LanguageToggle';
import NotificationsBell from '@/components/shared/NotificationsBell';
import clsx from 'clsx';

const ROLE_ACCENT = {
  director: 'from-violet-900 to-violet-700',
  teacher:  'from-sky-900   to-sky-700',
  parent:   'from-emerald-900 to-emerald-700',
  student:  'from-amber-800 to-amber-600',
};

const Sidebar = ({ navItems, onClose }) => {
  const { user } = useAuth();
  const logout   = useLogout();
  const { t }    = useTranslation();
  const accent   = ROLE_ACCENT[user?.role] || 'from-stone-900 to-stone-700';
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` : '??';

  return (
    <div className="flex flex-col h-full bg-white border-r border-stone-100">
      {/* Logo bar */}
      <div className={`bg-gradient-to-br ${accent} px-5 py-5`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-semibold text-sm leading-none font-display">Addis Bright</p>
            <p className="text-white/60 text-xs mt-0.5 capitalize">{user?.role} Portal</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="ml-auto text-white/60 hover:text-white flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        <p className="section-label px-3 mb-2">Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
              isActive
                ? 'bg-amber-50 text-amber-800 font-semibold'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={clsx('w-4 h-4 flex-shrink-0', isActive ? 'text-amber-700' : 'text-stone-400 group-hover:text-stone-600')} />
                <span className="truncate">{item.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-600 flex-shrink-0" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Language section — log translation toggle only (translates status
          log content to Amharic on demand). The UI language switcher was
          removed platform-wide. */}
      <div className="px-3 py-3 border-t border-stone-100 space-y-1">
        <LanguageToggle />
      </div>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-stone-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-stone-50 mb-1">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${accent} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-stone-900 truncate leading-none">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-stone-400 truncate mt-0.5">{user?.email}</p>
          </div>
          <NotificationsBell />
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" /> {t('common.logout')}
        </button>
      </div>
    </div>
  );
};

const AppShell = ({ navItems, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0">
        <Sidebar navItems={navItems} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden shadow-2xl" initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}>
              <Sidebar navItems={navItems} onClose={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-100 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="btn-icon"><Menu className="w-5 h-5" /></button>
          <span className="text-sm font-semibold font-display text-stone-800 flex-1">Addis Bright</span>
          <NotificationsBell />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
