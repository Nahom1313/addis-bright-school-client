import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { logsApi } from '@/api/logs';

const TranslationContext = createContext(null);

export const TranslationProvider = ({ children }) => {
  // 'en' | 'am'
  const [language, setLanguage] = useState(() =>
    localStorage.getItem('preferredLanguage') || 'en'
  );

  // Cache: logId -> { summary, suggestedAction }
  const cache = useRef({});
  const [loadingIds, setLoadingIds] = useState(new Set());

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const next = prev === 'en' ? 'am' : 'en';
      localStorage.setItem('preferredLanguage', next);
      return next;
    });
  }, []);

  // Returns translated text for a log, fetching + caching if needed
  const getTranslation = useCallback(async (logId, summary, suggestedAction) => {
    if (cache.current[logId]) return cache.current[logId];

    setLoadingIds(prev => new Set(prev).add(logId));
    try {
      const res = await logsApi.translate(summary, suggestedAction);
      const translation = res.data.data;
      cache.current[logId] = translation;
      return translation;
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(logId);
        return next;
      });
    }
  }, []);

  const isTranslating = useCallback((logId) => loadingIds.has(logId), [loadingIds]);

  return (
    <TranslationContext.Provider value={{ language, toggleLanguage, getTranslation, isTranslating, cache: cache.current }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationLang = () => {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error('useTranslationLang must be used inside TranslationProvider');
  return ctx;
};
