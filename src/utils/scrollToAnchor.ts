import { TextSelection } from '@tiptap/pm/state';
import type { Editor } from '@tiptap/vue-3';

// Высота липкой шапки: без отступа якорь уезжает ровно под неё.
// Значение унаследовано от навигации по оглавлению, где оно было захардкожено.
const SCROLL_OFFSET = 60;

// Сколько подсвечиваем найденную цель, чтобы глаз зацепился за место перехода.
const HIGHLIGHT_MS = 1600;
const HIGHLIGHT_CLASS = 'doc-anchor-target--active';

export interface ScrollToAnchorOptions {
  /** Ставить курсор в цель и забирать фокус в редактор. */
  focus?: boolean;
  /** Кратковременно подсветить место перехода. */
  highlight?: boolean;
  behavior?: ScrollBehavior;
}

const highlightTimers = new WeakMap<Element, number>();

/**
 * Элемент, с которым реально работаем: и скроллим к нему, и подсвечиваем.
 *
 * Явный якорь в режиме чтения — пустой inline-span нулевого размера: фон на
 * нём не проявится, да и скроллить к боксу нулевой площади браузеры умеют
 * по-разному. Поэтому поднимаемся к ближайшему предку с реальной геометрией
 * (обычно абзац), не выходя за пределы редактора. Заголовок и фишка якоря
 * в режиме правки свой размер имеют и годятся как есть.
 */
const resolveVisualTarget = (editor: Editor, element: Element): Element => {
  const root = editor.view.dom;
  let current: Element | null = element;

  while (current && current !== root) {
    const rect = current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return current;
    current = current.parentElement;
  }

  return element;
};

/**
 * Скроллит к элементу внутри редактора и (опционально) ставит туда курсор.
 * Общая точка для оглавления, якорей и переходов по хэшу в адресной строке.
 */
export const scrollToAnchorElement = (
  editor: Editor,
  element: Element,
  options: ScrollToAnchorOptions = {},
): void => {
  const { focus = false, highlight = false, behavior = 'smooth' } = options;

  if (focus) {
    try {
      const pos = editor.view.posAtDOM(element, 0);
      const tr = editor.view.state.tr;
      tr.setSelection(TextSelection.near(tr.doc.resolve(pos)));
      editor.view.dispatch(tr);
      editor.view.focus();
    } catch (e) {
      // Атомарные ноды и служебные обёртки не всегда мапятся в позицию
      // документа — прокрутить к ним всё равно можно, курсор не обязателен.
    }
  }

  const target = resolveVisualTarget(editor, element);

  // scrollIntoView, а НЕ window.scrollTo(rect.top + scrollY - offset).
  //
  // Ручной вариант (он же был в навигации по оглавлению) ломался в Firefox:
  //  1. Позиция считается в момент вызова. Сразу после загрузки документа
  //     страница ещё не набрала финальную высоту, и браузер зажимает цель по
  //     текущему максимуму прокрутки — переход молча превращается в ноль.
  //     Firefox зажимает жёстче, чем Chrome, отсюда «в хроме крутит, в лисе нет».
  //  2. Прокручивается только окно. Любой скролл-контейнер между целью
  //     и окном означал бы, что не крутится вообще нигде.
  // scrollIntoView считает позицию сам в момент прокрутки и двигает все
  // скроллируемые контейнеры по пути.
  //
  // Отступ под липкую шапку — через scroll-margin-top: это штатный механизм,
  // браузер вычитает его сам. Стиль не снимаем: он идемпотентный, а снятие
  // могло бы вмешаться в уже идущую плавную прокрутку.
  (target as HTMLElement).style.scrollMarginTop = `${SCROLL_OFFSET}px`;
  target.scrollIntoView({ block: 'start', inline: 'nearest', behavior });

  if (!highlight) return;

  const previous = highlightTimers.get(target);
  if (previous) window.clearTimeout(previous);

  target.classList.add(HIGHLIGHT_CLASS);
  highlightTimers.set(
    target,
    window.setTimeout(() => {
      target.classList.remove(HIGHLIGHT_CLASS);
      highlightTimers.delete(target);
    }, HIGHLIGHT_MS),
  );
};

/**
 * Ищет в DOM редактора цель по идентификатору якоря.
 * Порядок важен: явный якорь приоритетнее заголовка с тем же id.
 */
export const findAnchorElement = (
  editor: Editor,
  anchorId: string,
): Element | null => {
  if (!anchorId) return null;

  // Идентификатор приходит из пользовательского контента (и из адресной
  // строки), поэтому в селектор его пускаем только экранированным.
  const escaped =
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(anchorId)
      : anchorId.replace(/["\\]/g, '\\$&');

  return (
    editor.view.dom.querySelector(`[data-anchor-id="${escaped}"]`) ??
    editor.view.dom.querySelector(`#${escaped}`) ??
    // Оглавление до сих пор умеет ссылаться на служебный runtime-id
    // расширения table-of-contents — поддерживаем как запасной вариант.
    editor.view.dom.querySelector(`[data-toc-id="${escaped}"]`)
  );
};

// Сколько ждём появления цели в DOM, прежде чем считать ссылку битой.
const READY_TIMEOUT_MS = 3000;

/**
 * Повторяет попытку перехода, пока цель не появится в DOM.
 *
 * Одного nextTick не хватает, и число тиков угадывать бессмысленно:
 * `EditorTipTapV2` держит всё содержимое под `v-if="editorInstance"`, а сам
 * `editorInstance` появляется только в onMounted — то есть редактор рисуется
 * вторым кругом рендера. Поверх этого нодвью якорей монтируются отдельными
 * Vue-приложениями через VueNodeViewRenderer. Поэтому ждём кадрами до
 * появления цели, а не пытаемся попасть в нужный тик.
 *
 * Возвращает false по истечении таймаута — вызывающий решает, ругаться ли.
 */
export const scrollToAnchorWhenReady = (
  tryScroll: () => boolean,
  timeoutMs: number = READY_TIMEOUT_MS,
): Promise<boolean> =>
  new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;

    const tick = () => {
      let reached = false;
      try {
        reached = tryScroll() === true;
      } catch (e) {
        // Компонент мог не домонтироваться или уже уехать при быстрой
        // смене документа — просто пробуем на следующем кадре.
        reached = false;
      }

      if (reached) return resolve(true);
      if (Date.now() >= deadline) return resolve(false);

      window.requestAnimationFrame(tick);
    };

    tick();
  });

// Сколько удерживаем якорь в поле зрения, пока страница дозагружается.
const SETTLE_MS = 2000;

/**
 * Удерживает якорь в поле зрения, пока страница добирает высоту.
 *
 * Зачем: к моменту, когда цель появилась в DOM, страница ещё НЕ устоялась —
 * ниже догружаются вложения и комментарии, внутри документа догружаются
 * картинки. Пока страница короткая, браузеру просто некуда прокручивать:
 * `scrollIntoView` к якорю в конце документа зажимается текущим максимумом
 * прокрутки и даёт визуально ноль. Одного вызова поэтому мало — повторяем,
 * пока раскладка не устоится.
 *
 * Прерывается на первое же действие пользователя: если он начал листать
 * сам, дёргать страницу под ним нельзя.
 */
export const keepAnchorInView = (
  tryScroll: () => void,
  settleMs: number = SETTLE_MS,
): void => {
  const deadline = Date.now() + settleMs;
  const events = ['wheel', 'touchstart', 'keydown', 'mousedown'];
  let stopped = false;

  const stop = () => {
    stopped = true;
    events.forEach((name) => window.removeEventListener(name, stop));
  };

  events.forEach((name) =>
    window.addEventListener(name, stop, { passive: true }),
  );

  const tick = () => {
    if (stopped) return;

    tryScroll();

    if (Date.now() >= deadline) {
      stop();
      return;
    }

    window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(tick);
};

/**
 * Переход к якорю по идентификатору. Возвращает false, если цели нет —
 * вызывающий код решает, ругаться ли на битую ссылку.
 */
export const scrollToAnchorId = (
  editor: Editor | null | undefined,
  anchorId: string,
  options: ScrollToAnchorOptions = {},
): boolean => {
  if (!editor) return false;

  const element = findAnchorElement(editor, anchorId);
  if (!element) return false;

  scrollToAnchorElement(editor, element, options);
  return true;
};
