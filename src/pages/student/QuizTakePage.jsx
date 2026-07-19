import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Clock, ChevronLeft, ChevronRight, Check, X, Loader2, Trophy } from 'lucide-react';
import AppShell from '@/components/shared/AppShell.jsx';
import PageHeader from '@/components/ui/PageHeader.jsx';
import { useQuiz, useMyQuizAttempts, useSubmitQuiz } from '@/hooks/useQuizzes.js';
import { STUDENT_NAV } from './nav.js';
import clsx from 'clsx';

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// ─── Intro screen ────────────────────────────────────────────────────
const IntroScreen = ({ quiz, attempts, onStart }) => {
  const best = attempts.length ? Math.max(...attempts.map(a => a.percentage)) : null;
  return (
    <div className="card max-w-lg mx-auto text-center py-10">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
        <ClipboardCheck className="w-7 h-7 text-amber-700" />
      </div>
      <span className="badge bg-amber-100 text-amber-800 font-semibold">{quiz.subject}</span>
      <h2 className="font-display text-xl font-bold text-stone-900 mt-3">{quiz.title}</h2>
      {quiz.description && <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto">{quiz.description}</p>}

      <div className="flex items-center justify-center gap-6 mt-5 text-sm text-stone-500">
        <span>{quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}</span>
        {quiz.timeLimitMinutes && (
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {quiz.timeLimitMinutes} min limit</span>
        )}
      </div>

      {best !== null && (
        <p className="text-sm text-stone-400 mt-3">
          Your best score so far: <span className="font-semibold text-emerald-600">{best}%</span> ({attempts.length} attempt{attempts.length !== 1 ? 's' : ''})
        </p>
      )}

      <button onClick={onStart} className="btn-primary mt-6 px-8">
        {attempts.length > 0 ? 'Try again' : 'Start quiz'}
      </button>
    </div>
  );
};

// ─── Taking screen ───────────────────────────────────────────────────
const TakingScreen = ({ quiz, onSubmit, submitting }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(() => new Array(quiz.questions.length).fill(-1));
  const [secondsLeft, setSecondsLeft] = useState(quiz.timeLimitMinutes ? quiz.timeLimitMinutes * 60 : null);
  const startRef = useRef(Date.now());
  const submittedRef = useRef(false);

  const doSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const timeSpentSeconds = Math.round((Date.now() - startRef.current) / 1000);
    onSubmit({ answers, timeSpentSeconds });
  };

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) { doSubmit(); return; }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const q = quiz.questions[current];
  const answeredCount = answers.filter(a => a !== -1).length;
  const isLast = current === quiz.questions.length - 1;

  const selectAnswer = (i) => setAnswers(a => a.map((v, idx) => idx === current ? i : v));

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-stone-500">Question {current + 1} of {quiz.questions.length}</span>
        {secondsLeft !== null && (
          <span className={clsx('flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full',
            secondsLeft <= 30 ? 'bg-red-50 text-red-600' : 'bg-stone-100 text-stone-600')}>
            <Clock className="w-3.5 h-3.5" /> {fmtTime(secondsLeft)}
          </span>
        )}
      </div>

      <div className="w-full h-1.5 bg-stone-100 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${((current + 1) / quiz.questions.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="card">
          <p className="font-semibold text-stone-800 text-lg mb-5">{q.questionText}</p>
          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => selectAnswer(i)}
                className={clsx('w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
                  answers[current] === i ? 'border-amber-400 bg-amber-50' : 'border-stone-200 hover:border-stone-300')}>
                <span className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  answers[current] === i ? 'bg-amber-500 border-amber-500' : 'border-stone-300')}>
                  {answers[current] === i && <Check className="w-3 h-3 text-white" />}
                </span>
                <span className="text-sm text-stone-700">{opt}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-5">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          className="btn-secondary flex items-center gap-1.5 disabled:opacity-40">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-xs text-stone-400">{answeredCount}/{quiz.questions.length} answered</span>
        {isLast ? (
          <button onClick={doSubmit} disabled={submitting} className="btn-primary flex items-center gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Submit quiz'}
          </button>
        ) : (
          <button onClick={() => setCurrent(c => Math.min(quiz.questions.length - 1, c + 1))} className="btn-secondary flex items-center gap-1.5">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Results screen ───────────────────────────────────────────────────
const ResultsScreen = ({ result, onRetry, onBack }) => {
  const { attempt, review } = result;
  const good = attempt.percentage >= 70;
  return (
    <div className="max-w-xl mx-auto">
      <div className="card text-center py-8 mb-6">
        <div className={clsx('w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4', good ? 'bg-emerald-100' : 'bg-amber-100')}>
          <Trophy className={clsx('w-8 h-8', good ? 'text-emerald-600' : 'text-amber-600')} />
        </div>
        <p className="text-3xl font-bold font-display text-stone-900">{attempt.score}/{attempt.totalPoints}</p>
        <p className={clsx('text-lg font-semibold mt-1', good ? 'text-emerald-600' : 'text-amber-600')}>{attempt.percentage}%</p>
        <div className="flex items-center justify-center gap-3 mt-5">
          <button onClick={onBack} className="btn-secondary">Back to quizzes</button>
          <button onClick={onRetry} className="btn-primary">Try again</button>
        </div>
      </div>

      <div className="space-y-3">
        {review.map((r, i) => (
          <div key={i} className="card">
            <div className="flex items-start gap-2">
              <span className={clsx('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                r.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500')}>
                {r.isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800">{r.questionText}</p>
                <div className="mt-2 space-y-1">
                  {r.options.map((opt, oi) => (
                    <p key={oi} className={clsx('text-xs px-2.5 py-1.5 rounded-lg',
                      oi === r.correctIndex ? 'bg-emerald-50 text-emerald-700 font-medium' :
                      oi === r.selectedIndex ? 'bg-red-50 text-red-600' : 'text-stone-400')}>
                      {opt} {oi === r.correctIndex && '✓'} {oi === r.selectedIndex && oi !== r.correctIndex && '(your answer)'}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Page ────────────────────────────────────────────────────────────
export default function QuizTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: quiz, isLoading } = useQuiz(id);
  const { data: attempts = [] } = useMyQuizAttempts(id);
  const submit = useSubmitQuiz(id);

  const [phase, setPhase] = useState('intro'); // 'intro' | 'taking' | 'result'
  const [result, setResult] = useState(null);

  const handleSubmit = (payload) => {
    submit.mutate(payload, {
      onSuccess: (res) => { setResult(res.data.data); setPhase('result'); },
    });
  };

  return (
    <AppShell navItems={STUDENT_NAV}>
      <PageHeader title={quiz?.title || 'Quiz'} subtitle={phase === 'taking' ? 'Stay focused — good luck!' : 'Practice quiz'} />

      {isLoading || !quiz ? (
        <div className="max-w-xl mx-auto h-64 bg-stone-100 rounded-2xl animate-pulse" />
      ) : phase === 'intro' ? (
        <IntroScreen quiz={quiz} attempts={attempts} onStart={() => setPhase('taking')} />
      ) : phase === 'taking' ? (
        <TakingScreen quiz={quiz} onSubmit={handleSubmit} submitting={submit.isPending} />
      ) : (
        <ResultsScreen result={result} onRetry={() => setPhase('taking')} onBack={() => navigate('/student/quizzes')} />
      )}
    </AppShell>
  );
}
