import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/client';
import { useSchoolInfo } from '@/hooks/useSchool';
import PrintExportButton from '@/components/shared/PrintExportButton';
import ReportCardDocument from '@/components/shared/ReportCardDocument';

const getGrade = (score, max) => {
  const pct = (score / max) * 100;
  if (pct >= 90) return { letter:'A+', color:'text-green-600 bg-green-50' };
  if (pct >= 80) return { letter:'A',  color:'text-green-600 bg-green-50' };
  if (pct >= 70) return { letter:'B',  color:'text-blue-600 bg-blue-50' };
  if (pct >= 60) return { letter:'C',  color:'text-amber-600 bg-amber-50' };
  if (pct >= 50) return { letter:'D',  color:'text-orange-600 bg-orange-50' };
  return { letter:'F', color:'text-red-600 bg-red-50' };
};

export default function MarksPage() {
  const { t }    = useTranslation();
  const { user } = useAuth();
  const printRef = useRef(null);

  const { data: marks = [], isLoading } = useQuery({
    queryKey: ['student-marks', user?._id],
    queryFn:  () => api.get(`/marks/student/${user._id}`).then(r => r.data.data?.marks || []),
    enabled:  !!user,
  });

  const { data: schoolInfo } = useSchoolInfo();

  const avg = marks.length
    ? Math.round(marks.reduce((s, m) => s + (m.score / m.maxScore) * 100, 0) / marks.length)
    : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Marks</h1>
          <p className="page-subtitle">Your academic results by subject</p>
        </div>
        {marks.length > 0 && (
          <PrintExportButton
            printRef={printRef}
            filename={`report-card-${user?.firstName}-${user?.lastName}`}
            label="Export Report Card"
          />
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : marks.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-stone-400">No marks recorded yet</p>
        </div>
      ) : (
        <>
          {/* Average card */}
          {avg !== null && (
            <div className="card mb-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-amber-700">{avg}%</span>
              </div>
              <div>
                <p className="font-semibold text-stone-800">Overall Average</p>
                <p className="text-sm text-stone-500">{marks.length} subject{marks.length !== 1 ? 's':''} recorded</p>
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
                    const pct   = Math.round((m.score / m.maxScore) * 100);
                    const grade = getGrade(m.score, m.maxScore);
                    return (
                      <tr key={m._id} className="table-row">
                        <td className="py-3 px-4 font-medium text-stone-800">{m.subject}</td>
                        <td className="py-3 px-4 text-stone-600">{m.score} / {m.maxScore}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-stone-100 rounded-full h-1.5 w-20">
                              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width:`${pct}%` }}/>
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

      {/* Hidden printable document */}
      <div style={{ position:'absolute', left:'-9999px', top:0, pointerEvents:'none' }}>
        <ReportCardDocument
          ref={printRef}
          student={user}
          marks={marks}
          schoolInfo={schoolInfo}
        />
      </div>
    </div>
  );
}
