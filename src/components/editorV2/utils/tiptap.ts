// core
import tippy from 'tippy.js';
import { v4 as uuidv4 } from 'uuid';
import { Extension, mergeAttributes, Node, nodeInputRule } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Editor, VueNodeViewRenderer, VueRenderer } from '@tiptap/vue-3';
import { all, createLowlight } from 'lowlight';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import { Link } from '@tiptap/extension-link';
import { TextSelection } from 'prosemirror-state';
import TaskItem from '@tiptap/extension-task-item';
import ListItem from '@tiptap/extension-list-item';
import { Mention } from '@tiptap/extension-mention';
import Indent from '@weiruo/tiptap-extension-indent';
import ResizeImage from 'tiptap-extension-resize-image';
import { Underline } from '@tiptap/extension-underline';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { inputRegex } from '@tiptap/extension-image';

// utils
import { ICONS } from '../../../utils/icons';
import { parseCommentLink, parseIssueLink } from '../../../utils/links';
// components
import EditorTaskItem from '../components/EditorTaskItem.vue';
import EditorListItem from '../components/EditorListItem.vue';
import EditorMentionList from '../components/EditorMentionList.vue';
import EditorResizeImageWrapper from '../components/EditorResizeImageWrapper.vue';
import EditorTiptapCodeBlockSelect from '../components/EditorTiptapCodeBlockSelect.vue';

// store
import { useNotificationStore } from 'src/stores/notification-store';
import { ERROR_FORMAT_FILE } from 'src/constants/notifications';
import { bgColorMap, colorMap } from '../../../utils/editorColorMap';
import { isValidURL } from '../../../utils/validation';
import { EditorView } from '@tiptap/pm/view';

import { DtoProjectMemberLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// список размерности шрифта
export const ListSize: Array<string> = [
  '10px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '22px',
  '24px',
  '26px',
  '28px',
  '30px',
  '32px',
  '34px',
  '36px',
];

const emojis = [
  '128578', // смайл
  '128577', // грустный смайл
  '128523', // смайл с языком
  '128513', // смайл с зубами
  '128521', // подмигивающий
  '128077', // палец вверх
  '128078', // палец вниз
  '0x2705', // выполнено зеленый
  '0x274C', // крест красный
  '128161', // лампочка
  'ℹ️',
  '⚠️',
  '10067', // вопрос красный
  '10071', // восклицательный знак красный
  '128681', // флаг красный
  '128270', // лупа
  '0x2B50', // звезда
  '128276', // колокол
  '128277', // зачеркнутый колокол
  '128343', // часы
];
const { setNotificationView } = useNotificationStore();

function filterValidMembers(list: DtoProjectMemberLight[]) {
  return list.filter((m) => m.member?.is_active && m.member?.username);
}

export const emojiList = emojis.map((code) => {
  let icon = code;
  if (parseInt(code)) {
    icon = String.fromCodePoint(parseInt(code));
  }

  return icon;
});

// выравнивание текста
export const ListAlign: Array<object> = [
  {
    value: 'left',
    icon: ICONS.paragraphLeftIcon,
    tooltip: 'Выровнять по левому краю',
  },
  {
    value: 'center',
    icon: ICONS.paragraphCenterIcon,
    tooltip: 'Выровнять по центру',
  },
  {
    value: 'right',
    icon: ICONS.paragraphRightIcon,
    tooltip: 'Выровнять по правому краю',
  },
  {
    value: 'justify',
    icon: ICONS.paragraphWidthIcon,
    tooltip: 'Выровнять по ширине',
  },
];

// список заголовков и прочее
export const ListHeading: Array<object> = [
  {
    value: 0,
    label: 'Абзац',
  },
  {
    value: 1,
    label: 'Заголовок 1',
  },
  {
    value: 2,
    label: 'Заголовок 2',
  },
  {
    value: 3,
    label: 'Заголовок 3',
  },
  {
    value: 4,
    label: 'Заголовок 4',
  },
  {
    value: 5,
    label: 'Заголовок 5',
  },
  {
    value: 6,
    label: 'Заголовок 6',
  },
];

// список шрифтов
export const ListFont: Array<string> = ['sans-serif', 'serif', 'monospace'];

export const notSupportableFormat = ['tif', 'tiff', 'heic'];

export const processImageFile = (image, schema, callback) => {
  if (notSupportableFormat.includes(image.type.split('/')[1])) {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: ERROR_FORMAT_FILE,
    });
    return;
  }
  const reader = new FileReader();

  reader.onload = (readerEvent) => {
    const node = schema.nodes.image.create({
      src: readerEvent.target?.result,
      alt: image.name.replace(/\.[^/.]+$/, ''),
    });
    callback(node);
  };

  reader.readAsDataURL(image);
};

// Расширение ResizeImage
export const CustomImagePlugin = ResizeImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: 'height: auto;',
        parseHTML: (element) => {
          return element.style.cssText;
        },
      },
      draggable: {
        default: true,
      },
    };
  },

  renderText() {
    return '🖼';
  },

  addNodeView() {
    return VueNodeViewRenderer(EditorResizeImageWrapper);
  },

  addOptions() {
    return {
      ...this.parent?.(),
      validate: (file) => {
        return file.type.split('/')[0] === 'image';
      },
      onError: () => {
        setNotificationView({
          open: true,
          type: 'error',
          customMessage: ERROR_FORMAT_FILE,
        });
      },
    };
  },

  addProseMirrorPlugins() {
    const validate = this.options.validate;
    const onError = this.options.onError;
    let isImage = false;
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            dragstart() {
              isImage = true;
            },
            drop(view, event) {
              if (isImage) {
                isImage = false;
                return;
              }

              const hasFiles =
                event.dataTransfer &&
                event.dataTransfer.files &&
                event.dataTransfer.files.length;

              if (!hasFiles) {
                return;
              }

              const images = Array.from(event.dataTransfer.files).filter(
                (file) => /image/i.test(file.type),
              );

              if (
                images.length === 0 ||
                images.some((image) => !validate(image))
              ) {
                event.preventDefault();
                onError();
                return;
              }

              event.preventDefault();

              const pos = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              })?.pos;

              if (!pos) {
                return;
              }

              images.forEach((image) => {
                processImageFile(image, view.state.schema, (node) => {
                  view.dispatch(view.state.tr.insert(pos, node));
                });
              });
              isImage = false;
            },
            paste(view, event) {
              const hasFiles =
                event.clipboardData &&
                event.clipboardData.files &&
                event.clipboardData.files.length;

              if (hasFiles) {
                const images = Array.from(event.clipboardData.files).filter(
                  (file) => /image/i.test(file.type),
                );

                if (images.length === 0) {
                  return;
                }

                event.preventDefault();

                const { schema } = view.state;

                images.forEach((image) => {
                  processImageFile(image, schema, (node) => {
                    const transaction =
                      view.state.tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                  });
                });
              }
            },
          },
        },
      }),
    ];
  },
});

// Расширение Indent
export const IndentExtend = Indent.extend({
  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { from, $from } = this.editor.state.selection;
        const { parent } = $from;
        // Проверяем, что курсор находится в начале текста и есть отступ
        if (from === $from.start() && parent.attrs.indent) {
          // Убираем отступ
          return this.editor.commands.outdent();
        } else {
          // стандартное поведение
          return this.editor.commands.deleteSelection();
        }
      },
    };
  },
});

// расширение для клавиатуры
export const CustomKeyboardBehaviour = Extension.create({
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.isActive('listItem')) {
          return false;
        }
        this.editor.commands.insertContent('\t');
        return true;
      },
      'Shift-Tab': () => {
        const { state, dispatch } = this.editor.view;
        const { from } = state.selection;
        const $from = state.doc.resolve(from);

        if ($from.parentOffset < 2) {
          return false;
        }

        const start = from - 1;
        const end = from;

        const text = state.doc.textBetween(start, end);

        if (text === '\t') {
          dispatch(state.tr.delete(start, end));
          return true;
        }

        return false;
      },
      ['Home']: () => {
        this.editor.commands.selectTextblockStart();
        return true;
      },
      ['End']: () => {
        this.editor.commands.selectTextblockEnd();
        return true;
      },
    };
  },
});

export const DisableImagesExtension = Extension.create({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop(view, event) {
              const text = event.dataTransfer?.getData('text/plain');
              if (!text) {
                setNotificationView({
                  open: true,
                  type: 'error',
                  customMessage: ERROR_FORMAT_FILE,
                });
                event.preventDefault();
                return false;
              }
              return true;
            },
            paste(view, event) {
              const text = event.clipboardData?.getData('text/plain');
              if (!text) {
                setNotificationView({
                  open: true,
                  type: 'error',
                  customMessage: ERROR_FORMAT_FILE,
                });
                event.preventDefault();
                return false;
              }
              return true;
            },
          },
        },
      }),
    ];
  },
});

// расширение для более корректного перемещение курсора в нутри редактора при нажатии pageUp|pageDown
export const StopPageScrollExtension = Extension.create({
  name: 'stopPageScroll',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleKeyDown(view, event) {
            if (event.key === 'PageUp' || event.key === 'PageDown') {
              event.preventDefault();
              event.stopPropagation();

              const { state, dispatch } = view;
              const { selection, doc } = state;
              const editorHeight = view.dom.clientHeight / 4;
              let pos;
              if (event.key === 'PageUp') {
                // Прокрутка вверх
                pos = Math.max(
                  Math.floor(selection.$head.pos - editorHeight),
                  0,
                );
                if (pos < 0) pos = 0;
              } else {
                // Прокрутка вниз
                pos = Math.min(
                  Math.ceil(selection.$head.pos + editorHeight),
                  doc.content.size,
                );
              }

              const newSelection = TextSelection.create(doc, pos);

              dispatch(state.tr.setSelection(newSelection).scrollIntoView());
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});

interface Base64Images {
  src: string;
  alt: string;
}

const base64ToFiles = async (base64Images: Array<Base64Images>) => {
  return Promise.all(
    base64Images.map(async (base64: Base64Images, index: number) => {
      const mimeMatch = base64.src.match(/^data:(.+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const response = await fetch(base64.src);
      const blob = await response.blob();

      const customName = uuidv4() + '-' + index;

      return new File([blob], customName, { type: mimeType });
    }),
  );
};

/**
 * Обработчик контента Editor, для обработки изображений base64
 * @param value контент Editor, из метода getHtml() или из v-model
 */
export const handleEditorValue = async (value: string | undefined | null) => {
  if (!value) return { html: value, files: [] };

  const base64ImageRegex =
    /<img src="(data:image\/[a-zA-Z+-]*;base64,[^\"]*)"[^>]*>/g;
  const imagesBase64: Array<Base64Images> = [];

  let newValue = value;

  let imgMatch;
  while ((imgMatch = base64ImageRegex.exec(newValue))) {
    const isImgAltMatch = imgMatch[0].match(/alt="([^"]+)"/);
    const imgAlt =
      isImgAltMatch && isImgAltMatch[1] ? isImgAltMatch[1] : 'Изображение';
    imagesBase64.push({ src: imgMatch[1], alt: imgAlt });
  }

  const files = await base64ToFiles(imagesBase64);
  const imageFiles = [...files];
  newValue = newValue.replace(base64ImageRegex, (match, p1) => {
    const image = imageFiles.shift(); // Получаем и удаляем первый объект из массива
    return match.replace(p1, `/api/file/${image.name}`); // Заменяем base64 на кастомное имя
  });

  return { html: newValue, files: files };
};

// для пингов

export interface ContentMention {
  avatar?: string;
  username?: string;
  email?: string;
  avatarText?: string;
  title?: string;
}
export const useMention = (
  members: Array<DtoProjectMemberLight> | undefined,
  getMembers?: (search: string) => Promise<Array<DtoProjectMemberLight> | void>,
) => {
  const suggestion = {
    items: async ({ query }) => {
      let items: Array<DtoProjectMemberLight> = [];

      if (getMembers) {
        try {
          const result = await getMembers(query);

          if (result) {
            items = filterValidMembers([...result]);
          }
        } catch (error) {
          console.error('Error fetching members:', error);
        }
      }

      return items;
    },

    render: () => {
      let component: VueRenderer;
      let popup: any;

      return {
        onStart: (props: any) => {
          component = new VueRenderer(EditorMentionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) {
            return;
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => props.editor.view.dom.offsetParent,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },

        onUpdate(props: any) {
          component.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          });

          if (!popup[0].state.isVisible || !popup[0].state.isShown) {
            popup[0].show();
          }
        },

        onKeyDown(props: any) {
          if (props.event.key === 'Escape') {
            popup[0].hide();

            return true;
          }

          if (!popup[0].state.isVisible || !popup[0].state.isShown) {
            popup[0].show();
          }

          return component?.ref?.onKeyDown(props);
        },

        onExit() {
          popup[0].destroy();
          component.destroy();
        },
      };
    },
  };

  const mention = Mention.configure({
    HTMLAttributes: {
      class: 'mention',
    },
    suggestion,
    renderText({ options, node }) {
      const userName = members?.find(
        (u) =>
          u.member.id === node.attrs.id || u.member.email === node.attrs.label,
      );

      return `${options.suggestion.char}${
        userName?.member?.username ?? node.attrs.id
      }`;
    },
    renderHTML({ options, node }) {
      const userName = members?.find(
        (u) =>
          u.member.id === node.attrs.id || u.member.email === node.attrs.label,
      );

      return [
        'span',
        mergeAttributes(this.HTMLAttributes, options.HTMLAttributes),
        `${options.suggestion.char}${
          userName?.member.username ?? node.attrs.id
        }`,
      ];
    },
  });

  return { mention };
};

// форматирование по образцу
export const useEditorMarks = () => {
  const FormatSample = Extension.create({
    name: 'formatSample',
    addOptions() {
      return {
        storedMarks: [],
      };
    },
    addCommands() {
      return {
        storeSample:
          () =>
          ({ editor }) => {
            // Получаем маркеры для текста после позиции курсора
            this.options.storedMarks = getMarksAfterPos(editor) || [];
            return true;
          },
        clearSample: () => () => {
          this.options.storedMarks = [];
          return true;
        },
        applySample:
          () =>
          ({ commands, state }) => {
            const { from, to, empty } = state.selection;

            if (empty) {
              // Если выделение пустое, применить форматирование к слову
              const wordRange = getWordRange(state, from);
              if (wordRange) {
                if (!this.options.storedMarks.length) {
                  commands.setTextSelection(wordRange);
                  commands.unsetAllMarks();
                  commands.setTextSelection({ from: from, to: to });
                  return true;
                }

                this.options.storedMarks.forEach((mark) => {
                  commands.setTextSelection(wordRange);
                  commands.setMark(mark.type.name, mark.attrs);
                  commands.setTextSelection({ from: from, to: to });
                });
              }
            } else {
              commands.unsetAllMarks();

              this.options.storedMarks.forEach((mark) => {
                commands.setMark(mark.type.name, mark.attrs);
              });
            }

            commands.clearSample();
          },
      };
    },
  });

  function getMarksAfterPos(editor: Editor) {
    const { $from } = editor.state.selection;
    let marks = $from.marks();
    const nodesMarks = [];

    if (!editor.state.selection.empty) {
      editor.state.doc.nodesBetween(
        $from.pos,
        editor.state.doc.nodeSize - 2,
        (node) => {
          if (node.isText) {
            nodesMarks.push(node.marks);
          }
        },
      );
    }

    if (nodesMarks.length) {
      marks = nodesMarks[0] ?? [];
    }

    return marks;
  }

  // получение диапозона слова
  function getWordRange(state, pos) {
    const { doc } = state;
    const $pos = doc.resolve(pos);

    // Получаем блок, содержащий текст на позиции курсора
    const node = $pos.parent;
    const text = node.textContent;
    const isWordChar = (char: string) => /\w/.test(char);

    let end = $pos.parentOffset;
    let start = $pos.parentOffset;

    // Определяем начало слова
    while (start > 0 && isWordChar(text[start - 1])) {
      start -= 1;
    }

    // Определяем конец слова
    while (end < text.length && isWordChar(text[end])) {
      end += 1;
    }

    const from = $pos.start() + start;
    const to = $pos.start() + end;

    return { from, to };
  }

  return {
    FormatSample,
    getMarksAfterPos,
  };
};

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

export const cleanContent = (
  content: string,
  theme: 'light' | 'dark',
): string => {
  let cleanedContent = content;
  cleanedContent = cleanedContent.replace(/\n+(?=<p>)/g, '');
  cleanedContent = cleanedContent.replace(/\t+(?=<li>)/g, '');
  cleanedContent = cleanedContent.replace(/\n+(?=<tr>)/g, '');
  cleanedContent = cleanedContent.replace(/\n+(?=<th>)/g, '');
  cleanedContent = cleanedContent.replace(/\n+(?=<td>)/g, '');

  cleanedContent = cleanedContent.replace(
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
  cleanedContent = cleanedContent.replace(
    /(data-color)="(#[0-9A-Fa-f]{6})"/g,
    (match, attr, hex) => {
      const logicalColor = findLogicalColor(hex, true);
      if (!logicalColor) return match;

      const newHex = bgColorMap[logicalColor][theme];
      return `${attr}="${newHex}"`;
    },
  );

  // Обработка data-icon-color аналогично data-color
  cleanedContent = cleanedContent.replace(
    /(data-icon-color)="(#[0-9A-Fa-f]{6})"/g,
    (match, attr, hex) => {
      const logicalColor = findLogicalColor(hex, false);
      if (!logicalColor) return match;

      const newHex = colorMap[logicalColor][theme];
      return `${attr}="${newHex}"`;
    },
  );

  return cleanedContent;
};

// Расширение underline
export const CustomUnderline = Underline.extend({
  parseHTML() {
    return [...this.parent?.(), { tag: 'ins' }];
  },
});

export const CustomLink = Link.extend({
  addProseMirrorPlugins() {
    const { options } = this;
    return [
      ...this.parent?.(),
      new Plugin({
        view() {
          return {
            update: (view, prevState) => {
              const { state, dispatch } = view;

              if (state.doc.toJSON() !== prevState.doc.toJSON()) {
                const tr = state.tr;
                const { empty } = state.selection;

                if (
                  empty &&
                  state.storedMarks &&
                  state.storedMarks.some((mark) => mark.type.name === 'link')
                ) {
                  tr.removeStoredMark(state.schema.marks.link);
                  dispatch(tr);
                }
              }
            },
          };
        },
        props: {
          handleDOMEvents: {
            paste(view, event) {
              const { state, dispatch } = view;
              const { from, to } = state.selection;

              const text = event.clipboardData?.getData('text/plain');

              const parsedCommentLink = parseCommentLink(text);
              const parsedIssueLink = parseIssueLink(text);
              if (parsedCommentLink) {
                event.preventDefault();
                const node =
                  state.schema.nodes.commentLinkMention?.create(
                    parsedCommentLink,
                  );
                if (node) {
                  const tr = state.tr.replaceSelectionWith(node);
                  dispatch(tr);
                  return true;
                }
              }
              if (parsedIssueLink) {
                event.preventDefault();
                const node =
                  state.schema.nodes.issueLinkMention?.create(parsedIssueLink);
                if (node) {
                  const tr = state.tr.replaceSelectionWith(node);
                  dispatch(tr);
                  return true;
                }
              }
              if (isValidURL(text)) {
                event.preventDefault();

                // Если текст выделен, то добавляем ссылку
                if (from !== to) {
                  const tr = state.tr.addMark(
                    from,
                    to,
                    state.schema.marks.link.create({ href: text }),
                  );
                  dispatch(tr);
                } else {
                  // Вставляем ссылку как обычно
                  const tr = state.tr.insertText(text, from, to);
                  tr.addMark(
                    from,
                    from + text.length,
                    state.schema.marks.link.create({ href: text }),
                  );
                  dispatch(tr);
                }

                return true;
              }

              return false;
            },
          },
        },
      }),
    ];
  },
});

// для подсветки синтаксиса
const lowlight = createLowlight(all);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('js', js);
lowlight.register('ts', ts);

export const CodeBlockLowlightExtend = CodeBlockLowlight.extend({
  addNodeView() {
    return VueNodeViewRenderer(EditorTiptapCodeBlockSelect);
  },
}).configure({
  lowlight,
});

// расширение для списков с чекбоксом
export const TaskItemExtend = TaskItem.extend({
  addNodeView() {
    return VueNodeViewRenderer(EditorTaskItem);
  },
});

// расширение списков
export const ListItemExtend = ListItem.extend({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('resetTextAlignInListItems'),
        appendTransaction: (transactions, oldState, newState) => {
          let tr = newState.tr;
          let modified = false;

          newState.doc.descendants((node, pos) => {
            if (node.type.name === 'listItem') {
              node.descendants((child, childPos) => {
                if (
                  child.type.name === 'paragraph' &&
                  child.attrs.textAlign !== 'left'
                ) {
                  // Сбрасываем выравнивание для параграфов внутри listItem
                  tr = tr.setNodeMarkup(pos + childPos + 1, undefined, {
                    ...child.attrs,
                    textAlign: 'left', // Сбрасываем на "left" или другое значение
                  });
                  modified = true;
                }
              });
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
  addNodeView() {
    return VueNodeViewRenderer(EditorListItem);
  },
});

// проверка редактора на пустоту
export const isEditorEmpty = (editor?: Editor) => {
  let isEmpty = true;
  if (!editor) {
    return isEmpty;
  }

  const { doc } = editor?.state;
  doc.descendants((node) => {
    if (
      node.content.size > 0 ||
      node.type.name === 'commentLinkMention' ||
      node.type.name === 'issueLinkMention'
    ) {
      isEmpty = false;
    }
  });
  if (doc?.childCount === 0) {
    return isEmpty;
  }

  for (let i = 0; i < doc.childCount; i++) {
    const node = doc.child(i);

    if (node.isTextblock) {
      const textContent = editor.getText().trim();

      if (textContent.length > 0) {
        isEmpty = false;
        break;
      }
    } else if (node.content.size > 0) {
      isEmpty = false;
      break;
    }
  }

  return isEmpty;
};

export const ExitTableGapCursor = Extension.create({
  name: 'exitTableGapCursor',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('exitTableGapCursor'),

        props: {
          handleClick(view: EditorView, pos: number): boolean {
            return insertParagraphAroundTable(view, pos);
          },

          handleDOMEvents: {
            keydown(view: EditorView, event: KeyboardEvent): boolean {
              const arrowKeys = [
                'ArrowUp',
                'ArrowDown',
                'ArrowLeft',
                'ArrowRight',
              ];

              if (!arrowKeys.includes(event.key)) return false;

              setTimeout(() => {
                const pos = view.state.selection.from;
                insertParagraphAroundTable(view, pos);
              }, 0);

              return false;
            },
          },
        },
      }),
    ];
  },
});

function insertParagraphAroundTable(view: EditorView, pos: number): boolean {
  const { state, dispatch } = view;
  const { doc, schema } = state;
  const resolvedPos = doc.resolve(pos);

  const nodeBefore = resolvedPos.nodeBefore;
  const nodeAfter = resolvedPos.nodeAfter;

  const isGapLikePosition =
    (!nodeBefore || nodeBefore.isBlock) && (!nodeAfter || nodeAfter.isBlock);

  if (!isGapLikePosition) return false;

  const isTableBefore = nodeBefore?.type.name === 'table';
  const isTableAfter = nodeAfter?.type.name === 'table';

  if (!isTableBefore && !isTableAfter) return false;

  const isParagraphBefore = nodeBefore?.type.name === 'paragraph';
  const isParagraphAfter = nodeAfter?.type.name === 'paragraph';

  if (
    (isTableBefore && isParagraphAfter) ||
    (isTableAfter && isParagraphBefore)
  ) {
    return false;
  }

  const paragraph = schema.nodes.paragraph.create();

  const insertPos = Math.min(doc.content.size, isTableAfter ? pos : pos + 1);

  if (insertPos < 0 || insertPos > doc.content.size) return false;

  let tr = state.tr.insert(insertPos, paragraph);
  tr = tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos), 1));

  dispatch(tr);
  return true;
}

export const SpecialMentionHandler = Extension.create({
  name: 'specialMentionHandler',

  addOptions() {
    return {
      onCommentLink: (_data: any) => void 0,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleClick: (view, pos, event) => {
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

              const data = {
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
                this.options.onCommentLink(data);
              }
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});

export const BackspaceSelectionDelete = Extension.create({
  name: 'backspaceSelectionDelete',

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { from, to } = editor.state.selection;
        if (from !== to) {
          editor.commands.command(({ tr, dispatch }) => {
            dispatch?.(tr.deleteRange(from, to));
            return true;
          });
          return true;
        }
        return false;
      },
    };
  },
});

export const TabListSink = Extension.create({
  name: 'tabListSink',

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        return editor.commands.command(() => {
          editor.chain().focus().sinkListItem('listItem').run();
          return true;
        });
      },
    };
  },
});

export const UnlinkOnSpace = Extension.create({
  name: 'unlinkOnSpace',

  addKeyboardShortcuts() {
    return {
      ' ': ({ editor }) => {
        if (editor.isActive('link')) {
          editor.chain().focus().unsetMark('link').run();
          return true;
        }
        return false;
      },
    };
  },
});

export const UnsetSubSuperOnEnter = Extension.create({
  name: 'unsetSubSuperOnEnter',

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (editor.isActive('subscript')) {
          editor.chain().focus().unsetSubscript().run();
          return true;
        }
        if (editor.isActive('superscript')) {
          editor.chain().focus().unsetSuperscript().run();
          return true;
        }
        return false;
      },
    };
  },
});

//плагин из @rcode-link/tiptap-drawio
const baseImage =
  'data:image/png;base64,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';

const url =
  'https://embed.diagrams.net/?embed=1&ui=atlas&spin=1&modified=unsavedChanges&proto=json';

export interface ImageOptions {
  inline: boolean;
  allowBase64: boolean;
  openDialog: 'click' | 'dblclick';
  drawIoLink: string;
  baseImage: string;
  width: string;
  height: string;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    drawIoExtension: {
      /**
       * Add an image
       */
      insertDrawIo: () => ReturnType;
    };
  }
}

async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const DrawIoExtension = Node.create({
  name: 'drawio',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: '',
      },
      class: {
        default: 'drawio',
      },
      draggable: { default: true },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(HTMLAttributes, {
        class: 'drawio',
        'data-drawio': 'true',
      }),
    ];
  },
  parseHTML() {
    return [{ tag: 'img.drawio' }, { tag: 'img[data-drawio]' }];
  },

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      drawIoLink: url,
      baseImage: baseImage,
      width: '99vw',
      height: '99vh',
      openDialog: 'click',
      HTMLAttributes: {},
    };
  },

  addNodeView() {
    return ({ editor, node, getPos }) => {
      const dom = document.createElement('img');
      dom.src = node.attrs.src;

      dom.classList.add('drawio');
      dom.setAttribute('draggable', 'true');
      dom.setAttribute('data-drawio', 'true');
      dom.setAttribute('data-asset', node.attrs.src);
      dom.setAttribute('style', 'cursor: zoom-in');

      const openDialog = this.options.openDialog;

      const openModal = (evt: Event) => {
        const isEditable =
          editor.isEditable !== false &&
          editor.view.dom.getAttribute('contenteditable') !== 'false';

        if (!isEditable) return;

        const dialog = document.createElement('dialog');
        dialog.style.border = '0';
        dialog.style.padding = '0';

        const iframe = document.createElement('iframe');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('src', this.options.drawIoLink);
        iframe.style.width = this.options.width;
        iframe.style.height = this.options.height;

        const source = evt.target as HTMLElement;
        dialog.appendChild(iframe);
        document.body.appendChild(dialog);

        dialog.showModal();

        const receive = async (event: any) => {
          if (!event.data) return;

          let msg: any;
          if (typeof event.data === 'string') {
            try {
              msg = JSON.parse(event.data);
            } catch (e) {
              return;
            }
          } else {
            msg = event.data;
          }

          switch (msg.event) {
            case 'init':
              const src = source.getAttribute('src');
              let base64 = src;

              if (src && !src.startsWith('data:')) {
                base64 = await urlToBase64(src);
              }

              iframe.contentWindow?.postMessage(
                JSON.stringify({
                  action: 'load',
                  xmlpng: base64,
                }),
                '*',
              );
              break;
            case 'save':
              iframe.contentWindow?.postMessage(
                JSON.stringify({
                  action: 'export',
                  format: 'xmlpng',
                  spinKey: 'saving',
                }),
                '*',
              );
              break;
            case 'export':
              editor.view.dispatch(
                editor.view.state.tr.setNodeMarkup(getPos(), undefined, {
                  src: msg.data,
                  class: 'drawio',
                  draggable: true,
                }),
              );
              break;
            case 'exit':
              window.removeEventListener('message', receive);
              dialog.close();
              dialog.remove();
              break;
          }
        };

        window.addEventListener('message', receive);
      };

      if (openDialog) dom.addEventListener(openDialog, openModal);

      return {
        dom,
      };
    };
  },

  addCommands() {
    return {
      insertDrawIo:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: this.options.baseImage,
              class: 'drawio',
              draggable: true,
            },
          });
        },
      updateDrawIo:
        (image: string) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, {
            src: image,
            class: 'drawio',
            draggable: true,
          });
        },
    };
  },
});
