import { watch } from 'vue';
import { createI18n, type PickupPaths } from 'vue-i18n';
import { ru as vuetifyRu } from 'vuetify/locale';

import modulesRu from './generated/ru';
import ru from './locales/ru';

const ruMessages = { ...ru, ...modulesRu, $vuetify: vuetifyRu };

export type MessageSchema = typeof ruMessages;

export type MessageKey = PickupPaths<Omit<MessageSchema, '$vuetify'>>;

export const SUPPORTED_LOCALES = ['ru', 'en'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE = 'ru' satisfies AppLocale;

const loadedLocales = new Set<AppLocale>([DEFAULT_LOCALE]);

const LOCALE_STORAGE_KEY = 'aiplan-locale';

const INITIAL_LOCALE_TIMEOUT_MS = 8000;

// Каждый язык — отдельный чанк. Исключение: Vuetify en всё равно в стартовом бандле — его импортирует ядро Vuetify.
const localeLoaders: Record<
  Exclude<AppLocale, typeof DEFAULT_LOCALE>,
  () => Promise<MessageSchema>
> = {
  en: async () => {
    const [shared, modules, vuetify] = await Promise.all([
      import('./locales/en'),
      import('./generated/en'),
      import('vuetify/lib/locale/en.js'),
    ]);
    return {
      ...shared.default,
      ...modules.default,
      $vuetify: vuetify.default,
    };
  },
};

export const isAppLocale = (value: unknown): value is AppLocale =>
  SUPPORTED_LOCALES.includes(value as AppLocale);

export const LOCALE_OPTIONS = [
  { title: 'Русский', value: 'ru' },
  { title: 'English', value: 'en' },
] as const satisfies ReadonlyArray<{ title: string; value: AppLocale }>;

const getInitialLocale = (): AppLocale => {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isAppLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch (error) {
    console.warn('[i18n] failed to read locale from localStorage', error);
    return DEFAULT_LOCALE;
  }
};

const ruPluralRule = (choice: number, choicesLength: number) => {
  const n = Math.abs(choice) % 100;
  const n1 = n % 10;
  let index = 2;
  if (n < 11 || n > 19) {
    if (n1 === 1) index = 0;
    else if (n1 >= 2 && n1 <= 4) index = 1;
  }
  return Math.min(index, choicesLength - 1);
};

export const i18n = createI18n<[MessageSchema], AppLocale, false>({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: { ru: ruMessages } as Record<AppLocale, MessageSchema>,
  pluralRules: { ru: ruPluralRule },
});

const loadLocaleMessages = async (locale: AppLocale) => {
  if (locale === DEFAULT_LOCALE || loadedLocales.has(locale)) return;
  i18n.global.setLocaleMessage(locale, await localeLoaders[locale]());
  loadedLocales.add(locale);
};

const applyLocale = (() => {
  let lastRequest = 0;

  return async (locale: AppLocale) => {
    const request = ++lastRequest;
    await loadLocaleMessages(locale);

    if (request !== lastRequest) return false;
    i18n.global.locale.value = locale;
    return true;
  };
})();

export const setLocale = async (locale: AppLocale) => {
  try {
    if (!(await applyLocale(locale))) return;
  } catch (error) {
    console.error(`[i18n] failed to load locale "${locale}"`, error);
    return;
  }
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch (error) {
    console.warn('[i18n] failed to save locale to localStorage', error);
  }
};

const withTimeout = <T>(promise: Promise<T>, ms: number) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timeout ${ms} ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

export const i18nReady: Promise<void> = withTimeout(
  applyLocale(getInitialLocale()),
  INITIAL_LOCALE_TIMEOUT_MS,
).then(
  () => undefined,
  (error) => {
    console.error('[i18n] failed to load saved locale, using default', error);
    void applyLocale(DEFAULT_LOCALE);
  },
);

document.documentElement.lang = i18n.global.locale.value;
watch(i18n.global.locale, (locale) => {
  document.documentElement.lang = locale;
});
