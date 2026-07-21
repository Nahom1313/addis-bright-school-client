import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, RefreshCw, Clock } from 'lucide-react';
import { useGenerateInsights } from '@/hooks/useAnalyticsInsights.js';

const timeAgo = (date) => {
  const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
};

const AiInsightsPanel = () => {
  const [result, setResult] = useState(null);
  const generate = useGenerateInsights();

  const run = (refresh = false) => {
    generate.mutate(refresh, { onSuccess: (res) => setResult(res.data.data) });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="card !bg-gradient-to-br !from-amber-50 !to-white !border-amber-100 mb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <p className="font-semibold text-stone-800 text-sm">AI Insights</p>
            <p className="text-xs text-stone-400">What's worth knowing right now</p>
          </div>
        </div>
        {result && (
          <button onClick={() => run(true)} disabled={generate.isPending}
            className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium flex-shrink-0">
            {generate.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Refresh
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
            <button onClick={() => run(false)} disabled={generate.isPending}
              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60">
              {generate.isPending
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…</>
                : <><Sparkles className="w-3.5 h-3.5" /> Generate insights</>
              }
            </button>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
            <p className="text-sm font-semibold text-stone-800">{result.headline}</p>
            <ul className="mt-2.5 space-y-1.5">
              {result.insights.map((insight, i) => (
                <li key={i} className="text-sm text-stone-600 flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
            <p className="text-xs text-stone-400 flex items-center gap-1 mt-3">
              <Clock className="w-3 h-3" /> Generated {timeAgo(result.generatedAt)}{result.cached ? ' · cached' : ''}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AiInsightsPanel;
