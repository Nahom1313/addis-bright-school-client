import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, AlertCircle, Info, ChevronDown, ChevronRight,
  Languages, Loader2, Sparkles,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useTranslationLang } from '@/context/TranslationContext';
import clsx from 'clsx';

// ─── Config ───────────────────────────────────────────────────────
const TONE = {
  positive: { bar: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2, label: 'Positive' },
  neutral:  { bar: 'bg-stone-300',   badge: 'bg-stone-50 text-stone-600 border-stone-200',       icon: Info,         label: 'Neutral' },
  concern:  { bar: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-100',       icon: AlertCircle,  label: 'Needs attention' },
};

const CAT_BADGE = {
  attendance: 'badge-rose',
  behaviour:  'badge-amber',
  academic:   'badge-sky',
  social:     'badge-green',
  health:     'badge-violet',
  general:    'badge-stone',
};

// ─── Main LogCard ─────────────────────────────────────────────────
const LogCard = ({ log, isNew = false }) => {
  const { language, getTranslation, isTranslating } = useTranslationLang();

  const [open, setOpen]               = useState(false);
  const [translation, setTranslation] = useState(null);
  const [transError, setTransError]   = useState(false);

  const enriched      = log.enriched;
  const tone          = TONE[log.tone] || TONE.neutral;
  const ToneIcon      = tone.icon;
  const isProcessing  = !enriched && !log.enrichmentError;
  const translating   = isTranslating(log._id);

  // Auto-translate when language switches to Amharic and log is enriched
  useEffect(() => {
    if (language === 'am' && enriched && log.summary && !translation && !transError) {
      getTranslation(log._id, log.summary, log.suggestedAction)
        .then(t => setTranslation(t))
        .catch(() => setTransError(true));
    }
  }, [language, enriched]);

  // Displayed text — show Amharic if available, fallback to English
  const displaySummary         = language === 'am' && translation?.summary         ? translation.summary         : log.summary;
  const displaySuggestedAction = language === 'am' && translation?.suggestedAction ? translation.suggestedAction : log.suggestedAction;
  const isAmharic              = language === 'am' && !!translation?.summary;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      className={clsx('card !p-0 overflow-hidden', isNew && 'ring-2 ring-amber-400 ring-offset-1')}
    >
      {/* Tone accent bar */}
      <div className={clsx('h-0.5 w-full', enriched ? tone.bar : 'bg-stone-200 animate-pulse')} />

      <button
        className="w-full flex items-start gap-4 p-4 text-left hover:bg-stone-50/60 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        {/* Teacher avatar */}
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-bold text-amber-700">
            {log.teacherId?.firstName?.[0]}{log.teacherId?.lastName?.[0]}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-xs font-semibold text-stone-500">
              {log.teacherId?.firstName} {log.teacherId?.lastName}
            </p>
            <span className="text-stone-300">·</span>
            <p className="text-xs text-stone-400">
              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
            </p>
            {isNew && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">
                New
              </span>
            )}
            {/* Amharic indicator */}
            {isAmharic && (
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                <Languages className="w-2.5 h-2.5" /> አማርኛ
              </span>
            )}
            {translating && (
              <span className="flex items-center gap-1 text-[10px] text-stone-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Translating…
              </span>
            )}
          </div>

          {/* Summary */}
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-stone-300 border-t-amber-500 rounded-full animate-spin flex-shrink-0" />
              <p className="text-sm text-stone-400 italic">AI is preparing your update…</p>
            </div>
          ) : log.enrichmentError ? (
            <p className="text-sm text-stone-600 italic">"{log.rawNote}"</p>
          ) : (
            <p className={clsx('text-sm text-stone-700 leading-snug', isAmharic && 'font-medium')}>
              {displaySummary}
            </p>
          )}

          {/* Tags */}
          {enriched && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className={clsx('inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border', tone.badge)}>
                <ToneIcon className="w-3 h-3" /> {tone.label}
              </span>
              {log.category && (
                <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded-full', CAT_BADGE[log.category] || 'badge-stone')}>
                  {log.category}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0 mt-1 text-stone-300">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-stone-100 bg-stone-50/50 px-5 py-4 space-y-3 text-sm overflow-hidden"
          >
            {enriched && displaySuggestedAction && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                  {language === 'am' ? 'የሚመከር እርምጃ' : 'Suggested action'}
                </p>
                <p className="text-amber-800 text-sm leading-relaxed">{displaySuggestedAction}</p>
              </div>
            )}

            {/* Raw note — always shown in original language */}
            {log.rawNote && (
              <div className="bg-stone-100 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">
                  {language === 'am' ? 'የአስተማሪ ማስታወሻ' : "Teacher's note"}
                </p>
                <p className="text-stone-600 text-xs italic">"{log.rawNote}"</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs text-stone-500">
              <div>
                <p className="font-semibold text-stone-400 mb-0.5">
                  {language === 'am' ? 'ተማሪ' : 'Student'}
                </p>
                <p>{log.studentId?.firstName} {log.studentId?.lastName}</p>
                <p className="text-stone-300">{log.studentId?.studentCode}</p>
              </div>
              <div>
                <p className="font-semibold text-stone-400 mb-0.5">
                  {language === 'am' ? 'ቀን እና ሰዓት' : 'Date & time'}
                </p>
                <p>{format(new Date(log.createdAt), 'MMM d, yyyy')}</p>
                <p className="text-stone-300">{format(new Date(log.createdAt), 'h:mm a')}</p>
              </div>
            </div>

            {transError && language === 'am' && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Translation failed — showing English
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LogCard;
