import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/client';
import ProgressChart from '@/components/shared/ProgressChart';
import clsx from 'clsx';

const getGrade = (score, max) => {
  const pct = (score / max) * 100;
  if (pct >= 90) return { letter: 'A+', color: 'text-green-600 bg-green-50' };
  if (pct >= 80) return { letter: 'A',  color: 'text-green-600 bg-green-50' };
  if (pct >= 70) return { letter: 'B',  color: 'text-blue-600 bg-blue-50' };
  if (pct >= 60) return { letter: 'C',  color: 'text-amber-600 bg-amber-50' };
  if (pct >= 50) return { letter: 'D',  color: 'text-orange-600 bg-orange-50' };
  return { letter: 'F', color: 'text-red-600 bg-red-50' };
};

export default function MarksPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState('marks');

  const { data: marks = [], isLoading } = useQuery({
    queryKey: ['student-marks', user?._id],
    queryFn: () => api.get(`/marks/student/${user._id}`).then(r => r.data.data?.marks || []),
    enabled: !!user,
  });

  const avg = marks.length
    ? Math.round(marks.reduce((s, m) => s + (m.score / m.maxScore) * 100, 0) / marks.length)
    : null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Marks</h1>
        <p className="page-subtitle">Your academic results by subject</p>
      </div>

      {/* Tab toggle */}
      <div className="flex rounded-xl border border-stone-200 overflow-hidden text-sm w-fit mb-5">
        {[['marks', 'Marks'], ['progress', 'Progress']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={clsx('px-4 py-2 transition-colors',
              tab === key ? 'bg-amber-600 text-white font-medium' : 'bg-white text-stone-500 hover:bg-stone-50'
            )}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'progress' ? (
        <ProgressChart studentId={user?._id} />
      ) : (
        <>
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : marks.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-stone-400">No marks recorded yet</p>
            </div>
          ) : (
            <>
              {avg !== null && (
                <div className="card mb-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-amber-700">{avg}%</span>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">Overall Average</p>
                    <p className="text-sm text-stone-500">{marks.length} subject{marks.length !== 1 ? 's' : ''} recorded</p>
                  </div>
                </div>
              )}
              <div className="card">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="text-left py-3 px-4 text-stone-500 font-medium">Subject</th>
                        <th className="text-left py-3 px-4 text-stone-500 font-medium">Score</th>
                        <th className="text-left py-3 px-4 text-stone-500 font-medium">%</th>
                        <th className="text-left py-3 px-4 text-stone-500 font-medium">Grade</th>
                        <th className="text-left py-3 px-4 text-stone-500 font-medium">Term</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marks.map(m => {
                        const pct = Math.round((m.score / m.maxScore) * 100);
                        const grade = getGrade(m.score, m.maxScore);
                        return (
                          <tr key={m._id} className="table-row">
                            <td className="py-3 px-4 font-medium text-stone-800">{m.subject}</td>
                            <td className="py-3 px-4 text-stone-600">{m.score} / {m.maxScore}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-stone-100 rounded-full h-1.5 w-20">
                                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-stone-600 text-xs">{pct}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`badge font-bold ${grade.color}`}>{grade.letter}</span>
                            </td>
                            <td className="py-3 px-4 text-stone-400">{m.term}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
