import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Save, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/shared/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { TEACHER_NAV } from './nav';

const SUBJECTS = ['Math', 'English', 'Science', 'Social Studies', 'Amharic', 'Art', 'PE'];

export default function GradeEntryPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [scores, setScores] = useState({});
  const [maxScore, setMaxScore] = useState(100);
  const [saved, setSaved] = useState(false);

  // Fetch teacher's assigned sections
  const { data: assignments = [] } = useQuery({
    queryKey: ['teacher-assignments', user?._id],
    queryFn: () => api.get('/assignments/mine').then(r => r.data.data || []),
    enabled: !!user,
  });

  // Fetch students in selected section
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['section-students', selectedSection],
    queryFn: () => api.get(`/sections/${selectedSection}/students`).then(r => r.data.data?.students || r.data.data || []),
    enabled: !!selectedSection,
  });

  // Load existing scores when section+subject change
  useQuery({
    queryKey: ['marks-entry', selectedSection, selectedSubject],
    queryFn: () => api.get('/marks/entry', { params: { sectionId: selectedSection, subject: selectedSubject } })
      .then(r => {
        const scoreMap = r.data.data?.scoreMap || {};
        setScores(scoreMap);
        return scoreMap;
      }),
    enabled: !!(selectedSection && selectedSubject),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => api.post('/marks/entry', payload),
    onSuccess: () => {
      toast.success(t('grade_entry.saved'));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      qc.invalidateQueries({ queryKey: ['marks-entry'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || t('common.error')),
  });

  const handleSave = () => {
    const entries = Object.entries(scores)
      .filter(([, score]) => score !== '' && score !== undefined)
      .map(([studentId, score]) => ({
        studentId,
        score: Number(score),
        maxScore: Number(maxScore),
        subject: selectedSubject,
        term: 'Term 1',
      }));

    if (!entries.length) { toast.error('Enter at least one score'); return; }
    saveMutation.mutate({ sectionId: selectedSection, entries });
  };

  return (
    <AppShell navItems={TEACHER_NAV}>
      <PageHeader title={t('grade_entry.title')} subtitle="Enter student marks by section and subject" />

      {/* Controls */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">{t('grade_entry.select_section')}</label>
            <select className="input" value={selectedSection} onChange={e => { setSelectedSection(e.target.value); setScores({}); }}>
              <option value="">-- Select --</option>
              {assignments.map(a => (
                <option key={a.sectionId?._id || a.sectionId} value={a.sectionId?._id || a.sectionId}>
                  {a.sectionId?.gradeId?.name || 'Grade'} — Section {a.sectionId?.name || a.sectionId}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('grade_entry.select_subject')}</label>
            <select className="input" value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setScores({}); }}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('grade_entry.max_score')}</label>
            <input type="number" min={1} max={1000} value={maxScore} onChange={e => setMaxScore(e.target.value)} className="input" />
          </div>
        </div>
      </div>

      {/* Students table */}
      {selectedSection && (
        <div className="card !p-0 overflow-hidden">
          {loadingStudents ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-center text-stone-400 py-12">{t('grade_entry.no_students')}</p>
          ) : (
            <>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="text-left py-3 px-5 section-label">{t('grade_entry.student_name')}</th>
                      <th className="text-left py-3 px-5 section-label w-40">
                        {t('grade_entry.score')} <span className="text-stone-300 font-normal">/ {maxScore}</span>
                      </th>
                      <th className="text-left py-3 px-5 section-label">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const score = scores[student._id] ?? '';
                      const pct = score !== '' ? Math.round((Number(score) / Number(maxScore)) * 100) : null;
                      const color = pct === null ? '' : pct >= 75 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500';
                      return (
                        <tr key={student._id} className="table-row">
                          <td className="py-3 px-5 font-medium text-stone-800">
                            {student.firstName} {student.lastName}
                            <span className="ml-2 text-xs text-stone-400">{student.studentCode}</span>
                          </td>
                          <td className="py-2 px-5">
                            <input
                              type="number" min={0} max={maxScore}
                              value={score}
                              onChange={e => setScores(s => ({ ...s, [student._id]: e.target.value }))}
                              className="input w-28 text-center"
                              placeholder="—"
                            />
                          </td>
                          <td className={`py-3 px-5 font-semibold ${color}`}>
                            {pct !== null ? `${pct}%` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end px-5 py-4 border-t border-stone-100">
                <button
                  onClick={handleSave}
                  disabled={saveMutation.isPending || saved}
                  className="btn-primary flex items-center gap-2 px-6"
                >
                  {saved ? (
                    <><CheckCircle className="w-4 h-4" /> {t('grade_entry.saved')}</>
                  ) : saveMutation.isPending ? (
                    t('grade_entry.saving')
                  ) : (
                    <><Save className="w-4 h-4" /> {t('grade_entry.save')}</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </AppShell>
  );
}
