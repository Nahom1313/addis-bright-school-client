import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Plus, Trash2, Pencil, Clock, BarChart3, X, Check } from 'lucide-react';
import AppShell from '@/components/shared/AppShell.jsx';
import PageHeader from '@/components/ui/PageHeader.jsx';
import Modal from '@/components/ui/Modal.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useTeacherAssignments } from '@/hooks/useSchool.js';
import { useMyQuizzes, useCreateQuiz, useUpdateQuiz, useDeleteQuiz, useQuizResults } from '@/hooks/useQuizzes.js';
import { TEACHER_NAV } from './nav.js';
import clsx from 'clsx';

const emptyQuestion = () => ({ questionText: '', options: ['', ''], correctIndex: 0, points: 1 });

// ─── Quiz card ────────────────────────────────────────────────────
const QuizCard = ({ quiz, onEdit, onDelete, onViewResults }) => (
  <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="card group">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2 mb-1">
          <span className="badge bg-amber-100 text-amber-800 font-semibold">{quiz.subject}</span>
          <span className="text-xs text-stone-400">{quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}</span>
          {quiz.timeLimitMinutes && (
            <span className="text-xs text-stone-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {quiz.timeLimitMinutes} min</span>
          )}
        </div>
        <p className="font-semibold text-stone-800 truncate">{quiz.title}</p>
        {quiz.description && <p className="text-sm text-stone-500 mt-1 line-clamp-2">{quiz.description}</p>}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onViewResults(quiz)} className="btn-icon text-stone-400 hover:text-sky-600 hover:bg-sky-50" title="View results">
          <BarChart3 className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onEdit(quiz)} className="btn-icon text-stone-400 hover:text-amber-600 hover:bg-amber-50" title="Edit">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(quiz._id)} className="btn-icon text-stone-400 hover:text-red-500 hover:bg-red-50" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </motion.div>
);

// ─── Question builder row ───────────────────────────────────────────
const QuestionEditor = ({ q, index, onChange, onRemove, removable }) => {
  const set = (patch) => onChange(index, { ...q, ...patch });
  const setOption = (i, val) => {
    const options = [...q.options]; options[i] = val;
    set({ options });
  };
  const addOption = () => q.options.length < 6 && set({ options: [...q.options, ''] });
  const removeOption = (i) => {
    if (q.options.length <= 2) return;
    const options = q.options.filter((_, oi) => oi !== i);
    set({ options, correctIndex: q.correctIndex >= options.length ? 0 : q.correctIndex });
  };

  return (
    <div className="card-sm !bg-stone-50 space-y-3">
      <div className="flex items-start gap-2">
        <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{index + 1}</span>
        <input className="input flex-1" placeholder="Question text…"
          value={q.questionText} onChange={e => set({ questionText: e.target.value })} maxLength={500} required />
        {removable && (
          <button type="button" onClick={() => onRemove(index)} className="btn-icon text-stone-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="pl-8 space-y-2">
        {q.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button type="button" onClick={() => set({ correctIndex: i })}
              className={clsx('w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                q.correctIndex === i ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 hover:border-emerald-400')}
              title="Mark as correct answer">
              {q.correctIndex === i && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
            <input className="input flex-1 !py-1.5 text-sm" placeholder={`Option ${i + 1}`}
              value={opt} onChange={e => setOption(i, e.target.value)} maxLength={200} required />
            {q.options.length > 2 && (
              <button type="button" onClick={() => removeOption(i)} className="text-stone-300 hover:text-red-500 flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {q.options.length < 6 && (
          <button type="button" onClick={addOption} className="text-xs text-amber-600 hover:underline pl-8">+ Add option</button>
        )}
      </div>

      <div className="pl-8 flex items-center gap-2">
        <label className="text-xs text-stone-400">Points</label>
        <input type="number" min={1} max={100} className="input !py-1 !w-20 text-sm"
          value={q.points} onChange={e => set({ points: Number(e.target.value) || 1 })} />
      </div>
    </div>
  );
};

// ─── Create / edit modal ────────────────────────────────────────────
const QuizModal = ({ open, onClose, subjects, editTarget }) => {
  const isEdit = !!editTarget;
  const create = useCreateQuiz();
  const update = useUpdateQuiz();

  const [form, setForm] = useState(() => ({
    subject:          editTarget?.subject || subjects[0] || '',
    title:            editTarget?.title || '',
    description:      editTarget?.description || '',
    timeLimitMinutes: editTarget?.timeLimitMinutes || '',
    questions:        editTarget?.questions?.length ? editTarget.questions.map(q => ({ ...q })) : [emptyQuestion()],
  }));

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setQuestion = (i, q) => setForm(f => ({ ...f, questions: f.questions.map((old, oi) => oi === i ? q : old) }));
  const addQuestion = () => setForm(f => ({ ...f, questions: [...f.questions, emptyQuestion()] }));
  const removeQuestion = (i) => setForm(f => ({ ...f, questions: f.questions.filter((_, oi) => oi !== i) }));

  const pending = create.isPending || update.isPending;

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      subject: form.subject,
      title: form.title.trim(),
      description: form.description.trim() || null,
      timeLimitMinutes: form.timeLimitMinutes ? Number(form.timeLimitMinutes) : null,
      questions: form.questions.map(q => ({
        questionText: q.questionText.trim(),
        options: q.options.map(o => o.trim()),
        correctIndex: q.correctIndex,
        points: q.points || 1,
      })),
    };
    if (isEdit) {
      update.mutate({ id: editTarget._id, data: payload }, { onSuccess: onClose });
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Quiz' : 'Create Quiz'} size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Subject</label>
            {subjects.length > 0 ? (
              <select className="input" value={form.subject} onChange={e => set('subject', e.target.value)} required>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input className="input" placeholder="e.g. Mathematics" value={form.subject} onChange={e => set('subject', e.target.value)} required />
            )}
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time limit (minutes) <span className="text-stone-400 font-normal">optional</span></label>
            <input type="number" min={1} max={180} className="input" placeholder="No limit"
              value={form.timeLimitMinutes} onChange={e => set('timeLimitMinutes', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="e.g. Chapter 5 practice test"
            value={form.title} onChange={e => set('title', e.target.value)} maxLength={150} required />
        </div>

        <div>
          <label className="label">Description <span className="text-stone-400 font-normal">(optional)</span></label>
          <textarea className="input resize-none" rows={2}
            value={form.description} onChange={e => set('description', e.target.value)} maxLength={1000} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label !mb-0">Questions</label>
            <span className="text-xs text-stone-400">Click the circle to mark the correct answer</span>
          </div>
          <div className="space-y-3">
            {form.questions.map((q, i) => (
              <QuestionEditor key={i} q={q} index={i} onChange={setQuestion} onRemove={removeQuestion} removable={form.questions.length > 1} />
            ))}
          </div>
          <button type="button" onClick={addQuestion} className="btn-secondary text-sm mt-3 flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" /> Add question
          </button>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={pending}>
            {pending
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              : <><ClipboardCheck className="w-3.5 h-3.5" /> {isEdit ? 'Save changes' : 'Create quiz'}</>
            }
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Results modal ───────────────────────────────────────────────────
const ResultsModal = ({ quiz, onClose }) => {
  const { data: results = [], isLoading } = useQuizResults(quiz?._id);
  return (
    <Modal open={!!quiz} onClose={onClose} title={`Results — ${quiz?.title || ''}`} size="md">
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />)}</div>
      ) : results.length === 0 ? (
        <EmptyState icon={BarChart3} title="No attempts yet" body="Results will show up here once students take this quiz." />
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-stone-50">
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">{r.student?.firstName} {r.student?.lastName}</p>
                <p className="text-xs text-stone-400">{r.attemptCount} attempt{r.attemptCount !== 1 ? 's' : ''}</p>
              </div>
              <span className={clsx('text-sm font-bold flex-shrink-0', r.percentage >= 70 ? 'text-emerald-600' : r.percentage >= 40 ? 'text-amber-600' : 'text-red-500')}>
                {r.score}/{r.totalPoints} ({r.percentage}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

// ─── Page ────────────────────────────────────────────────────────────
export default function QuizzesPage() {
  const { user } = useAuth();
  const { data: assignments = [] } = useTeacherAssignments(user?._id);
  const { data: quizzes = [], isLoading } = useMyQuizzes();
  const deleteQuiz = useDeleteQuiz();

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [resultsFor, setResultsFor] = useState(null);

  const subjects = [...new Set(assignments.map(a => a.subject).filter(Boolean))].sort();

  return (
    <AppShell navItems={TEACHER_NAV}>
      <PageHeader
        title="Practice Quizzes"
        subtitle="Build self-graded practice tests for your students"
        action={
          <button className="btn-primary flex items-center gap-2" onClick={() => { setEditing(null); setModal(true); }}>
            <Plus className="w-4 h-4" /> Create quiz
          </button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No quizzes yet" body="Create a practice quiz so students can test themselves on what you've taught." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {quizzes.map(quiz => (
              <QuizCard key={quiz._id} quiz={quiz}
                onEdit={(q) => { setEditing(q); setModal(true); }}
                onDelete={(id) => deleteQuiz.mutate(id)}
                onViewResults={setResultsFor}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {modal && <QuizModal open={modal} onClose={() => { setModal(false); setEditing(null); }} subjects={subjects} editTarget={editing} />}
      {resultsFor && <ResultsModal quiz={resultsFor} onClose={() => setResultsFor(null)} />}
    </AppShell>
  );
}
