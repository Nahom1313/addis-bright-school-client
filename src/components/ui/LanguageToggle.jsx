import { Languages } from 'lucide-react';
import { useTranslationLang } from '@/context/TranslationContext';
import clsx from 'clsx';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useTranslationLang();
  const isAmharic = language === 'am';

  return (
    <button
      onClick={toggleLanguage}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
        isAmharic
          ? 'bg-violet-50 text-violet-700 hover:bg-violet-100'
          : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
      )}
      title={isAmharic ? 'Switch to English' : 'Switch to Amharic / አማርኛ'}
    >
      <Languages className={clsx('w-4 h-4 flex-shrink-0', isAmharic ? 'text-violet-600' : 'text-stone-400')} />
      <span className="flex-1 text-left">
        {isAmharic ? 'አማርኛ — Switch to EN' : 'English — Switch to አማርኛ'}
      </span>
      {/* Toggle pill */}
      <div className={clsx(
        'w-8 h-4 rounded-full transition-colors flex-shrink-0 relative',
        isAmharic ? 'bg-violet-500' : 'bg-stone-200'
      )}>
        <div className={clsx(
          'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all',
          isAmharic ? 'left-4' : 'left-0.5'
        )} />
      </div>
    </button>
  );
};

export default LanguageToggle;
