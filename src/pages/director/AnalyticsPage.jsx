import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, PieChart,
  Pie, Legend, RadialBarChart, RadialBar,
} from 'recharts';
import {
  Users, GraduationCap, BookOpen, BarChart3,
  TrendingUp, CheckCircle2, XCircle, Clock, AlertCircle,
  Activity, Brain,
} from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { useUserStats, useGrades, useSections } from '@/hooks/useSchool';
import { DIRECTOR_NAV } from './nav';
import api from '@/api/client';
import clsx from 'clsx';

const BAR_COLORS = ['#e3a84a','#c8712a','#d4892a','#a85a24','#edc478','#8a4820','#f5ddb0','#713c1d'];
const TONE_COLORS = { positive: '#10b981', neutral: '#a8a29e', concern: '#f59e0b' };
const CAT_COLORS  = ['#6366f1','#f59e0b','#0ea5e9','#10b981','#ef4444','#8b5cf6','#f97316'];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-stone-800">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-xs">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const SectionCard = ({ title, children, icon: Icon, delay = 0, className = '' }) => (
  <motion.div className={clsx('card', className)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon className="w-4 h-4 text-stone-400" />}
      <p className="font-semibold text-stone-800 text-sm">{title}</p>
    </div>
    {children}
  </motion.div>
);

const AnalyticsPage = () => {
  const { data: stats, isLoading: sL } = useUserStats();
  const { data: grades = [], isLoading: gL } = useGrades();
  const { data: sections = [] } = useSections();

  const { data: overview, isLoading: oL } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get('/users/analytics/overview').then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

  // Students per grade chart data
  const gradeData = grades.map(g => ({
    name: g.name.replace('Grade ', 'Gr '),
    students: g.sections?.reduce((s, sec) => s + (sec.studentCount || 0), 0) ?? 0,
  }));

  const totalCapacity = sections.reduce((s, sec) => s + (sec.capacity || 0), 0);
  const totalEnrolled = sections.reduce((s, sec) => s + (sec.studentCount || 0), 0);
  const utilisation   = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  // Tone pie data
  const toneData = (overview?.logsByTone || []).map(t => ({
    name: t.tone, value: t.count, fill: TONE_COLORS[t.tone] || '#a8a29e',
  }));

  // Attendance radial
  const attRate = overview?.attendance?.rate;

  return (
    <AppShell navItems={DIRECTOR_NAV}>
      <PageHeader title="Analytics" subtitle="School-wide statistics, attendance, and AI insights" />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard label="Students"   value={stats?.students}  icon={Users}         color="amber"  loading={sL} delay={0.05} />
        <StatCard label="Teachers"   value={stats?.teachers}  icon={GraduationCap} color="violet" loading={sL} delay={0.10} />
        <StatCard label="Parents"    value={stats?.parents}   icon={Users}         color="green"  loading={sL} delay={0.15} />
        <StatCard label="New (7d)"   value={overview?.totals?.newStudents7} icon={TrendingUp} color="sky" loading={oL} delay={0.20} />
      </div>

      {/* Row 1: Students per grade + Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        <SectionCard title="Students per grade" icon={BarChart3} delay={0.25} className="lg:col-span-2">
          {gL ? <div className="h-52 bg-stone-100 rounded-xl animate-pulse" /> : (
            gradeData.length === 0
              ? <p className="text-sm text-stone-400 text-center py-12">No grade data yet</p>
              : <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={gradeData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f0e8" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip />} cursor={{ fill: '#fdf8f0' }} />
                    <Bar dataKey="students" radius={[6,6,0,0]} maxBarSize={48}>
                      {gradeData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Attendance rate */}
        <SectionCard title="Attendance rate (30d)" icon={CheckCircle2} delay={0.3}>
          {oL ? <div className="h-52 bg-stone-100 rounded-xl animate-pulse" /> : !overview?.attendance?.total ? (
            <p className="text-sm text-stone-400 text-center py-12">No attendance data yet</p>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className={clsx('text-4xl font-bold', attRate >= 90 ? 'text-emerald-600' : attRate >= 75 ? 'text-amber-600' : 'text-red-500')}>
                  {attRate}%
                </p>
                <p className="text-xs text-stone-400 mt-1">{overview.attendance.total} records</p>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'present', label: 'Present', color: 'bg-emerald-400' },
                  { key: 'absent',  label: 'Absent',  color: 'bg-red-400' },
                  { key: 'late',    label: 'Late',    color: 'bg-amber-400' },
                  { key: 'excused', label: 'Excused', color: 'bg-blue-400' },
                ].map(({ key, label, color }) => {
                  const val = overview.attendance[key] || 0;
                  const pct = overview.attendance.total > 0 ? Math.round((val / overview.attendance.total) * 100) : 0;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <p className="text-xs text-stone-500 w-14">{label}</p>
                      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <motion.div className={clsx('h-full rounded-full', color)}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.5 }} />
                      </div>
                      <p className="text-xs text-stone-400 w-8 text-right">{val}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* Row 2: Log activity timeline + Marks by subject */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <SectionCard title="Status log activity (30d)" icon={Activity} delay={0.35}>
          {oL ? <div className="h-44 bg-stone-100 rounded-xl animate-pulse" /> :
            !overview?.logActivity?.length
              ? <p className="text-sm text-stone-400 text-center py-10">No log activity yet</p>
              : <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={overview.logActivity} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f0e8" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={false} tickLine={false}
                      tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip />} />
                    <Line type="monotone" dataKey="count" name="Logs" stroke="#e3a84a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
          }
        </SectionCard>

        <SectionCard title="Average marks by subject" icon={BookOpen} delay={0.4}>
          {oL ? <div className="h-44 bg-stone-100 rounded-xl animate-pulse" /> :
            !overview?.marksBySubject?.length
              ? <p className="text-sm text-stone-400 text-center py-10">No marks data yet</p>
              : <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={overview.marksBySubject} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f0e8" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="subject" tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={false} tickLine={false} width={64} />
                    <Tooltip content={<Tip />} />
                    <Bar dataKey="avg" name="Avg %" radius={[0,4,4,0]} maxBarSize={14}>
                      {(overview.marksBySubject || []).map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
          }
        </SectionCard>
      </div>

      {/* Row 3: AI tone breakdown + Category breakdown + Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <SectionCard title="AI log tone breakdown" icon={Brain} delay={0.45}>
          {oL ? <div className="h-40 bg-stone-100 rounded-xl animate-pulse" /> :
            !toneData.length
              ? <p className="text-sm text-stone-400 text-center py-10">No enriched logs yet</p>
              : <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={toneData} cx="50%" cy="50%" innerRadius={40} outerRadius={60}
                        dataKey="value" nameKey="name" paddingAngle={3}>
                        {toneData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip content={<Tip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-1">
                    {toneData.map(t => (
                      <div key={t.name} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: t.fill }} />
                        <span className="text-xs text-stone-500 capitalize">{t.name} ({t.value})</span>
                      </div>
                    ))}
                  </div>
                </>
          }
        </SectionCard>

        <SectionCard title="Logs by category" icon={Activity} delay={0.5}>
          {oL ? <div className="h-40 bg-stone-100 rounded-xl animate-pulse" /> :
            !overview?.logsByCategory?.length
              ? <p className="text-sm text-stone-400 text-center py-10">No enriched logs yet</p>
              : <div className="space-y-2">
                  {overview.logsByCategory.map(({ category, count }, i) => {
                    const total = overview.logsByCategory.reduce((s, l) => s + l.count, 0);
                    const pct   = Math.round((count / total) * 100);
                    return (
                      <div key={category} className="flex items-center gap-2">
                        <p className="text-xs text-stone-500 w-20 capitalize">{category}</p>
                        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }}
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }} />
                        </div>
                        <p className="text-xs text-stone-400 w-6 text-right">{count}</p>
                      </div>
                    );
                  })}
                </div>
          }
        </SectionCard>

        <div className="space-y-4">
          <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <p className="section-label">Capacity utilisation</p>
            <div className="flex items-end gap-2 mb-2">
              <p className="text-3xl font-bold text-stone-900">{utilisation}%</p>
              <p className="text-sm text-stone-400 mb-1">{totalEnrolled}/{totalCapacity} seats</p>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-amber-500 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${utilisation}%` }} transition={{ duration: 0.8, delay: 0.6 }} />
            </div>
          </motion.div>

          <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <p className="section-label">Staff ratio</p>
            <p className="text-3xl font-bold text-stone-900">
              1:{stats?.teachers ? Math.round((stats.students || 0) / stats.teachers) : '—'}
            </p>
            <p className="text-xs text-stone-400 mt-1">Students per teacher</p>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
};

export default AnalyticsPage;
