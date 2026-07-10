import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Loader2 } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { registrationApi } from '@/api/registration';
import { TEACHER_NAV } from './nav';
import clsx from 'clsx';

const DAYS    = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const PERIODS = ['Period 1','Period 2','Period 3','Period 4','Period 5','Period 6','Period 7','Period 8'];

const PERIOD_TIMES = {
  'Period 1': '7:30–8:20', 'Period 2': '8:20–9:10', 'Period 3': '9:10–10:00',
  'Period 4': '10:20–11:10', 'Period 5': '11:10–12:00',
  'Period 6': '13:00–13:50', 'Period 7': '13:50–14:40', 'Period 8': '14:40–15:30',
};

const SUBJECT_COLORS = [
  'bg-amber-50 text-amber-800 border-amber-100',
  'bg-violet-50 text-violet-800 border-violet-100',
  'bg-sky-50 text-sky-800 border-sky-100',
  'bg-emerald-50 text-emerald-800 border-emerald-100',
  'bg-rose-50 text-rose-800 border-rose-100',
  'bg-orange-50 text-orange-800 border-orange-100',
];

export default function ProgramPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['timetable', user?._id],
    queryFn: () => registrationApi.getTimetable(user._id).then(r => r.data.data),
    enabled: !!user,
  });

  const slots = data?.timetable?.slots || [];

  // Build slot lookup map
  const slotMap = slots.reduce((m, s) => {
    m[`${s.day}_${s.period}`] = s;
    return m;
  }, {});

  // Unique subjects for color coding
  const subjects   = [...new Set(slots.map(s => s.subject))];
  const colorIndex = subjects.reduce((m, s, i) => { m[s] = SUBJECT_COLORS[i % SUBJECT_COLORS.length]; return m; }, {});

  // Summary stats
  const periodsPerWeek = slots.length;
  const uniqueSubjects = subjects.length;
  const uniqueSections = [...new Set(slots.map(s => s.sectionId?._id || s.sectionId))].length;

  return (
    <AppShell navItems={TEACHER_NAV}>
      <PageHeader title="My Program" subtitle="Your weekly teaching schedule" />

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
      ) : slots.length === 0 ? (
        <div className="card text-center py-16">
          <Calendar className="w-10 h-10 text-stone-200 mx-auto mb-3" />
          <p className="text-stone-600 font-medium">No timetable assigned yet</p>
          <p className="text-stone-400 text-sm mt-1">Contact the school registrar to set up your schedule</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Periods/week', value: periodsPerWeek },
              { label: 'Subjects',     value: uniqueSubjects },
              { label: 'Sections',     value: uniqueSections },
            ].map(({ label, value }, i) => (
              <motion.div key={label} className="card text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <p className="text-2xl font-bold text-stone-900">{value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{label}</p>
              </motion.div>
            ))}
          </div>

          {/* Subject legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            {subjects.map(s => (
              <span key={s} className={clsx('text-xs font-medium px-3 py-1 rounded-full border', colorIndex[s])}>{s}</span>
            ))}
          </div>

          {/* Timetable grid */}
          <div className="card !p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="px-3 py-3 text-left font-semibold text-stone-500 w-20">Period</th>
                  {DAYS.map(d => (
                    <th key={d} className="px-2 py-3 text-center font-semibold text-stone-600 min-w-[120px]">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period, pi) => (
                  <tr key={period} className={clsx('border-b border-stone-50', pi % 2 === 0 ? 'bg-white' : 'bg-stone-50/40')}>
                    <td className="px-3 py-3 text-stone-500 font-medium">
                      <p className="font-semibold">{period}</p>
                      <p className="text-stone-300">{PERIOD_TIMES[period]}</p>
                    </td>
                    {DAYS.map(day => {
                      const slot = slotMap[`${day}_${period}`];
                      return (
                        <td key={day} className="px-2 py-2">
                          {slot ? (
                            <motion.div
                              className={clsx('rounded-xl px-3 py-2 border', colorIndex[slot.subject])}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: pi * 0.02 }}
                            >
                              <p className="font-semibold text-[11px]">{slot.subject}</p>
                              <p className="text-[10px] opacity-70 mt-0.5">
                                {slot.sectionId?.gradeId?.name} · Sec {slot.sectionId?.name}
                              </p>
                              {slot.room && <p className="text-[10px] opacity-50">{slot.room}</p>}
                            </motion.div>
                          ) : (
                            <div className="rounded-xl px-3 py-2 bg-stone-50/60 border border-stone-100 text-center">
                              <span className="text-stone-200">—</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Program summary */}
          <div className="card mt-6">
            <p className="section-label mb-3">Subject breakdown</p>
            <div className="space-y-2">
              {subjects.map(subject => {
                const subjectSlots = slots.filter(s => s.subject === subject);
                const sectionNames = [...new Set(subjectSlots.map(s =>
                  `${s.sectionId?.gradeId?.name || ''} Sec ${s.sectionId?.name || ''}`
                ))];
                return (
                  <div key={subject} className="flex items-center gap-3">
                    <span className={clsx('text-[11px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0', colorIndex[subject])}>
                      {subject}
                    </span>
                    <span className="text-xs text-stone-500 flex-1">{sectionNames.join(' · ')}</span>
                    <span className="text-xs font-medium text-stone-400 flex-shrink-0">
                      {subjectSlots.length}×/wk
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AppShell>
  );
}
