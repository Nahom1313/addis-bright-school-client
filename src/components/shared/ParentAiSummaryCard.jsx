import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { useGenerateParentSummary } from '@/hooks/useParentSummary.js';
import clsx from 'clsx';

const ParentAiSummaryCard = ({ studentId, name }) => {
  const [lang, setLang] = useState('en');
  const [summary, setSummary] = useState(null);
  const generate = useGenerateParentSummary();

  const run = () => {
    generate.mutate({ studentId, lang }, {
      onSuccess: (res) => setSummary(res.data.data.summary),
    });
  };

  return (
    <div className="card !bg-gradient-to-br !from-amber-50 !to-white !border-amber-100">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <p className="font-semibold text-stone-800 text-sm">How is {name} doing?</p>
            <p className="text-xs text-stone-400">AI summary from recent grades, attendance & notes</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white rounded-lg border border-stone-200 p-0.5 flex-shrink-0">
          <button onClick={() => setLang('en')}
            className={clsx('text-xs px-2 py-1 rounded-md font-medium transition-colors', lang === 'en' ? 'bg-amber-100 text-amber-800' : 'text-stone-400')}>EN</button>
          <button onClick={() => setLang('am')}
            className={clsx('text-xs px-2 py-1 rounded-md font-medium transition-colors', lang === 'am' ? 'bg-amber-100 text-amber-800' : 'text-stone-400')}>አማ</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {summary ? (
          <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
            <p className="text-sm text-stone-700 leading-relaxed">{summary}</p>
            <button onClick={run} disabled={generate.isPending}
              className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium mt-3">
              {generate.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Regenerate
            </button>
          </motion.div>
        ) : (
          <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
            <button onClick={run} disabled={generate.isPending}
              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60">
              {generate.isPending
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…</>
                : <><Sparkles className="w-3.5 h-3.5" /> Generate summary</>
              }
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentAiSummaryCard;
