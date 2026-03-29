import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import uk from './locales/uk.js';
import en from './locales/en.js';

const LOCALES = { uk, en };
const SUPPORTED = Object.keys(LOCALES);
const DEFAULT_LANG = 'uk';
const STORAGE_KEY = 'gw_lang';

/**
 * Detect best language from Telegram WebApp settings.
 * Falls back to browser language, then localStorage, then Ukrainian.
 */
function detectLanguage() {
  // 1. Check localStorage override
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
  } catch {}

  // 2. Telegram WebApp language_code (ISO 639-1)
  const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  if (tgLang) {
    const code = tgLang.toLowerCase().slice(0, 2);
    if (SUPPORTED.includes(code)) return code;
    // Map Russian speakers to Ukrainian (closest available)
    if (code === 'ru') return 'uk';
  }

  // 3. Browser language
  const browserLang = navigator.language?.toLowerCase().slice(0, 2);
  if (browserLang && SUPPORTED.includes(browserLang)) return browserLang;
  if (browserLang === 'ru') return 'uk';

  return DEFAULT_LANG;
}

/**
 * Interpolate template strings: "Hello {name}" + {name: "World"} → "Hello World"
 */
function interpolate(template, vars) {
  if (!vars || typeof template !== 'string') return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

// ── Context ──

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage);

  const setLang = useCallback((code) => {
    if (!SUPPORTED.includes(code)) return;
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  }, []);

  const strings = LOCALES[lang] || LOCALES[DEFAULT_LANG];

  /**
   * t('key') → translated string
   * t('key', { price: '50 PLN' }) → interpolated string
   */
  const t = useCallback(
    (key, vars) => {
      const val = strings[key] ?? LOCALES[DEFAULT_LANG][key] ?? key;
      return vars ? interpolate(val, vars) : val;
    },
    [strings]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, supportedLangs: SUPPORTED }),
    [lang, setLang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
