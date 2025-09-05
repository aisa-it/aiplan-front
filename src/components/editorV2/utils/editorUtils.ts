import { TextSelection } from '@tiptap/pm/state';
import { Editor } from '@tiptap/vue-3';
import { EventBus } from 'quasar';
import { bgColorMap, colorMap } from 'src/utils/editorColorMap';
import { Ref, inject } from 'vue';

const bus = inject('bus') as EventBus;

export const isEditorEmpty = (editor) => {
  if (!editor || typeof editor.childCount !== 'number') return true;

  if (editor.childCount === 0) return true;

  for (let i = 0; i < editor.childCount; i++) {
    const node = editor.child(i);
    if (node.type.name === 'paragraph') {
      const text = node.textContent.trim();
      if (text.length > 0) return false;
      if (node.content && node.content.childCount > 0) {
        for (let j = 0; j < node.content.childCount; j++) {
          const child = node.content.child(j);
          if (
            child.type.name !== 'text' ||
            child.textContent.trim().length > 0
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
