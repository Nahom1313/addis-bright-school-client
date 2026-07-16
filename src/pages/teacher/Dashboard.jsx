import { motion } from 'framer-motion';
import { BookOpen, Users, ClipboardList, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/shared/AppShell';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner.jsx';
import StatCard from '@/components/ui/StatCard';
import { useTeacherAssignments } from '@/hooks/useSchool';
import { TEACHER_NAV } from './nav';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { data: assignments = [], isLoading } = useTeacherAssignments(user?._id);

  const uniqueSections = [...new Set(assignments.map(a => a.sectionId?._id))].length;
  const subjects = [...new Set(assignments.map(a => a.subject))];
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AppShell navItems={TEACHER_NAV}>
      <AnnouncementBanner />
      <motion.div className="mb-8" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-sky-700 font-semibold">{greet}</p>
        <h1 className="page-title">{user?.firstName} {user?.lastName}</h1>
        <p className="page-subtitle">Teacher portal — manage your classes and students</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
        <StatCard label="My Sections"  value={uniqueSections}         icon={Users}          color="sky"   loading={isLoading} delay={0.05} />
        <StatCard label="Subjects"     value={subjects.length}        icon={BookOpen}       color="amber" loading={isLoading} delay={0.10} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Assignments summary */}
        <div>
          <p className="section-label">My assignments</p>
          <div className="card !p-0 overflow-hidden">
            {isLoading ? (
              <div className="p-5 space-y-3">{[1,2,3].map(i=><div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse"/>)}</div>
            ) : assignments.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-sm">No assignments yet</div>
            ) : (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b border-stone-100">
                  <th className="text-left px-5 py-3 section-label">Subject</th>
                  <th className="text-left px-5 py-3 section-label">Section</th>
                  <th className="text-left px-5 py-3 section-label">Grade</th>
                </tr></thead>
                <tbody>
                  {assignments.map((a, i) => (
                    <motion.tr key={a._id} className="table-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                      <td className="px-5 py-3"><span className="badge-amber">{a.subject}</span></td>
                      <td className="px-5 py-3 text-stone-700">Section {a.sectionId?.name}</td>
                      <td className="px-5 py-3 text-stone-500 text-xs">{a.sectionId?.gradeId?.name}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <p className="section-label">Quick actions</p>
          <div className="space-y-3">
            <Link to="/teacher/classes" className="card card-hover flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 text-sky-600" /></div>
              <div className="flex-1"><p className="font-semibold text-stone-800 text-sm">View Students</p><p className="text-xs text-stone-400">See rosters for your sections</p></div>
              <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/teacher/logs" className="card card-hover flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0"><ClipboardList className="w-5 h-5 text-amber-700" /></div>
              <div className="flex-1"><p className="font-semibold text-stone-800 text-sm">Log Student Status</p><p className="text-xs text-stone-400">AI-powered parent updates — Phase 5</p></div>
              <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
export default TeacherDashboard;
