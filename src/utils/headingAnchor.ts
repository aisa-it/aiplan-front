import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorState, Transaction } from '@tiptap/pm/state';
import {
  collectAnchorIds,
  isValidAnchorSlug,
  makeUniqueSlug,
} from 'src/utils/anchorSlug';

const HEADING_TYPE = 'heading';

const headingAnchorPluginKey = new PluginKey('headingAnchor');

interface PendingHeadingId {
  pos: number;
  attrs: Record<string, unknown>;
}

/**
 * Собирает транзакцию, проставляющую id заголовкам, у которых его ещё нет.
 * Возвращает null, если проставлять нечего — тогда вызывающий ничего не шлёт
 * и цикл транзакций гарантированно обрывается.
 *
 * skipSelectedHeading — не трогать заголовок под курсором (пользователь
 * прямо сейчас печатает его текст, слаг брать рано).
 */
const buildHeadingIdTransaction = (
  state: EditorState,
  skipSelectedHeading: boolean,
): Transaction | null => {
  const { from, to } = state.selection;

  // Первый проход — только сбор кандидатов. Полный обход документа ради
  // занятых id делаем лишь тогда, когда назначать действительно есть кому:
  // на каждое нажатие клавиши это лишняя работа.
  const candidates: { pos: number; text: string }[] = [];

  state.doc.descendants((node, pos) => {
    if (node.type.name !== HEADING_TYPE) return true;

    // Якорь уже есть — он заморожен, переименование его не трогает.
    if (node.attrs.anchorId) return false;

    const text = node.textContent.trim();
    if (!text) return false;

    if (skipSelectedHeading && from <= pos + node.nodeSize && to >= pos) {
      return false;
    }

    candidates.push({ pos, text });
    return false;
  });

  if (!candidates.length) return null;

  const taken = collectAnchorIds(state.doc);
  const updates: PendingHeadingId[] = [];

  for (const candidate of candidates) {
    const node = state.doc.nodeAt(candidate.pos);
    if (!node) continue;

    const anchorId = makeUniqueSlug(candidate.text, taken);

    // Множество занятых пополняем по ходу: иначе два одинаковых заголовка
    // в одной транзакции получили бы один и тот же слаг.
    taken.add(anchorId);
    updates.push({ pos: candidate.pos, attrs: { ...node.attrs, anchorId } });
  }

  if (!updates.length) return null;

  const tr = state.tr;
  for (const update of updates) {
    // setNodeMarkup меняет только атрибуты, размер ноды не меняется —
    // позиции, собранные по одному обходу, остаются валидными для всех правок.
    tr.setNodeMarkup(update.pos, undefined, update.attrs);
  }

  // Служебная простановка id не должна откатываться по Ctrl+Z.
  tr.setMeta('addToHistory', false);

  return tr;
};

/**
 * Постоянные якоря заголовков:
 * `<h2 data-anchor-id="vvedenie">Введение</h2>`.
 *
 * Это именно Extension, а не своя нода: атрибут добавляется к уже
 * существующему `heading` из StarterKit через addGlobalAttributes — тем же
 * приёмом, что и `textAlign` у TextAlign. Так не приходится отключать
 * heading в StarterKit и тащить транзитивный `@tiptap/extension-heading`.
 *
 * Правила простановки (сердце фичи, менять с осторожностью):
 *  - слаг назначается ОДИН РАЗ и дальше заморожен. Переименование заголовка
 *    его не меняет, иначе все ранее разосланные ссылки протухнут;
 *  - не назначается заголовку, в котором сейчас стоит курсор: иначе
 *    первая набранная буква «В» навсегда заморозила бы слаг `v`;
 *  - не назначается пустому заголовку;
 *  - уникальность — в пределах документа и в общем пространстве имён
 *    с явными якорями (см. collectAnchorIds).
 */
export const HeadingWithAnchor = Extension.create({
  name: 'headingAnchor',

  addGlobalAttributes() {
    return [
      {
        types: [HEADING_TYPE],
        attributes: {
          // ВНИМАНИЕ: это data-anchor-id, а НЕ id.
          //
          // Атрибут `id` на заголовках уже занят расширением
          // @tiptap/extension-table-of-contents: оно объявляет свой глобальный
          // `id` (dist/index.js:226) и пишет туда UUID, равный data-toc-id.
          // Два расширения за один атрибут — оглавление выигрывает, слаги
          // не доживают, а его UUID ещё и не переживает сохранение
          // (data-toc-id не в whitelist санитайзера) и генерируется заново
          // при каждой загрузке. Ссылки на заголовки от этого протухали
          // сразу же. Поэтому у нас свой атрибут, как у явных якорей.
          anchorId: {
            default: null,
            parseHTML: (element) => {
              const id = element.getAttribute('data-anchor-id');

              // Чужой слаг (вставка из внешнего HTML) не забираем: он не
              // переживёт санитайзер бэкенда. Заголовок останется без якоря,
              // и плагин ниже выдаст ему свой.
              return isValidAnchorSlug(id) ? id : null;
            },
            renderHTML: (attributes) => {
              if (!attributes.anchorId) return {};
              return { 'data-anchor-id': attributes.anchorId };
            },
          },
        },
      },
    ];
  },

  /**
   * Первичная простановка id при открытии документа.
   *
   * ОБЯЗАТЕЛЬНА и не дублирует плагин ниже: `new Editor({ content })` строит
   * документ напрямую из HTML, НЕ дispatch'а ни одной транзакции, поэтому
   * appendTransaction при загрузке не вызывается вовсе. Без этого хука
   * documents, которые ещё ни разу не пересохраняли, открывались с
   * заголовками без id — ссылки на них не находили цель и молча не работали.
   */
  onCreate() {
    const { state, view } = this.editor;
    const tr = buildHeadingIdTransaction(state, false);
    if (tr) view.dispatch(tr);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: headingAnchorPluginKey,

        appendTransaction: (transactions, oldState, newState) => {
          const docChanged = transactions.some(
            (transaction) => transaction.docChanged,
          );
          const selectionMoved = !oldState.selection.eq(newState.selection);

          // Ни текст, ни курсор не двигались — делать нечего.
          if (!docChanged && !selectionMoved) return null;

          // Заголовок под курсором пропускаем только пока пользователь
          // реально печатает. Если редактор не в фокусе, текст заголовка уже
          // окончательный — ждать нечего, id можно замораживать сразу.
          const editor = this.editor;
          const skipSelectedHeading = Boolean(
            editor?.isEditable && editor?.isFocused,
          );

          return buildHeadingIdTransaction(newState, skipSelectedHeading);
        },
      }),
    ];
  },
});
