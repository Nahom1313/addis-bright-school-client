import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, GraduationCap, UserPlus, ClipboardList, TrendingUp } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner.jsx';
import { useAuth } from '@/context/AuthContext';
import { registrationApi } from '@/api/registration';
import { REGISTRAR_NAV } from './nav';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const QuickStat = ({ label, value, icon: Icon, color, to, delay }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Link to={to} className="card flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-stone-900">{value ?? '—'}</p>
        <p className="text-xs text-stone-400">{label}</p>
      </div>
    </Link>
  </motion.div>
);

export default function RegistrarDashboard() {
  const { user } = useAuth();

  const { data: studentData } = useQuery({ queryKey: ['reg-students-count'], queryFn: () => registrationApi.getStudents({ limit: 1 }).then(r => r.data.data.total) });
  const { data: teacherData } = useQuery({ queryKey: ['reg-teachers-count'], queryFn: () => registrationApi.getTeachers({ limit: 1 }).then(r => r.data.data.total) });
  const { data: parentData  } = useQuery({ queryKey: ['reg-parents-count'],  queryFn: () => registrationApi.getParents({ limit: 1 }).then(r => r.data.data.total) });

  const QUICK_ACTIONS = [
    { label: 'Register new student', to: '/registrar/students?new=1', icon: Users,        color: 'bg-amber-500' },
    { label: 'Register new teacher', to: '/registrar/teachers?new=1', icon: GraduationCap, color: 'bg-violet-500' },
    { label: 'Register new parent',  to: '/registrar/parents?new=1',  icon: UserPlus,      color: 'bg-emerald-500' },
    { label: 'Manage timetables',    to: '/registrar/timetable',      icon: ClipboardList, color: 'bg-sky-500' },
  ];

  return (
    <AppShell navItems={REGISTRAR_NAV}>
      <AnnouncementBanner />
      <motion.div className="mb-8" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-amber-600 font-semibold">Registration Portal</p>
        <h1 className="text-2xl font-bold font-display text-stone-900">
          Welcome, {user?.firstName}
        </h1>
        <p className="text-stone-400 text-sm mt-1">Manage student, teacher and parent registrations</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <QuickStat label="Registered students" value={studentData} icon={Users}         color="bg-amber-500"   to="/registrar/students" delay={0.05} />
        <QuickStat label="Registered teachers" value={teacherData} icon={GraduationCap} color="bg-violet-500"  to="/registrar/teachers" delay={0.10} />
        <QuickStat label="Registered parents"  value={parentData}  icon={UserPlus}      color="bg-emerald-500" to="/registrar/parents"  delay={0.15} />
      </div>

      {/* Quick actions */}
      <p className="section-label mb-3">Quick actions</p>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((a, i) => (
          <motion.div key={a.to} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.05 }}>
            <Link to={a.to} className="card flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', a.color)}>
                <a.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-medium text-stone-700">{a.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
