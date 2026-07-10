import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Save, Loader2, ChevronDown } from 'lucide-react';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import { registrationApi } from '@/api/registration';
import { useSections } from '@/hooks/useSchool';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { REGISTRAR_NAV } from './nav';
import clsx from 'clsx';

const DAYS    = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const PERIODS = ['Period 1','Period 2','Period 3','Period 4','Period 5','Period 6','Period 7','Period 8'];
const SUBJECTS= ['Mathematics','English','Amharic','Science','Biology','Chemistry','Physics','History','Geography','Civics','Art','Physical Education','ICT'];

const PERIOD_TIMES = {
  'Period 1': '7:30–8:20',
  'Period 2': '8:20–9:10',
  'Period 3': '9:10–10:00',
  'Period 4': '10:20–11:10',
  'Period 5': '11:10–12:00',
  'Period 6': '13:00–13:50',
  'Period 7': '13:50–14:40',
  'Period 8': '14:40–15:30',
};

export default function TimetablePage() {
  const qc = useQueryClient();
  const [teacherId, setTeacherId] = useState('');
  const { data: sections = [] } = useSections();

  // Fetch all teachers
  const { data: teacherData } = useQuery({
    queryKey: ['reg-teachers-list'],
    queryFn: () => registrationApi.getTeachers({ limit: 200 }).then(r => r.data.data.teachers || []),
  });
  const teachers = teacherData || [];

  // Fetch timetable for selected teacher
  const { data: ttData, isLoading: ttLoading } = useQuery({
    queryKey: ['timetable', teacherId],
    queryFn: () => registrationApi.getTimetable(teacherId).then(r => r.data.data),
    enabled: !!teacherId,
  });

  // Build slot map: day_period -> slot
  const existingSlots = ttData?.timetable?.slots || [];
  const [slotMap, setSlotMap] = useState({});

  // Initialise slotMap when data loads
  useEffect(() => {
    if (existingSlots.length) {
      const m = {};
      existingSlots.forEach(s => {
        m[`${s.day}|${s.period}`] = {
          subject:   s.subject,
          sectionId: s.sectionId?._id || s.sectionId,
        };
      });
      setSlotMap(m);
    }
  }, [existingSlots.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const setSlot = (day, period, field, val) => {
    const key = `${day}|${period}`;
    setSlotMap(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: val },
    }));
  };

  const clearSlot = (day, period) => {
    const key = `${day}|${period}`;
    setSlotMap(prev => { const next = { ...prev }; delete next[key]; return next; });
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const slots = Object.entries(slotMap)
        .filter(([, v]) => v.subject && v.sectionId)
        .map(([key, v]) => {
          const separatorIdx = key.indexOf('|');
          const day    = key.slice(0, separatorIdx);
          const period = key.slice(separatorIdx + 1);
          return { day, period, subject: v.subject, sectionId: v.sectionId };
        });
      return registrationApi.saveTimetable(teacherId, { slots });
    },
    onSuccess: () => { toast.success('Timetable saved!'); qc.invalidateQueries(['timetable', teacherId]); },
    onError: e => toast.error(e.response?.data?.message || 'Failed to save.'),
  });

  const selectedTeacher = teachers.find(t => t._id === teacherId);

  return (
    <AppShell navItems={REGISTRAR_NAV}>
      <PageHeader title="Timetables" subtitle="Manage weekly schedules for each teacher" />

      {/* Teacher selector */}
      <div className="card mb-6 max-w-sm">
        <label className="label">Select teacher</label>
        <select className="input" value={teacherId} onChange={e => { setTeacherId(e.target.value); setSlotMap({}); }}>
          <option value="">Choose a teacher…</option>
          {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
        </select>
      </div>

      {!teacherId ? (
        <div className="card text-center py-16">
          <BookOpen className="w-10 h-10 text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400">Select a teacher to manage their timetable</p>
        </div>
      ) : ttLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Teacher name */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-stone-900">{selectedTeacher?.firstName} {selectedTeacher?.lastName}</p>
              <p className="text-xs text-stone-400">{selectedTeacher?.email}</p>
            </div>
            <button className="btn-primary flex items-center gap-2" onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save timetable</>}
            </button>
          </div>

          {/* Timetable grid */}
          <div className="card !p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="px-3 py-3 text-left font-semibold text-stone-500 w-24">Period</th>
                  {DAYS.map(d => (
                    <th key={d} className="px-2 py-3 text-center font-semibold text-stone-600 min-w-[140px]">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period, pi) => (
                  <tr key={period} className={clsx('border-b border-stone-50', pi % 2 === 0 ? 'bg-white' : 'bg-stone-50/40')}>
                    <td className="px-3 py-2 text-stone-500 font-medium">
                      <p>{period}</p>
                      <p className="text-stone-300 font-normal">{PERIOD_TIMES[period]}</p>
                    </td>
                    {DAYS.map(day => {
                      const key  = `${day}|${period}`;
                      const slot = slotMap[key] || {};
                      return (
                        <td key={day} className="px-2 py-2">
                          <div className={clsx(
                            'rounded-xl p-2 transition-colors',
                            slot.subject ? 'bg-amber-50 border border-amber-100' : 'bg-stone-50 border border-stone-100'
                          )}>
                            <select className="w-full bg-transparent text-xs text-stone-700 outline-none cursor-pointer mb-1 font-medium"
                              value={slot.subject || ''} onChange={e => setSlot(day, period, 'subject', e.target.value)}>
                              <option value="">— empty —</option>
                              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                            </select>
                            {slot.subject && (
                              <select className="w-full bg-transparent text-[10px] text-stone-500 outline-none cursor-pointer"
                                value={slot.sectionId || ''} onChange={e => setSlot(day, period, 'sectionId', e.target.value)}>
                                <option value="">Section…</option>
                                {sections.map(s => (
                                  <option key={s._id} value={s._id}>
                                    {s.gradeId?.name || 'Grade'} - {s.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Teacher program summary */}
          {existingSlots.length > 0 && (
            <div className="card mt-6">
              <p className="section-label mb-3">Program summary</p>
              <div className="space-y-1">
                {[...new Set(existingSlots.map(s => s.subject))].map(subject => {
                  const subjectSlots = existingSlots.filter(s => s.subject === subject);
                  const sections_str = subjectSlots.map(s =>
                    `${s.sectionId?.gradeId?.name || ''} Sec ${s.sectionId?.name || ''}`
                  ).join(', ');
                  return (
                    <div key={subject} className="flex items-center gap-3 text-sm">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 flex-shrink-0">{subject}</span>
                      <span className="text-stone-500 text-xs">{sections_str}</span>
                      <span className="ml-auto text-xs text-stone-300">{subjectSlots.length} period{subjectSlots.length !== 1 ? 's' : ''}/week</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AppShell>
  );
}
