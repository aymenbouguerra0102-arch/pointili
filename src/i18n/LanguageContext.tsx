import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations, translations } from './translations';
import { Globe, Check } from 'lucide-react';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY_LANG = 'pointili_preferred_language_v1';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG) as Language;
      if (saved && (saved === 'ar' || saved === 'fr' || saved === 'en')) {
        return saved;
      }
    } catch {}
    return 'ar'; // Default Arabic
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, newLang);
    } catch {}
  };

  const dir: 'rtl' | 'ltr' = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    dir,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export const LanguageSelector: React.FC<{ compact?: boolean; className?: string }> = ({
  compact = false,
  className = '',
}) => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ar', label: 'العربية (AR)', flag: '🇩🇿' },
    { code: 'fr', label: 'Français (FR)', flag: '🇫🇷' },
    { code: 'en', label: 'English (EN)', flag: '🇬🇧' },
  ];

  const current = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#76FF03]/60 text-xs font-bold text-zinc-200 hover:text-white transition-all cursor-pointer shadow-sm"
        title="اختر اللغة / Select Language"
      >
        <span className="text-sm">{current.flag}</span>
        {!compact && <span className="text-[11px] font-mono">{current.code.toUpperCase()}</span>}
        <Globe className="w-3.5 h-3.5 text-[#76FF03]" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-40 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLanguage(item.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  language === item.code
                    ? 'bg-[#76FF03]/15 text-[#76FF03] font-bold'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.flag}</span>
                  <span>{item.label}</span>
                </div>
                {language === item.code && <Check className="w-3.5 h-3.5 text-[#76FF03]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
