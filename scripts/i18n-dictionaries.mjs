// Генерирует словарный реестр src/i18n/generated/<язык>.ts из словарей src/{modules,components}/**/i18n.
// Namespace — имя папки, в которой лежит i18n (user-status → userStatus), на любой глубине.
// Запуск: плагин Vite, `yarn i18n:generate`, проверка — `yarn i18n:check`.
// TODO: на Node >= 22.13 рассмотреть @intlify/unplugin-vue-i18n (предкомпиляция сообщений).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Первая локаль — базовая: эталон типа, с которым остальные сверяются через `satisfies`.
const LOCALES = ['ru', 'en'];
const SEARCH_DIRS = ['src/modules', 'src/components'];
const DICTIONARY_DIR_NAME = 'i18n';
const OUTPUT_DIR = `src/${DICTIONARY_DIR_NAME}/generated`;
const CORE_DIR = `src/${DICTIONARY_DIR_NAME}`;

const RESERVED = ['common', 'timezones', '$vuetify'];

const FOLDER_NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

// Путь относительно корня проекта: любая папка словаря или файл локали в `src/`, кроме ядра.
const DICTIONARY_REL_PATH = new RegExp(
  `^src/(?!${DICTIONARY_DIR_NAME}(?:/|$)).+/${DICTIONARY_DIR_NAME}(/(${LOCALES.join('|')})\\.ts)?$`,
);

// Преобразует kebab-case в camelCase (user-status → userStatus, pt-BR → ptBR).
const toCamelCase = (name) =>
  name.replace(/-([a-zA-Z0-9])/g, (_, ch) => ch.toUpperCase());

const toPosix = (p) => p.split(path.sep).join('/');

// Ищет все вложенные папки словарей внутри каталога поиска (например, src/modules).
// Прямую `<searchDir>/<словарная папка>` (isRoot) пропускает — у неё нет родительской папки для неймспейса.
const findDictionaryDirs = (absDir, acc = [], isRoot = true) => {
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const absChild = path.join(absDir, entry.name);
    if (entry.name === DICTIONARY_DIR_NAME) {
      // Учитываем и symlink/junction на папку (включая битый, чтобы ниже выдать ошибку про отсутствие файлов).
      const targetStat = entry.isSymbolicLink()
        ? fs.statSync(absChild, { throwIfNoEntry: false })
        : null;
      const isDir =
        entry.isDirectory() ||
        (entry.isSymbolicLink() && (!targetStat || targetStat.isDirectory()));
      if (isDir && !isRoot) acc.push(absChild);
      continue;
    }
    if (!entry.isDirectory()) continue;
    findDictionaryDirs(absChild, acc, false);
  }
  return acc;
};

// Ищет папки словарей с файлами локалей в `src/`, которые не попали в `visitedDirs`
// (например, в `src/layouts/...` или внутри другой папки словаря), чтобы они не потерялись молча.
const findMisplacedDictionaries = (root, visitedDirs) => {
  const srcDir = path.join(root, 'src');
  if (!fs.existsSync(srcDir)) return [];

  const misplaced = [];
  const walk = (absDir) => {
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
      const absChild = path.join(absDir, entry.name);
      const relDir = toPosix(path.relative(root, absChild));
      // В обычные папки заходим рекурсивно (включая папку словаря, чтобы поймать вложенность), в симлинки — нет.
      const isSymI18nDir =
        entry.name === DICTIONARY_DIR_NAME &&
        entry.isSymbolicLink() &&
        Boolean(
          fs.statSync(absChild, { throwIfNoEntry: false })?.isDirectory(),
        );
      if (!entry.isDirectory() && !isSymI18nDir) continue;
      if (entry.isDirectory()) walk(absChild);
      if (
        entry.name !== DICTIONARY_DIR_NAME ||
        relDir === CORE_DIR ||
        visitedDirs.has(relDir)
      )
        continue;

      const isNestedInI18n = relDir
        .split('/')
        .slice(0, -1)
        .includes(DICTIONARY_DIR_NAME);
      const isEmpty = fs.readdirSync(absChild).length === 0;
      const hasLocaleFile = LOCALES.some((locale) =>
        fs.existsSync(path.join(absChild, `${locale}.ts`)),
      );
      if (isNestedInI18n || isEmpty || hasLocaleFile) {
        misplaced.push(relDir);
      }
    }
  };
  walk(srcDir);
  return misplaced.sort();
};

// Собирает словари модулей и компонентов, проверяет структуру папок и уникальность неймспейсов.
export const collectDictionaries = (root) => {
  const errors = [];
  const found = [];
  const visitedDirs = new Set();

  for (const searchDir of SEARCH_DIRS) {
    const absDir = path.join(root, searchDir);
    if (!fs.existsSync(absDir)) continue;

    for (const absI18n of findDictionaryDirs(absDir)) {
      const relDir = toPosix(path.relative(root, absI18n));
      visitedDirs.add(relDir);

      const missing = LOCALES.filter(
        (locale) => !fs.existsSync(path.join(absI18n, `${locale}.ts`)),
      );
      const nsFolder = path.basename(path.dirname(absI18n));
      const badFolder = !FOLDER_NAME.test(nsFolder);

      if (missing.length) {
        errors.push(
          `${relDir}: missing dictionary ${missing.map((l) => `${l}.ts`).join(', ')}`,
        );
      }
      if (badFolder) {
        errors.push(
          `${relDir}: folder name "${nsFolder}" must be kebab-case (a-z, 0-9, "-")`,
        );
      }
      if (missing.length || badFolder) continue;

      found.push({
        namespace: toCamelCase(nsFolder),
        importBase: `@/${relDir.replace(/^src\//, '')}`,
        relDir,
      });
    }
  }

  const allowedPattern = SEARCH_DIRS.map(
    (d) => `${d}/<folder>/**/${DICTIONARY_DIR_NAME}`,
  ).join(' or ');
  for (const relDir of findMisplacedDictionaries(root, visitedDirs)) {
    const nestedInI18n = relDir
      .split('/')
      .slice(0, -1)
      .includes(DICTIONARY_DIR_NAME);
    errors.push(
      nestedInI18n
        ? `${relDir}: dictionary nested inside another ${DICTIONARY_DIR_NAME}/ folder would not be registered`
        : `${relDir}: dictionary outside ${allowedPattern} would not be registered`,
    );
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

  // Кодовая сортировка вместо localeCompare, чтобы порядок не зависел от локали ОС.
  return found.sort((a, b) =>
    a.namespace < b.namespace ? -1 : a.namespace > b.namespace ? 1 : 0,
  );
};

// Формирует имя импорта словаря: ('userStatus', 'en') → 'userStatusEn'.
const identifier = (namespace, locale) => {
  const camelLocale = toCamelCase(locale);
  return `${namespace}${camelLocale[0].toUpperCase()}${camelLocale.slice(1)}`;
};

// Генерирует текст файлов реестра `{ [путь]: код }`.
// Базовая локаль (первая в LOCALES) задаёт эталон типа, остальные сверяются с ней в обе стороны через `satisfies`.
export const renderDictionaries = (dictionaries) => {
  const [baseLocale] = LOCALES;

  const files = Object.fromEntries(
    LOCALES.map((l) => {
      const imports = dictionaries.map(
        (d) =>
          `import ${identifier(d.namespace, l)} from '${d.importBase}/${l}';`,
      );
      const entries = dictionaries.map(
        (d) => `  ${d.namespace}: ${identifier(d.namespace, l)},`,
      );
      const isBase = l === baseLocale;
      const body = isBase
        ? `export default {\n${entries.join('\n')}\n};`
        : [
            `const messages = {\n${entries.join('\n')}\n} satisfies typeof ${baseLocale};`,
            '',
            `true satisfies (typeof ${baseLocale} extends typeof messages ? true : false);`,
            '',
            'export default messages;',
          ].join('\n');
      const content = [
        '// АВТОГЕНЕРАЦИЯ — не править вручную.',
        '// Источник: scripts/i18n-dictionaries.mjs (запускается плагином Vite и `yarn i18n:generate`).',
        ...(isBase
          ? []
          : [`import type ${baseLocale} from './${baseLocale}';`]),
        ...imports,
        '',
        body,
        '',
      ].join('\n');
      return [`${OUTPUT_DIR}/${l}.ts`, content];
    }),
  );

  // Список локалей — тоже артефакт: index.ts берёт отсюда SUPPORTED_LOCALES,
  files[`${OUTPUT_DIR}/locales.ts`] = [
    '// АВТОГЕНЕРАЦИЯ — не править вручную.',
    '// Источник: scripts/i18n-dictionaries.mjs (запускается плагином Vite и `yarn i18n:generate`).',
    `export const SUPPORTED_LOCALES = [${LOCALES.map((l) => `'${l}'`).join(
      ', ',
    )}] as const;`,
    '',
  ].join('\n');
  return files;
};

// Синхронизирует файлы реестра на диске: перезаписывает изменившиеся и удаляет лишние.
// При `check: true` файлы не меняет. `upToDate` показывает, был ли реестр актуален до вызова.
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

  const outDir = path.join(root, OUTPUT_DIR);
  const expectedNames = new Set(
    Object.keys(files).map((file) => path.basename(file)),
  );
  const extraFiles = fs.existsSync(outDir)
    ? fs
        .readdirSync(outDir)
        .filter((name) => !expectedNames.has(name))
        .map((name) => path.join(outDir, name))
    : [];

  const upToDate = stale.length === 0 && extraFiles.length === 0;
  if (!upToDate && !check) {
    if (stale.length) {
      fs.mkdirSync(outDir, { recursive: true });
      for (const [file, content] of stale)
        fs.writeFileSync(path.join(root, file), content);
    }
    for (const extraFile of extraFiles)
      fs.rmSync(extraFile, { recursive: true, force: true });
  }
  return { changed: !upToDate && !check, upToDate };
};

// Плагин Vite: генерирует реестр при старте и обновляет его при добавлении/удалении словарей в dev.
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
        const relFile = toPosix(path.relative(root, path.resolve(root, file)));
        if (!DICTIONARY_REL_PATH.test(relFile)) return;
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
      // Если файлы из i18n/ удаляли по одному, реестр обновится при удалении самой пустой папки.
      server.watcher.on('unlinkDir', regenerate);
    },
  };
};

const SCRIPT_PATH = fileURLToPath(import.meta.url);

// Проверяет, запущен ли файл напрямую через `node`, а не импортирован (`realpath` учитывает симлинки).
const isCli = () => {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(SCRIPT_PATH);
  } catch {
    // Например, при `node -e` аргумент argv[1] не является путём к файлу.
    return false;
  }
};

// CLI: `node scripts/i18n-dictionaries.mjs [--check]` (корень проекта берётся от папки скрипта).
if (isCli()) {
  const args = process.argv.slice(2);
  const unknown = args.filter((arg) => arg !== '--check');
  if (unknown.length) {
    console.error(
      `[i18n] unknown option: ${unknown.join(', ')} (expected: [--check])`,
    );
    process.exit(1);
  }
  const check = args.includes('--check');
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
