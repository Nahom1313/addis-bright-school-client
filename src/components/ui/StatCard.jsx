import { motion } from 'framer-motion';
import clsx from 'clsx';

const StatCard = ({ label, value, icon: Icon, color = 'amber', sub, loading, delay = 0 }) => {
  const palettes = {
    amber:  'bg-amber-50   text-amber-700  border-amber-100',
    violet: 'bg-violet-50  text-violet-700 border-violet-100',
    sky:    'bg-sky-50     text-sky-700    border-sky-100',
    green:  'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose:   'bg-rose-50    text-rose-700   border-rose-100',
    stone:  'bg-stone-100  text-stone-600  border-stone-100',
  };
  const cls = palettes[color] || palettes.amber;
  const [bg, text] = cls.split(' ');

  return (
    <motion.div className="card card-hover" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="section-label">{label}</p>
          {loading
            ? <div className="h-9 w-24 bg-stone-100 rounded-lg animate-pulse mt-1" />
            : <p className="text-3xl font-bold text-stone-900 font-display leading-none mt-1">{value ?? '—'}</p>
          }
          {sub && !loading && <p className="text-xs text-stone-400 mt-2">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon className={`w-5 h-5 ${text}`} />
        </div>
      </div>
    </motion.div>
  );
};
export default StatCard;
