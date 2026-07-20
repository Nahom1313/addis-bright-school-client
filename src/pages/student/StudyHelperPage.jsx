import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, BookOpen, GraduationCap } from 'lucide-react';
import AppShell from '@/components/shared/AppShell.jsx';
import PageHeader from '@/components/ui/PageHeader.jsx';
import { useStudyHelperSubjects, useStudyHelperChat } from '@/hooks/useStudyHelper.js';
import { STUDENT_NAV } from './nav.js';
import clsx from 'clsx';

const Bubble = ({ role, content }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className={clsx('flex', role === 'user' ? 'justify-end' : 'justify-start')}>
    <div className={clsx(
      'max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
      role === 'user' ? 'bg-amber-600 text-white rounded-br-md' : 'bg-stone-100 text-stone-800 rounded-bl-md'
    )}>
      {content}
    </div>
  </motion.div>
);

export default function StudyHelperPage() {
  const { data: subjects = [] } = useStudyHelperSubjects();
  const chat = useStudyHelperChat();

  const [subject, setSubject] = useState(null);
  const [messages, setMessages] = useState([]); // [{role, content}]
  const [input, setInput] = useState('');
  const [grounded, setGrounded] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, chat.isPending]);

  const send = () => {
    const text = input.trim();
    if (!text || !subject || chat.isPending) return;

    const history = messages.slice(-10);
    setMessages(m => [...m, { role: 'user', content: text }]);
    setInput('');

    chat.mutate({ subject, message: text, history }, {
      onSuccess: (res) => {
        setMessages(m => [...m, { role: 'assistant', content: res.data.data.reply }]);
        setGrounded(res.data.data.groundedInMaterials);
      },
      onError: () => {
        setMessages(m => m.slice(0, -1)); // roll back the user message so they can retry
        setInput(text);
      },
    });
  };

  return (
    <AppShell navItems={STUDENT_NAV}>
      <PageHeader title="AI Study Helper" subtitle="Ask questions about what you're learning" />

      {!subject ? (
        <div className="max-w-lg mx-auto text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-amber-700" />
          </div>
          <h2 className="font-display text-xl font-bold text-stone-900">What subject do you need help with?</h2>
          <p className="text-sm text-stone-500 mt-2">Pick a subject to start chatting. If your teacher's uploaded notes for it, I'll use those too.</p>

          {subjects.length === 0 ? (
            <p className="text-sm text-stone-400 mt-6">No subjects available yet — check back once your teachers have added study materials.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6">
              {subjects.map(s => (
                <button key={s} onClick={() => setSubject(s)}
                  className="px-3 py-3 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50 text-sm font-medium text-stone-700 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: 400 }}>
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="badge bg-amber-100 text-amber-800 font-semibold">{subject}</span>
              {grounded !== null && (
                <span className={clsx('text-xs flex items-center gap-1', grounded ? 'text-emerald-600' : 'text-stone-400')}>
                  {grounded ? <><BookOpen className="w-3 h-3" /> Using your class notes</> : <><GraduationCap className="w-3 h-3" /> General knowledge</>}
                </span>
              )}
            </div>
            <button onClick={() => { setSubject(null); setMessages([]); setGrounded(null); }} className="text-xs text-stone-400 hover:text-stone-600">
              Change subject
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 px-1">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-stone-400">Ask me anything about {subject} — I'm here to help you understand it, not just give you answers.</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((m, i) => <Bubble key={i} role={m.role} content={m.content} />)}
            </AnimatePresence>
            {chat.isPending && (
              <div className="flex justify-start">
                <div className="bg-stone-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-400" />
                  <span className="text-xs text-stone-400">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 mt-4 flex-shrink-0">
            <input className="input flex-1" placeholder={`Ask about ${subject}…`}
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              maxLength={1000} disabled={chat.isPending} />
            <button onClick={send} disabled={!input.trim() || chat.isPending}
              className="btn-primary !px-3.5 flex-shrink-0 disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
