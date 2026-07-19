import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardCheck, Clock, Search, ChevronRight } from 'lucide-react';
import AppShell from '@/components/shared/AppShell.jsx';
import PageHeader from '@/components/ui/PageHeader.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useQuizzes, useQuizSubjects } from '@/hooks/useQuizzes.js';
import { STUDENT_NAV } from './nav.js';
import clsx from 'clsx';

const QuizCard = ({ quiz, onClick }) => (
  <motion.button
    onClick={onClick}
    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
    className="card card-hover flex items-center gap-3 text-left w-full"
  >
    <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
      <ClipboardCheck className="w-5 h-5 text-amber-700" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center flex-wrap gap-2 mb-1">
        <span className="badge bg-amber-100 text-amber-800 font-semibold">{quiz.subject}</span>
        <span className="text-xs text-stone-400">{quiz.questionCount} question{quiz.questionCount !== 1 ? 's' : ''}</span>
        {quiz.timeLimitMinutes && (
          <span className="text-xs text-stone-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {quiz.timeLimitMinutes} min</span>
        )}
      </div>
      <p className="font-semibold text-stone-800 truncate">{quiz.title}</p>
      {quiz.description && <p className="text-sm text-stone-500 mt-1 line-clamp-2">{quiz.description}</p>}
      <p className="text-xs text-stone-400 mt-1.5">By {quiz.teacherId?.firstName} {quiz.teacherId?.lastName}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-stone-300 flex-shrink-0" />
  </motion.button>
);

export default function QuizzesPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('All subjects');
  const [search, setSearch]   = useState('');

  const { data: subjectsRaw = [] } = useQuizSubjects();
  const { data: quizzes = [], isLoading } = useQuizzes({
    subject: subject === 'All subjects' ? undefined : subject,
    q: search.trim() || undefined,
  });

  const subjects = ['All subjects', ...subjectsRaw];

  return (
    <AppShell navItems={STUDENT_NAV}>
      <PageHeader title="Practice Quizzes" subtitle="Test yourself on what you've learned" />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input className="input pl-9" placeholder="Search quizzes…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-56" value={subject} onChange={e => setSubject(e.target.value)}>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No quizzes yet"
          body="Your teachers haven't added any practice quizzes for this subject yet." />
      ) : (
        <div className="space-y-3">
          {quizzes.map(quiz => (
            <QuizCard key={quiz._id} quiz={quiz} onClick={() => navigate(`/student/quizzes/${quiz._id}`)} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
