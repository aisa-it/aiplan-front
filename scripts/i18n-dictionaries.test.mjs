// Тесты генератора i18n-реестра: `yarn test` (node --test scripts/).
// Все временные проекты создаются в os.tmpdir() и удаляются после теста.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  collectDictionaries,
  renderDictionaries,
  generateI18nDictionaries,
  i18nDictionariesPlugin,
} from './i18n-dictionaries.mjs';

// Словарное содержимое по умолчанию: collectDictionaries смотрит только на имена файлов.
const DEFAULT_DICT = `export default { title: 'x' };\n`;

// files — объект { путь: содержимое } (undefined → словарь по умолчанию)
// или массив путей, когда содержимое не важно.
const writeFiles = (root, files = []) => {
  const entries = Array.isArray(files)
    ? files.map((file) => [file, DEFAULT_DICT])
    : Object.entries(files);
  for (const [file, content] of entries) {
    const abs = path.join(root, file);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content ?? DEFAULT_DICT);
  }
};

const makeProject = (t, files) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-dict-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  writeFiles(root, files);
  return root;
};

// Оба файла словаря: dict('src/modules/profile') → i18n/ru.ts и i18n/en.ts.
const dict = (dir) => [`${dir}/i18n/ru.ts`, `${dir}/i18n/en.ts`];

// Сообщение ошибки collectDictionaries; падает, если исключения не было.
const collectError = (root) => {
  try {
    collectDictionaries(root);
  } catch (error) {
    return error.message;
  }
  assert.fail('collectDictionaries должен был бросить исключение');
};

const readRegistry = (root) =>
  fs.readFileSync(path.join(root, 'src/i18n/generated/ru.ts'), 'utf8');

describe('collectDictionaries — находит словари', () => {
  it('модуль и виджет: namespace, importBase, relDir', (t) => {
    const root = makeProject(t, [
      ...dict('src/modules/profile'),
      ...dict('src/components/user-status'),
    ]);
    assert.deepEqual(collectDictionaries(root), [
      {
        namespace: 'profile',
        importBase: '@/modules/profile/i18n',
        relDir: 'src/modules/profile/i18n',
      },
      {
        namespace: 'userStatus',
        importBase: '@/components/user-status/i18n',
        relDir: 'src/components/user-status/i18n',
      },
    ]);
  });

  it('порядок — по неймспейсу, а не по расположению папки', (t) => {
    const root = makeProject(t, [
      ...dict('src/modules/zeta'),
      ...dict('src/components/alpha'),
    ]);
    assert.deepEqual(
      collectDictionaries(root).map((d) => d.namespace),
      ['alpha', 'zeta'],
    );
  });

  it('папка без i18n/ игнорируется, имя может быть любым', (t) => {
    const root = makeProject(t, { 'src/components/UserCard/UserCard.vue': '' });
    assert.deepEqual(collectDictionaries(root), []);
  });

  it('папка i18n без ru.ts и en.ts — не словарь', (t) => {
    const root = makeProject(t, { 'src/utils/i18n/format.ts': '' });
    assert.deepEqual(collectDictionaries(root), []);
  });

  it('ядро src/i18n не проверяется', (t) => {
    const root = makeProject(t, {
      'src/i18n/ru.ts': DEFAULT_DICT,
      'src/i18n/locales/ru.ts': DEFAULT_DICT,
    });
    assert.deepEqual(collectDictionaries(root), []);
  });

  it('нет папки src — пустой список', (t) => {
    assert.deepEqual(collectDictionaries(makeProject(t)), []);
  });
});

describe('collectDictionaries — ошибки', () => {
  it('имя папки не kebab-case: UserCard', (t) => {
    const root = makeProject(t, dict('src/components/UserCard'));
    assert.match(collectError(root), /folder name "UserCard" must be kebab-case/);
  });

  it('имя папки не kebab-case: user_card', (t) => {
    const root = makeProject(t, dict('src/components/user_card'));
    assert.match(collectError(root), /folder name "user_card" must be kebab-case/);
  });

  it('a-b-1 и a-b1 дают один неймспейс aB1', (t) => {
    const root = makeProject(t, [
      ...dict('src/components/a-b-1'),
      ...dict('src/components/a-b1'),
    ]);
    assert.match(collectError(root), /namespace "aB1" is used twice/);
  });

  it('одинаковые имена папок в modules и components — коллизия', (t) => {
    const root = makeProject(t, [
      ...dict('src/modules/foo'),
      ...dict('src/components/foo'),
    ]);
    assert.match(collectError(root), /namespace "foo" is used twice/);
  });

  it('common и timezones зарезервированы общим словарём', (t) => {
    for (const name of ['common', 'timezones']) {
      const root = makeProject(t, dict(`src/modules/${name}`));
      assert.match(
        collectError(root),
        new RegExp(`namespace "${name}" is reserved`),
      );
    }
  });

  it('только ru.ts — не хватает en.ts', (t) => {
    const root = makeProject(t, ['src/modules/profile/i18n/ru.ts']);
    assert.match(collectError(root), /missing dictionary en\.ts/);
  });

  it('пустая i18n/ — не хватает обоих файлов', (t) => {
    const root = makeProject(t);
    fs.mkdirSync(path.join(root, 'src/modules/profile/i18n'), {
      recursive: true,
    });
    assert.match(collectError(root), /missing dictionary ru\.ts, en\.ts/);
  });

  it('словарь во вложенной папке компонента — ошибка', (t) => {
    const root = makeProject(
      t,
      dict('src/modules/profile/components/avatar-upload'),
    );
    assert.match(
      collectError(root),
      /dictionary outside src\/modules\/<folder>\/i18n or src\/components\/<folder>\/i18n would not be registered/,
    );
  });

  it('словарь в layouts — ошибка, даже только ru.ts', (t) => {
    const root = makeProject(t, ['src/layouts/main-layout/i18n/ru.ts']);
    assert.match(collectError(root), /would not be registered/);
  });

  it('папка i18n прямо в src/modules — не словарь модуля', (t) => {
    const root = makeProject(t, ['src/modules/i18n/ru.ts', 'src/modules/i18n/en.ts']);
    assert.match(
      collectError(root),
      /src\/modules\/i18n: dictionary outside/,
    );
  });

  it('несколько ошибок — одним исключением', (t) => {
    const root = makeProject(t, [
      ...dict('src/components/UserCard'), // kebab-case
      ...dict('src/modules/common'), // reserved
      'src/layouts/main-layout/i18n/ru.ts', // misplaced
    ]);
    const message = collectError(root);
    assert.ok(message.startsWith('[i18n] dictionary errors:'));
    assert.match(message, /must be kebab-case/);
    assert.match(message, /is reserved/);
    assert.match(message, /would not be registered/);
  });
});

describe('renderDictionaries — текст реестра', () => {
  const dictionaries = [
    {
      namespace: 'profile',
      importBase: '@/modules/profile/i18n',
      relDir: 'src/modules/profile/i18n',
    },
    {
      namespace: 'userStatus',
      importBase: '@/components/user-status/i18n',
      relDir: 'src/components/user-status/i18n',
    },
  ];

  it('ключи — ровно ru.ts и en.ts в src/i18n/generated', () => {
    assert.deepEqual(Object.keys(renderDictionaries(dictionaries)), [
      'src/i18n/generated/ru.ts',
      'src/i18n/generated/en.ts',
    ]);
  });

  it('ru.ts — реестр экспортов словарей', () => {
    assert.equal(
      renderDictionaries(dictionaries)['src/i18n/generated/ru.ts'],
      [
        '// АВТОГЕНЕРАЦИЯ — не править вручную.',
        '// Источник: scripts/i18n-dictionaries.mjs (запускается плагином Vite и `yarn i18n:generate`).',
        "import profileRu from '@/modules/profile/i18n/ru';",
        "import userStatusRu from '@/components/user-status/i18n/ru';",
        '',
        'export default {',
        '  profile: profileRu,',
        '  userStatus: userStatusRu,',
        '};',
        '',
      ].join('\n'),
    );
  });

  it('en.ts — satisfies typeof ru и обратная проверка лишних ключей', () => {
    assert.equal(
      renderDictionaries(dictionaries)['src/i18n/generated/en.ts'],
      [
        '// АВТОГЕНЕРАЦИЯ — не править вручную.',
        '// Источник: scripts/i18n-dictionaries.mjs (запускается плагином Vite и `yarn i18n:generate`).',
        "import type ru from './ru';",
        "import profileEn from '@/modules/profile/i18n/en';",
        "import userStatusEn from '@/components/user-status/i18n/en';",
        '',
        'const messages = {',
        '  profile: profileEn,',
        '  userStatus: userStatusEn,',
        '} satisfies typeof ru;',
        '',
        'true satisfies (typeof ru extends typeof messages ? true : false);',
        '',
        'export default messages;',
        '',
      ].join('\n'),
    );
  });
});

describe('generateI18nDictionaries — запись и check', () => {
  const registryFiles = (root) =>
    ['ru', 'en'].map((locale) =>
      path.join(root, 'src/i18n/generated', `${locale}.ts`),
    );

  it('первый вызов пишет оба файла', (t) => {
    const root = makeProject(t, dict('src/modules/profile'));
    const result = generateI18nDictionaries(root);
    assert.deepEqual(result, { changed: true, upToDate: false });
    const expected = renderDictionaries(collectDictionaries(root));
    for (const [file, content] of Object.entries(expected)) {
      assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), content);
    }
  });

  it('повторный вызов не переписывает файлы', (t) => {
    const root = makeProject(t, dict('src/modules/profile'));
    generateI18nDictionaries(root);
    const before = registryFiles(root).map((file) => fs.statSync(file).mtimeMs);
    const result = generateI18nDictionaries(root);
    assert.deepEqual(result, { changed: false, upToDate: true });
    assert.deepEqual(
      registryFiles(root).map((file) => fs.statSync(file).mtimeMs),
      before,
    );
  });

  it('изменился один файл реестра — переписан только он', (t) => {
    const root = makeProject(t, dict('src/modules/profile'));
    generateI18nDictionaries(root);
    const [ruFile, enFile] = registryFiles(root);
    const expectedEn = fs.readFileSync(enFile, 'utf8');
    // Старое время у ru.ts, чтобы перезапись была видна даже при грубом разрешении mtime.
    const past = new Date('2020-01-01');
    fs.utimesSync(ruFile, past, past);
    fs.writeFileSync(enFile, '// испорчено\n');
    assert.deepEqual(generateI18nDictionaries(root), { changed: true, upToDate: false });
    assert.equal(fs.readFileSync(enFile, 'utf8'), expectedEn);
    assert.equal(fs.statSync(ruFile).mtimeMs, past.getTime());
  });

  it('check на устаревшем реестре ничего не меняет', (t) => {
    const root = makeProject(t, dict('src/modules/profile'));
    generateI18nDictionaries(root);
    const before = registryFiles(root).map((file) => fs.statSync(file).mtimeMs);
    writeFiles(root, dict('src/modules/foo'));
    const result = generateI18nDictionaries(root, { check: true });
    assert.deepEqual(result, { changed: false, upToDate: false });
    assert.deepEqual(
      registryFiles(root).map((file) => fs.statSync(file).mtimeMs),
      before,
    );
  });

  it('check без папки generated не создаёт её', (t) => {
    const root = makeProject(t, dict('src/modules/profile'));
    const result = generateI18nDictionaries(root, { check: true });
    assert.equal(result.upToDate, false);
    assert.equal(fs.existsSync(path.join(root, 'src/i18n/generated')), false);
  });

  it('CRLF после checkout не считается устареванием', (t) => {
    const root = makeProject(t, dict('src/modules/profile'));
    generateI18nDictionaries(root);
    const rendered = renderDictionaries(collectDictionaries(root));
    for (const [file, content] of Object.entries(rendered)) {
      fs.writeFileSync(path.join(root, file), content.split('\n').join('\r\n'));
    }
    assert.deepEqual(generateI18nDictionaries(root), {
      changed: false,
      upToDate: true,
    });
  });

  it('ошибка в словарях — исключение, реестр не тронут', (t) => {
    const root = makeProject(t, dict('src/modules/profile'));
    generateI18nDictionaries(root);
    const before = readRegistry(root);
    writeFiles(root, dict('src/components/UserCard'));
    assert.throws(
      () => generateI18nDictionaries(root),
      /\[i18n\] dictionary errors/,
    );
    assert.equal(readRegistry(root), before);
  });
});

// Вотчер dev-сервера заменён EventEmitter: плагину нужны только события add/unlink/unlinkDir.
describe('i18nDictionariesPlugin — dev-вотчер', () => {
  const makeDevServer = (t, root) => {
    const watcher = new EventEmitter();
    const logs = [];
    const server = {
      watcher,
      config: {
        logger: {
          info: (m) => logs.push(['info', m]),
          error: (m) => logs.push(['error', m]),
        },
      },
    };
    const plugin = i18nDictionariesPlugin();
    plugin.configResolved({ root });
    plugin.buildStart();
    plugin.configureServer(server);
    return { watcher, logs };
  };

  // События — с абсолютными путями, как у настоящего вотчера (на Windows — с обратными слэшами).
  const emit = (watcher, root, event, file) =>
    watcher.emit(event, path.join(root, file));

  const logged = (logs, level, part) =>
    logs.some(([lvl, message]) => lvl === level && message.includes(part));

  it('buildStart создаёт реестр', (t) => {
    const root = makeProject(t, dict('src/modules/profile'));
    const plugin = i18nDictionariesPlugin();
    plugin.configResolved({ root });
    plugin.buildStart();
    assert.ok(fs.existsSync(path.join(root, 'src/i18n/generated/ru.ts')));
    assert.ok(fs.existsSync(path.join(root, 'src/i18n/generated/en.ts')));
  });

  it('подписан ровно на add, unlink и unlinkDir', (t) => {
    const root = makeProject(t, dict('src/modules/profile'));
    const { watcher } = makeDevServer(t, root);
    assert.deepEqual([...watcher.eventNames()].sort(), [
      'add',
      'unlink',
      'unlinkDir',
    ]);
  });

  it('add нового словаря обновляет реестр', (t) => {
    const root = makeProject(t, dict('src/modules/profile'));
    const { watcher, logs } = makeDevServer(t, root);
    writeFiles(root, dict('src/modules/foo'));
    for (const file of dict('src/modules/foo')) emit(watcher, root, 'add', file);
    assert.match(readRegistry(root), /^  foo: fooRu,$/m);
    assert.ok(logged(logs, 'info', 'dictionary registry updated'));
  });

  it('add половины словаря — ошибка в лог, реестр прежний', (t) => {
    const root = makeProject(t, dict('src/modules/profile'));
    const { watcher, logs } = makeDevServer(t, root);
    const before = readRegistry(root);
    writeFiles(root, ['src/modules/foo/i18n/ru.ts']);
    // Исключение ловится внутри обработчика: сам emit бросать не должен.
    emit(watcher, root, 'add', 'src/modules/foo/i18n/ru.ts');
    assert.ok(logged(logs, 'error', 'missing dictionary en.ts'));
    assert.equal(readRegistry(root), before);
  });

  it('файлы по одному: неймспейс уходит только с unlinkDir пустой i18n/', (t) => {
    const root = makeProject(t, [
      ...dict('src/modules/profile'),
      ...dict('src/modules/bar'),
    ]);
    const { watcher } = makeDevServer(t, root);
    for (const file of dict('src/modules/bar')) {
      fs.rmSync(path.join(root, file));
      emit(watcher, root, 'unlink', file);
    }
    // Неполный словарь — ошибка, реестр прежний: bar ещё в реестре.
    assert.match(readRegistry(root), /^  bar: barRu,$/m);
    fs.rmdirSync(path.join(root, 'src/modules/bar/i18n'));
    emit(watcher, root, 'unlinkDir', 'src/modules/bar/i18n');
    assert.ok(!readRegistry(root).includes('bar:'));
  });

  it('rm -rf модуля: события unlink его файлов убирают неймспейс', (t) => {
    const root = makeProject(t, [
      ...dict('src/modules/profile'),
      ...dict('src/modules/baz'),
    ]);
    const { watcher } = makeDevServer(t, root);
    fs.rmSync(path.join(root, 'src/modules/baz'), {
      recursive: true,
      force: true,
    });
    for (const file of dict('src/modules/baz')) {
      emit(watcher, root, 'unlink', file);
    }
    assert.ok(!readRegistry(root).includes('baz:'));
  });

  it('add словаря не на своём месте — ошибка в лог', (t) => {
    const root = makeProject(t, dict('src/modules/profile'));
    const { watcher, logs } = makeDevServer(t, root);
    const before = readRegistry(root);
    writeFiles(root, ['src/layouts/main-layout/i18n/ru.ts']);
    emit(watcher, root, 'add', 'src/layouts/main-layout/i18n/ru.ts');
    assert.ok(logged(logs, 'error', 'would not be registered'));
    assert.equal(readRegistry(root), before);
  });

  it('чужие события не запускают генерацию', (t) => {
    const root = makeProject(t, dict('src/modules/profile'));
    const { watcher, logs } = makeDevServer(t, root);
    // Валидный словарь уже на диске: молчать генерация может только из-за фильтра событий.
    writeFiles(root, dict('src/modules/silent'));
    for (const [event, file] of [
      ['add', 'src/i18n/generated/ru.ts'],
      ['add', 'src/i18n/locales/en.ts'],
      ['add', 'src/modules/silent/i18n/de.ts'],
      ['add', 'src/modules/silent/i18n/ru.json'],
      ['unlinkDir', 'src/i18n'],
      ['unlinkDir', 'src/modules/silent'],
    ]) {
      emit(watcher, root, event, file);
    }
    assert.ok(!readRegistry(root).includes('silent:'));
    assert.deepEqual(logs, []);
    emit(watcher, root, 'add', 'src/modules/silent/i18n/ru.ts');
    assert.match(readRegistry(root), /^  silent: silentRu,$/m);
  });
});

// Скрипт копируется во временный проект: CLI берёт корень от своего расположения,
// поэтому запуск из os.tmpdir() доказывает, что cwd не используется.
describe('CLI scripts/i18n-dictionaries.mjs', () => {
  const makeCliProject = (t, files) => {
    const root = makeProject(t, files);
    fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
    fs.copyFileSync(
      new URL('./i18n-dictionaries.mjs', import.meta.url),
      path.join(root, 'scripts', 'i18n-dictionaries.mjs'),
    );
    return root;
  };

  const runCli = (root, args = []) =>
    spawnSync(
      process.execPath,
      [path.join(root, 'scripts', 'i18n-dictionaries.mjs'), ...args],
      { cwd: os.tmpdir(), encoding: 'utf8' },
    );

  it('без аргументов пишет реестр, повторно — unchanged', (t) => {
    const root = makeCliProject(t, dict('src/modules/profile'));
    const first = runCli(root);
    assert.equal(first.status, 0, first.stderr);
    assert.match(first.stdout, /updated src\/i18n\/generated/);
    assert.ok(fs.existsSync(path.join(root, 'src/i18n/generated/ru.ts')));

    const second = runCli(root);
    assert.equal(second.status, 0, second.stderr);
    assert.match(second.stdout, /dictionary registry unchanged/);
  });

  it('--check: exit 0 на актуальном, exit 1 на устаревшем', (t) => {
    const root = makeCliProject(t, dict('src/modules/profile'));
    runCli(root);
    const upToDate = runCli(root, ['--check']);
    assert.equal(upToDate.status, 0, upToDate.stderr);
    assert.match(upToDate.stdout, /is up to date/);

    writeFiles(root, dict('src/modules/foo'));
    const stale = runCli(root, ['--check']);
    assert.equal(stale.status, 1, stale.stderr);
    assert.match(stale.stderr, /is outdated/);
  });

  it('ошибка в словарях — exit 1 и [i18n] dictionary errors', (t) => {
    const root = makeCliProject(t, dict('src/components/UserCard'));
    const result = runCli(root);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /\[i18n\] dictionary errors/);
  });

  it('импорт как модуля не запускает CLI', (t) => {
    const root = makeCliProject(t, dict('src/modules/profile'));
    const script = path.join(root, 'scripts', 'i18n-dictionaries.mjs');
    const result = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import(${JSON.stringify(pathToFileURL(script).href)})`,
      ],
      { encoding: 'utf8' },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '');
    assert.equal(fs.existsSync(path.join(root, 'src/i18n/generated')), false);
  });
});

// Эти тесты запускают TypeScript проекта и идут по несколько секунд.
describe('типы: что ловит tsc через сгенерированный реестр', () => {
  const repoRoot = path.resolve(fileURLToPath(import.meta.url), '../..');
  const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  const tsconfig = JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
      paths: { '@/*': ['./src/*'] },
    },
    include: ['src/**/*.ts'],
  });

  const ruDictionary = `export default { title: 'Заголовок', nested: { a: 'А' } };\n`;

  // en-словарь без своего satisfies: проверяем проверки самого реестра.
  const makeTypedProject = (t, enDictionary) => {
    const root = makeProject(t, {
      'src/modules/profile/i18n/ru.ts': ruDictionary,
      'src/modules/profile/i18n/en.ts': enDictionary,
      'tsconfig.json': tsconfig,
    });
    generateI18nDictionaries(root);
    return root;
  };

  const runTsc = (root) =>
    spawnSync(
      process.execPath,
      [tscBin, '-p', path.join(root, 'tsconfig.json'), '--pretty', 'false'],
      { encoding: 'utf8' },
    );

  it('те же ключи в en — tsc проходит', (t) => {
    const root = makeTypedProject(
      t,
      `export default { title: 'Title', nested: { a: 'A' } };\n`,
    );
    const result = runTsc(root);
    assert.equal(result.status, 0, result.stdout);
  });

  it('нет nested.a — ошибка TS2322 в generated/en.ts', (t) => {
    const root = makeTypedProject(
      t,
      `export default { title: 'Title', nested: {} };\n`,
    );
    const result = runTsc(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /generated[\\/]en\.ts\(\d+,\d+\): error TS2322/);
  });

  it('лишний nested.b — ошибка TS1360 в generated/en.ts', (t) => {
    const root = makeTypedProject(
      t,
      `export default { title: 'Title', nested: { a: 'A', b: 'B' } };\n`,
    );
    const result = runTsc(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /generated[\\/]en\.ts\(\d+,\d+\): error TS1360/);
  });

  it('лишний ключ верхнего уровня — ошибка TS1360 в generated/en.ts', (t) => {
    const root = makeTypedProject(
      t,
      `export default { title: 'Title', nested: { a: 'A' }, extra: 'E' };\n`,
    );
    const result = runTsc(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /generated[\\/]en\.ts\(\d+,\d+\): error TS1360/);
  });

  it('реестр репозитория актуален', () => {
    assert.equal(
      generateI18nDictionaries(repoRoot, { check: true }).upToDate,
      true,
    );
  });
});
