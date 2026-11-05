import type { Plugin } from 'vite';

export interface DictionaryEntry {
  namespace: string;
  importBase: string;
  relDir: string;
}

export declare const collectDictionaries: (root: string) => DictionaryEntry[];

export declare const renderDictionaries: (
  dictionaries: ReadonlyArray<DictionaryEntry>,
) => Record<string, string>;

export declare const generateI18nDictionaries: (
  root: string,
  options?: { check?: boolean },
) => { changed: boolean; upToDate: boolean };

export declare const i18nDictionariesPlugin: () => Plugin;
