import type { Plugin } from 'vite';

export declare const i18nDictionariesPlugin: () => Plugin;

export declare const generateI18nDictionaries: (
  root: string,
  options?: { check?: boolean },
) => { changed: boolean; upToDate: boolean };
