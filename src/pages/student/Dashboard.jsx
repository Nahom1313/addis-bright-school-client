import { motion } from 'framer-motion';
import { BookOpen, User, Hash, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/shared/AppShell';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner.jsx';
import { useMe } from '@/hooks/useAuth';
import { STUDENT_NAV } from './nav';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { data: me } = useMe();
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AppShell navItems={STUDENT_NAV}>
      <AnnouncementBanner />
      <motion.div className="mb-8" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-amber-700 font-semibold">{greet}</p>
        <h1 className="page-title">{user?.firstName} {user?.lastName}</h1>
        <p className="page-subtitle">{me?.studentCode || 'Student portal'}</p>
      </motion.div>

      {/* Student info strip */}
      {me && (
        <motion.div className="card mb-6 bg-amber-50 border-amber-100" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {[
              [Hash, 'Student code', me.studentCode],
              [GraduationCap, 'Section', me.sectionId
                ? `${me.sectionId?.gradeId?.name || ''} — Section ${me.sectionId?.name || me.sectionId}`
                : 'Not enrolled yet'],
              [User, 'Status', me.isActive ? 'Active' : 'Inactive'],
            ].map(([Icon, label, value]) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-stone-400">{label}</p>
                  <p className="font-medium text-stone-800">{value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/student/profile" className="card card-hover flex items-center gap-4 group">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-amber-700" /></div>
          <div><p className="font-semibold text-stone-800 text-sm">My Profile</p><p className="text-xs text-stone-400 mt-0.5">View your account details</p></div>
        </Link>
        <Link to="/student/deadboard" className="card card-hover flex items-center gap-4 group">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 flex items-center justify-center flex-shrink-0"><BookOpen className="w-5 h-5 text-sky-600" /></div>
          <div><p className="font-semibold text-stone-800 text-sm">Deadboard</p><p className="text-xs text-stone-400 mt-0.5">Upcoming assignments — Phase 6</p></div>
        </Link>
      </div>
    </AppShell>
  );
};
export default StudentDashboard;
