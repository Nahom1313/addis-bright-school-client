import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react';
import api from '@/api/client.js';
import clsx from 'clsx';

// ─── Colours per subject index ────────────────────────────────────
const COLORS = [
  '#d97706', '#0ea5e9', '#10b981', '#8b5cf6',
  '#f43f5e', '#f59e0b', '#06b6d4', '#84cc16',
];

// ─── Grade helper ─────────────────────────────────────────────────
const gradeColor = (pct) => {
  if (pct >= 80) return 'text-green-600';
  if (pct >= 60) return 'text-amber-600';
  if (pct >= 50) return 'text-orange-500';
  return 'text-red-500';
};

// ─── Trend icon ───────────────────────────────────────────────────
const TrendIcon = ({ trend }) => {
  if (trend > 0)  return <TrendingUp  className="w-3.5 h-3.5 text-green-500" />;
  if (trend < 0)  return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-stone-300" />;
};

// ─── Custom tooltip ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-100 rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="font-semibold text-stone-600 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────
/**
 * @param {string}  studentId   - required
 * @param {string}  [name]      - display name, e.g. "Nahom" (optional)
 * @param {boolean} [compact]   - smaller version for dashboards
 */
export default function ProgressChart({ studentId, name, compact = false }) {
  const [activeSubjects, setActiveSubjects] = useState(null); // null = all

  const { data, isLoading, isError } = useQuery({
    queryKey: ['marks-progress', studentId],
    queryFn:  () => api.get(`/marks/student/${studentId}/progress`).then(r => r.data.data),
    enabled:  !!studentId,
    staleTime: 60_000,
  });

  if (isLoading) return (
    <div className="card animate-pulse space-y-3">
      <div className="h-4 bg-stone-100 rounded w-1/3" />
      <div className="h-48 bg-stone-100 rounded-xl" />
    </div>
  );

  if (isError || !data) return null;

  const { subjects = [] } = data;
  if (!subjects.length) return (
    <div className="card text-center py-10">
      <BarChart2 className="w-8 h-8 text-stone-200 mx-auto mb-2" />
      <p className="text-sm text-stone-400">No marks recorded yet</p>
    </div>
  );

  // Build chart data: x-axis = term labels, y-axis = % per subject
  const terms = [...new Set(subjects.flatMap(s => s.entries.map(e => e.term)))];
  const chartData = terms.map(term => {
    const point = { term };
    subjects.forEach(s => {
      const entry = s.entries.find(e => e.term === term);
      if (entry) point[s.subject] = entry.pct;
    });
    return point;
  });

  const visibleSubjects = activeSubjects
    ? subjects.filter(s => activeSubjects.includes(s.subject))
    : subjects;

  return (
    <div className={clsx('card', compact && 'p-4')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold text-stone-800">
            {name ? `${name}'s Progress` : 'Academic Progress'}
          </p>
          <p className="text-xs text-stone-400">{subjects.length} subject{subjects.length !== 1 ? 's' : ''} · {terms.length} term{terms.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Subject summary cards */}
      <div className={clsx('grid gap-2 mb-4', compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4')}>
        {subjects.map((s, i) => {
          const active = !activeSubjects || activeSubjects.includes(s.subject);
          return (
            <button
              key={s.subject}
              onClick={() => {
                if (!activeSubjects) {
                  setActiveSubjects([s.subject]);
                } else if (activeSubjects.includes(s.subject)) {
                  const next = activeSubjects.filter(x => x !== s.subject);
                  setActiveSubjects(next.length ? next : null);
                } else {
                  setActiveSubjects([...activeSubjects, s.subject]);
                }
              }}
              className={clsx(
                'rounded-xl p-2.5 text-left border transition-all',
                active
                  ? 'border-stone-200 bg-white shadow-sm'
                  : 'border-stone-100 bg-stone-50 opacity-40'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wide text-stone-400 truncate">{s.subject}</span>
                <TrendIcon trend={s.trend} />
              </div>
              <p className={clsx('text-xl font-bold leading-none', gradeColor(s.avg))}>{s.avg}%</p>
              <div className="flex gap-1.5 mt-1 text-[10px] text-stone-400">
                <span>↑{s.highest}%</span>
                <span>↓{s.lowest}%</span>
              </div>
              {/* Colour indicator */}
              <div className="h-0.5 rounded-full mt-2" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            </button>
          );
        })}
      </div>

      {/* Line chart */}
      {terms.length > 1 ? (
        <ResponsiveContainer width="100%" height={compact ? 160 : 220}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
            <XAxis dataKey="term" tick={{ fontSize: 11, fill: '#a8a29e' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#a8a29e' }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={50} stroke="#fca5a5" strokeDasharray="4 4" strokeWidth={1} />
            {visibleSubjects.map((s, i) => (
              <Line
                key={s.subject}
                type="monotone"
                dataKey={s.subject}
                name={s.subject}
                stroke={COLORS[subjects.indexOf(s) % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        // Only one term — show bar-style single point view
        <div className="space-y-2 mt-2">
          {subjects.map((s, i) => (
            <div key={s.subject} className="flex items-center gap-3">
              <span className="text-xs text-stone-500 w-24 truncate">{s.subject}</span>
              <div className="flex-1 bg-stone-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${s.avg}%`, backgroundColor: COLORS[i % COLORS.length] }}
                />
              </div>
              <span className={clsx('text-xs font-semibold w-8 text-right', gradeColor(s.avg))}>{s.avg}%</span>
            </div>
          ))}
          <p className="text-xs text-stone-300 text-center pt-1">Chart shows trends across multiple terms</p>
        </div>
      )}
    </div>
  );
}
