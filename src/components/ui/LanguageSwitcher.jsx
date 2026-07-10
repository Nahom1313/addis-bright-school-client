import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN',  full: 'English'       },
  { code: 'am', label: 'አማ', full: 'አማርኛ'          },
  { code: 'ti', label: 'ትግ', full: 'ትግርኛ'          },
  { code: 'om', label: 'OM',  full: 'Afaan Oromoo'  },
];

export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2) || 'en';

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          title={lang.full}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
            current === lang.code
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
          }`}
        >
          {compact ? lang.label : lang.full}
        </button>
      ))}
    </div>
  );
}
