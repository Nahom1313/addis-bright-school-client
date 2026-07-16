import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, ClipboardList, ArrowRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/shared/AppShell';
import AnnouncementsPanel from '@/components/shared/AnnouncementsPanel.jsx';
import StatCard from '@/components/ui/StatCard';
import { useUserStats, useGrades } from '@/hooks/useSchool';
import { DIRECTOR_NAV } from './nav';

const QuickLink = ({ to, icon: Icon, label, desc, bg, text }) => (
  <Link to={to} className="card card-hover flex items-center gap-4 group">
    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${bg}`}>
      <Icon className={`w-5 h-5 ${text}`} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-semibold text-stone-800 text-sm">{label}</p>
      <p className="text-xs text-stone-400 mt-0.5">{desc}</p>
    </div>
    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition-all" />
  </Link>
);

const DirectorDashboard = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: sL } = useUserStats();
  const { data: grades, isLoading: gL } = useGrades();
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AppShell navItems={DIRECTOR_NAV}>
      <motion.div className="mb-8" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-amber-700 font-semibold">{greet}</p>
        <h1 className="page-title">{user?.firstName} {user?.lastName}</h1>
        <p className="page-subtitle">Addis Bright Academy — school overview</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard label="Students" value={stats?.students} icon={Users}         color="amber"  loading={sL} delay={0.05} />
        <StatCard label="Teachers" value={stats?.teachers} icon={GraduationCap} color="violet" loading={sL} delay={0.10} />
        <StatCard label="Parents"  value={stats?.parents}  icon={Users}         color="green"  loading={sL} delay={0.15} />
        <StatCard label="Sections" value={stats?.sections} icon={BookOpen}      color="sky"    loading={sL} delay={0.20} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <p className="section-label">Grades overview</p>
          <div className="card !p-0 overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              {gL ? (
                <div className="p-5 space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-11 bg-stone-100 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="text-left px-5 py-3 section-label">Grade</th>
                      <th className="text-left px-5 py-3 section-label">Sections</th>
                      <th className="text-left px-5 py-3 section-label">Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(grades || []).map((g, i) => (
                      <motion.tr key={g._id} className="table-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                        <td className="px-5 py-3.5 font-medium text-stone-800">{g.name}</td>
                        <td className="px-5 py-3.5 text-stone-500">{g.sections?.length ?? 0}</td>
                        <td className="px-5 py-3.5">
                          <span className="badge-stone">{g.sections?.reduce((a, s) => a + (s.studentCount || 0), 0) ?? 0} enrolled</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div>
          <p className="section-label">Quick actions</p>
          <div className="space-y-3">
            <QuickLink to="/director/users"       icon={Users}         label="Manage Users"     desc="Add teachers, students, parents" bg="bg-violet-50"  text="text-violet-600"  />
            <QuickLink to="/director/grades"      icon={BookOpen}      label="Grades & Sections" desc="Structure your school"          bg="bg-amber-50"   text="text-amber-700"  />
            <QuickLink to="/director/assignments" icon={ClipboardList} label="Assignments"       desc="Assign teachers to sections"    bg="bg-sky-50"     text="text-sky-600"    />
            <QuickLink to="/director/school"      icon={Building2}     label="School Settings"   desc="Bank accounts, school info"     bg="bg-emerald-50" text="text-emerald-700" />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <AnnouncementsPanel />
      </div>
    </AppShell>
  );
};

export default DirectorDashboard;
