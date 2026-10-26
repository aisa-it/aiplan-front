// Генерирует src/i18n/generated/<язык>.ts из словарей src/{modules,components}/<папка>/i18n.
// Запуск: плагин Vite, `yarn i18n:generate`, проверка — `yarn i18n:check`.
// TODO: на Node >= 22.13 рассмотреть @intlify/unplugin-vue-i18n (предкомпиляция сообщений).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LOCALES = ['ru', 'en'];
const SEARCH_DIRS = ['src/modules', 'src/components'];
const OUTPUT_DIR = 'src/i18n/generated';

const RESERVED = ['common', 'timezones', '$vuetify'];
// Имя папки попадает в код как идентификатор и путь — только kebab-case.
const FOLDER_NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

// user-status → userStatus
const toCamelCase = (name) =>
  name.replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase());

// Windows-пути → posix
const toPosix = (p) => p.split(path.sep).join('/');

// Находит словари и проверяет их; при ошибках бросает исключение.
export const collectDictionaries = (root) => {
  const errors = [];
  const found = [];

  for (const searchDir of SEARCH_DIRS) {
    const absDir = path.join(root, searchDir);
    if (!fs.existsSync(absDir)) continue;

    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const i18nDir = path.join(absDir, entry.name, 'i18n');
      if (!fs.existsSync(i18nDir)) continue;

      const relDir = toPosix(path.join(searchDir, entry.name, 'i18n'));
      if (!FOLDER_NAME.test(entry.name)) {
        errors.push(
          `${relDir}: folder name "${entry.name}" must be kebab-case (a-z, 0-9, "-")`,
        );
        continue;
      }
      const missing = LOCALES.filter(
        (locale) => !fs.existsSync(path.join(i18nDir, `${locale}.ts`)),
      );
      if (missing.length) {
        errors.push(
          `${relDir}: missing dictionary ${missing.map((l) => `${l}.ts`).join(', ')}`,
        );
        continue;
      }

      found.push({
        namespace: toCamelCase(entry.name),

        importBase: `@/${toPosix(path.join(path.relative('src', searchDir), entry.name, 'i18n'))}`,
        relDir,
      });
    }
  }

  const byNamespace = new Map();
  for (const dict of found) {
    if (RESERVED.includes(dict.namespace)) {
      errors.push(
        `${dict.relDir}: namespace "${dict.namespace}" is reserved by the shared dictionary`,
      );
    }
    const other = byNamespace.get(dict.namespace);
    if (other) {
      errors.push(
        `namespace "${dict.namespace}" is used twice: ${other.relDir} and ${dict.relDir}`,
      );
    }
    byNamespace.set(dict.namespace, dict);
  }

  if (errors.length) {
    throw new Error(`[i18n] dictionary errors:\n  - ${errors.join('\n  - ')}`);
  }

  // Без localeCompare: порядок не должен зависеть от системной локали (CI и машины разработчиков).
  return found.sort((a, b) => (a.namespace < b.namespace ? -1 : 1));
};

// userStatus + en → userStatusEn
const identifier = (namespace, locale) =>
  `${namespace}${locale[0].toUpperCase()}${locale.slice(1)}`;

// Текст файлов по языкам: { путь: содержимое }. Неосновные языки сверяются с ru через satisfies.
export const renderDictionaries = (dictionaries) => {
  const [baseLocale] = LOCALES;

  return Object.fromEntries(
    LOCALES.map((l) => {
      const imports = dictionaries.map(
        (d) =>
          `import ${identifier(d.namespace, l)} from '${d.importBase}/${l}';`,
      );
      const entries = dictionaries.map(
        (d) => `  ${d.namespace}: ${identifier(d.namespace, l)},`,
      );
      const isBase = l === baseLocale;
      const content = [
        '// АВТОГЕНЕРАЦИЯ — не править вручную.',
        '// Источник: scripts/i18n-dictionaries.mjs (запускается плагином Vite и `yarn i18n:generate`).',
        ...(isBase
          ? []
          : [`import type ${baseLocale} from './${baseLocale}';`]),
        ...imports,
        '',
        `export default {\n${entries.join('\n')}\n}${isBase ? '' : ` satisfies typeof ${baseLocale}`};`,
        '',
      ].join('\n');
      return [`${OUTPUT_DIR}/${l}.ts`, content];
    }),
  );
};

// Пишет только изменившиеся файлы (меньше HMR); с check — только сравнивает.
export const generateI18nDictionaries = (root, { check = false } = {}) => {
  const files = renderDictionaries(collectDictionaries(root));
  const stale = Object.entries(files).filter(([file, content]) => {
    const outFile = path.join(root, file);
    // CRLF после checkout с core.autocrlf не считаем расхождением.
    return (
      !fs.existsSync(outFile) ||
      fs.readFileSync(outFile, 'utf8').replace(/\r\n/g, '\n') !== content
    );
  });

  if (stale.length && !check) {
    fs.mkdirSync(path.join(root, OUTPUT_DIR), { recursive: true });
    for (const [file, content] of stale)
      fs.writeFileSync(path.join(root, file), content);
  }
  return { changed: stale.length > 0 && !check, upToDate: stale.length === 0 };
};

// Файлы, при добавлении/удалении которых нужно перегенерировать реестр.
const DICTIONARY_FILE = new RegExp(
  `/src/(modules|components)/[^/]+/i18n/(${LOCALES.join('|')})\\.ts$`,
);

// Плагин Vite: генерация при старте и при добавлении/удалении словаря в dev.
export const i18nDictionariesPlugin = () => {
  let root = process.cwd();
  return {
    name: 'aiplan:i18n-dictionaries',
    configResolved(config) {
      root = config.root;
    },
    buildStart() {
      generateI18nDictionaries(root);
    },
    configureServer(server) {
      const regenerate = (file) => {
        if (!DICTIONARY_FILE.test(toPosix(file))) return;
        try {
          if (generateI18nDictionaries(root).changed) {
            server.config.logger.info('[i18n] dictionary registry updated', {
              timestamp: true,
            });
          }
        } catch (error) {
          server.config.logger.error(error.message, { timestamp: true });
        }
      };
      server.watcher.on('add', regenerate);
      server.watcher.on('unlink', regenerate);
    },
  };
};

const SCRIPT_PATH = fileURLToPath(import.meta.url);

// realpath с обеих сторон: через symlink/junction пути иначе не совпадут и CLI молча не запустится.
const isCli = () => {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(SCRIPT_PATH);
  } catch {
    // argv[1] — не файл (node -e, REPL): значит, модуль импортирован, а не запущен.
    return false;
  }
};

// CLI: node scripts/i18n-dictionaries.mjs [--check]; корень — от расположения скрипта, не от cwd.
if (isCli()) {
  const check = process.argv.includes('--check');
  const root = path.resolve(path.dirname(SCRIPT_PATH), '..');
  try {
    const { upToDate } = generateI18nDictionaries(root, { check });
    if (check && !upToDate) {
      console.error(
        `[i18n] ${OUTPUT_DIR} is outdated — run yarn i18n:generate`,
      );
      process.exit(1);
    }
    console.log(
      check
        ? '[i18n] dictionary registry is up to date'
        : upToDate
          ? '[i18n] dictionary registry unchanged'
          : `[i18n] updated ${OUTPUT_DIR}`,
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
