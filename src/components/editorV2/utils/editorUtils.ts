import { TextSelection } from '@tiptap/pm/state';
import { Editor } from '@tiptap/vue-3';
import { EventBus } from 'quasar';
import { bgColorMap, colorMap } from 'src/utils/editorColorMap';
import { Ref, inject } from 'vue';
import { DOMParser } from '@tiptap/pm/model';
import { convertFontSizeToPx } from 'src/utils/convertFontSizeToPx';

const bus = inject('bus') as EventBus;

export const isEditorEmpty = (editor) => {
  if (!editor || typeof editor.childCount !== 'number') return true;

  if (editor.childCount === 0) return true;

  for (let i = 0; i < editor.childCount; i++) {
    const node = editor.child(i);

    if (node.type.name === 'paragraph') {
      const text = node.textContent.replace(/\u200B/g, '').trim();
      if (text.length > 0) return false;
      if (node.content && node.content.childCount > 0) {
        for (let j = 0; j < node.content.childCount; j++) {
          const child = node.content.child(j);
          if (
            child.type.name !== 'text' ||
            child.textContent.replace(/\u200B/g, '').trim().length > 0
          ) {
            return false;
          }
        }
      }
      continue;
    }
    return false;
  }

  return true;
};

export const cleanContent = (content: string): string => {
  let cleanedContent = content;

  cleanedContent = cleanedContent.replace(/\n+(?=<p>)/g, '');
  cleanedContent = cleanedContent.replace(/\t+(?=<li>)/g, '');
  cleanedContent = cleanedContent.replace(/\n+(?=<tr>)/g, '');
  cleanedContent = cleanedContent.replace(/\n+(?=<th>)/g, '');
  cleanedContent = cleanedContent.replace(/\n+(?=<td>)/g, '');

  const onlyEmptyParagraphs =
    cleanedContent
      .replace(/<p>(\s|&nbsp;|<br>|<\/?span[^>]*>)*<\/p>/gi, '')
      .trim() === '';

  if (onlyEmptyParagraphs) {
    cleanedContent = '';
  }

  return cleanedContent;
};

export const getEditorProps = (editorInstance, onCommentLink) => ({
  handlePaste: (view, event, slice) => {
    const html = event.clipboardData?.getData('text/html');
    // Обработка и подстановка стилей текста из оригинальной таблицы
    if (html?.includes('<table')) {
      const temp = document.createElement('template');
      temp.innerHTML = html;
      const fragment = temp.content;

      // Парсинг классов из <style> (Excel)
      const classStyles: Record<string, CSSStyleDeclaration> = {};
      const styleElements = Array.from(fragment.querySelectorAll('style'));

      for (const styleEl of styleElements) {
        const cssText = styleEl.textContent || '';
        const tempStyle = document.createElement('style');
        tempStyle.textContent = cssText;
        document.head.appendChild(tempStyle);

        try {
          const sheet = tempStyle.sheet as CSSStyleSheet | null;
          if (sheet?.cssRules) {
            for (const rule of sheet.cssRules) {
              if (
                rule instanceof CSSStyleRule &&
                rule.selectorText.startsWith('.')
              ) {
                const className = rule.selectorText.slice(1).trim();
                classStyles[className] = rule.style;
              }
            }
          }
        } finally {
          document.head.removeChild(tempStyle);
        }
        styleEl.remove();
      }

      // Обработка всех элементов внутри таблицы
      const table = fragment.querySelector('table');
      if (!table) return false;

      const allElements = Array.from(table.querySelectorAll('*'));
      for (const el of allElements) {
        let targetFontSize: string | null = null;
        let targetFontWeight: string | null = null;
        let targetFontStyle: string | null = null;
        const tagName = el.tagName.toLowerCase();

        // Обработка классов Excel
        for (const cls of el.classList) {
          const styles = classStyles[cls];
          if (styles) {
            if (styles.fontSize && !targetFontSize) {
              targetFontSize = convertFontSizeToPx(styles.fontSize);
            }
            if (styles.fontWeight && !targetFontWeight) {
              targetFontWeight = styles.fontWeight;
            }
            if (styles.fontStyle && !targetFontStyle) {
              targetFontStyle = styles.fontStyle;
            }
          }
        }

        // Обработка инлайн стилей
        if (el.hasAttribute('style')) {
          const inlineStyle = el.getAttribute('style')!;
          const fontSizeMatch = inlineStyle.match(
            /font-size\s*:\s*([\d.]+)\s*(pt|px)\b/i,
          );
          if (fontSizeMatch && !targetFontSize) {
            const raw = `${fontSizeMatch[1]}${fontSizeMatch[2]}`;
            targetFontSize = convertFontSizeToPx(raw);
          }

          const fontWeightMatch = inlineStyle.match(
            /font-weight\s*:\s*(\w+|\d+)/i,
          );
          if (fontWeightMatch && !targetFontWeight) {
            targetFontWeight = fontWeightMatch[1];
          }

          const fontStyleMatch = inlineStyle.match(/font-style\s*:\s*(\w+)/i);
          if (fontStyleMatch && !targetFontStyle) {
            targetFontStyle = fontStyleMatch[1];
          }
        }

        // Обработка шрифтов формата <font size="...">
        if (tagName === 'font' && !targetFontSize) {
          const sizeAttr = el.getAttribute('size');
          if (sizeAttr) {
            const sizeNum = Number(sizeAttr);
            const ptMap: Record<number, number> = {
              1: 8,
              2: 10,
              3: 12,
              4: 14,
              5: 18,
              6: 24,
              7: 36,
            };
            const pt = ptMap[sizeNum] || 12;
            targetFontSize = `${Math.round((pt * 4) / 3)}px`;
          }
        }

        // Дефолтные стили для элементов в семантических тегах
        if (
          !targetFontWeight &&
          (el.matches('b, strong') || el.querySelector('b, strong'))
        ) {
          targetFontWeight = '700';
        }
        if (
          !targetFontStyle &&
          (el.matches('i, em') || el.querySelector('i, em'))
        ) {
          targetFontStyle = 'italic';
        }

        // Перенос стилей
        if (targetFontSize || targetFontWeight || targetFontStyle) {
          const wrapper = document.createElement('span');
          if (targetFontSize) wrapper.style.fontSize = targetFontSize;
          if (targetFontWeight) wrapper.style.fontWeight = targetFontWeight;
          if (targetFontStyle) wrapper.style.fontStyle = targetFontStyle;

          while (el.firstChild) {
            wrapper.appendChild(el.firstChild);
          }

          if (tagName === 'font') {
            el.replaceWith(wrapper);
          } else {
            el.appendChild(wrapper);
            // Чистка родительского style, чтобы избежать дублирования
            if (el.hasAttribute('style')) {
              let newStyle = el
                .getAttribute('style')!
                .replace(/font-size\s*:[^;]*;?/gi, '')
                .replace(/font-weight\s*:[^;]*;?/gi, '')
                .replace(/font-style\s*:[^;]*;?/gi, '')
                .replace(/;;/g, ';')
                .trim()
                .replace(/;$/, '');
              if (newStyle) {
                el.setAttribute('style', newStyle);
              } else {
                el.removeAttribute('style');
              }
            }
          }
        }
      }

      // Обход ячеек, простановка дефолтного размера шрифта
      fragment.querySelectorAll('td, th').forEach((cell) => {
        const hasFontSize = cell.querySelector('[style*="font-size"]');
        if (!hasFontSize) {
          const wrapper = document.createElement('span');
          wrapper.style.fontSize = '14px';
          while (cell.firstChild) {
            wrapper.appendChild(cell.firstChild);
          }
          cell.appendChild(wrapper);
        }
      });

      // Вставка таблицы
      table.classList.add('table-striped');
      event.preventDefault();
      const parser = DOMParser.fromSchema(editorInstance.value.schema);
      const nodes = parser.parse(table);
      editorInstance.value.view.dispatch(
        editorInstance.value.view.state.tr.replaceSelectionWith(nodes, false),
      );
      return true;
    }
    return false;
  },

  handleKeyDown(view, event) {
    const { state, dispatch } = view;
    const { from, to } = state.selection;

    if (event.key === 'Backspace' && from !== to) {
      dispatch(state.tr.deleteRange(from, to));
      event.preventDefault();
      return true;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      editorInstance.value.chain().focus().sinkListItem('listItem').run();
    }

    if (event.key === ' ' && editorInstance.value.isActive('link')) {
      editorInstance.value.chain().focus().unsetMark('link').run();
    }

    if (event.key === 'Enter') {
      const editor = editorInstance.value;

      // TODO Убрать как функции или подключить через composable

      function isCursorInsideSpoiler(): boolean {
        const { state } = editorInstance.value;
        const { $from } = state.selection;
        for (let depth = 0; depth < $from.depth; depth++) {
          const node = $from.node(depth);
          if (node.type.name === 'spoiler') {
            return true;
          }
        }
        return false;
      }

      function isLastEmptyParagraph(): boolean {
        const { state } = editorInstance.value;
        const { $from } = state.selection;
        const lastNode = $from.node($from.depth);

        console.log('Последний узел', lastNode);
        if (
          lastNode.type.name !== 'paragraph' ||
          lastNode.textContent.trim() !== ''
        ) {
          return false;
        }
        console.log('Проверка не прошла');

        // Проверка на последний параграф
        // return lastNode.type.name !== 'paragraph' ||
        //   lastNode.textContent.trim() !== ''
        //   ? false
        //   : true;
      }

      const clearSpoilerVars = (): void => {
        const { state } = editorInstance.value;
        const { $from } = state.selection;
        bus.emit(
          'focusSpoiler',
          $from.pos,
          { bgColor: '', textColor: '' },
          false,
          false,
        );
      };

      if (isCursorInsideSpoiler() && isLastEmptyParagraph()) {
        console.log('Enter внутри спойлера!');
        clearSpoilerVars();
      }

      if (editor.isActive('subscript')) {
        editor.chain().focus().unsetSubscript().run();
      }

      if (editor.isActive('superscript')) {
        editor.chain().focus().unsetSuperscript().run();
      }
    }

    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      return true;
    }

    return false;
  },
  handleClick(view, pos, event) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('special-link-mention')) {
      const {
        type,
        slug,
        commentId,
        originalUrl,
        projectIdentifier,
        currentIssueId,
        docId,
      } = target.dataset;
      const data: any = {
        type,
        slug,
        commentId,
        originalUrl,
        ...(type === 'issue' && {
          projectIdentifier,
          currentIssueId,
        }),
        ...(type === 'aidoc' && {
          docId,
        }),
      };
      if (target.classList.contains('comment-link')) {
        const pos = view.posAtDOM(target, 0);
        view.dispatch(
          view.state.tr.setSelection(
            TextSelection.near(view.state.doc.resolve(pos)),
          ),
        );
        onCommentLink(data);
      }

      return true;
    }

    return false;
  },
});

export function useHandleMouseUp(
  editorInstance: Ref<Editor | null>,
  isFormatSampleActive: Ref<boolean>,
) {
  const handler = () => {
    if (!editorInstance.value) return;

    if (isFormatSampleActive.value) {
      editorInstance.value.chain().focus().applySample().run();
    }

    isFormatSampleActive.value = false;
  };

  const addListener = () => {
    editorInstance.value?.view.dom.addEventListener('mouseup', handler);
  };

  const removeListener = () => {
    editorInstance.value?.view.dom.removeEventListener('mouseup', handler);
  };

  return {
    addMouseUpListener: addListener,
    removeMouseUpListener: removeListener,
  };
}

const findLogicalColor = (
  hex: string,
  isBg = false,
): keyof typeof colorMap | keyof typeof bgColorMap | null => {
  const map = isBg ? bgColorMap : colorMap;
  for (const key in map) {
    if (
      map[key as keyof typeof map].light.toLowerCase() === hex.toLowerCase() ||
      map[key as keyof typeof map].dark.toLowerCase() === hex.toLowerCase()
    ) {
      return key as keyof typeof map;
    }
  }
  return null;
};

export const replaceColor = (content: string, theme: string) => {
  let replaceContent = content;
  replaceContent = replaceContent.replace(
    /(color|background-color)\s*:\s*(#[0-9A-Fa-f]{6,8})/g,
    (match, prop, hex) => {
      const isBg = prop === 'background-color';
      let baseHex = hex;
      let alpha = '';
      if (hex.length === 9) {
        baseHex = hex.slice(0, 7);
        alpha = hex.slice(7, 9);
      }
      const logicalColor = findLogicalColor(baseHex, isBg);
      if (!logicalColor) return match;

      const map = isBg ? bgColorMap : colorMap;
      let newHex = map[logicalColor][theme];
      if (alpha) {
        newHex = newHex.replace('#', '');
        return `${prop}: #${newHex}${alpha}`;
      }
      return `${prop}: ${newHex}`;
    },
  );
  replaceContent = replaceContent.replace(
    /(data-color)="(#[0-9A-Fa-f]{6})"/g,
    (match, attr, hex) => {
      const logicalColor = findLogicalColor(hex, true);
      if (!logicalColor) return match;

      const newHex = bgColorMap[logicalColor][theme];
      return `${attr}="${newHex}"`;
    },
  );

  replaceContent = replaceContent.replace(
    /(data-icon-color)="(#[0-9A-Fa-f]{6})"/g,
    (match, attr, hex) => {
      const logicalColor = findLogicalColor(hex, false);
      if (!logicalColor) return match;

      const newHex = colorMap[logicalColor][theme];
      return `${attr}="${newHex}"`;
    },
  );

  return replaceContent;
};

// Генерация 8 значаного hex для спойлера
export function hexWithOpacity(hex: string, opacity: number): string {
  if (hex === '') return '';
  hex = hex.replace('#', '');

  const alpha = Math.round(opacity * 255);
  const alphaHex = alpha.toString(16).padStart(2, '0').toUpperCase();

  return `#${hex.toUpperCase()}${alphaHex}`;
}

// Получение прозрачности из hex
export function getOpacityFromHex(hex: string): number {
  hex = hex.replace('#', '');
  switch (hex.length) {
    case 4: {
      const a = hex[3];
      return Math.round((parseInt(a + a, 16) / 255) * 100) / 100;
    }
    case 8: {
      const a = hex.slice(6, 8);
      return Math.round((parseInt(a, 16) / 255) * 100) / 100;
    }
    default:
      return 0.2;
  }
}
