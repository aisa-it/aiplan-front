import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { mergeAttributes, type AnyExtension } from '@tiptap/core';
import { Mention, type MentionNodeAttrs } from '@tiptap/extension-mention';
import type {
  SuggestionKeyDownProps,
  SuggestionProps,
} from '@tiptap/suggestion';
import { VueRenderer } from '@tiptap/vue-3';

import EditorMentionList from '../components/EditorMentionList.vue';
import type { EditorMentionItem } from '../model/editor.types';

interface CreateEditorMentionOptions {
  getItems: (query: string) => Promise<EditorMentionItem[]>;
  getLabel: (attributes: MentionNodeAttrs) => string;
  enabled?: () => boolean;
}

interface EditorMentionListExpose {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const getThemeClass = (element: HTMLElement) => {
  const themeRoot = element.closest<HTMLElement>('[class*="v-theme--"]');

  return [...(themeRoot?.classList ?? [])].find((className) =>
    className.startsWith('v-theme--'),
  );
};

const createSuggestionRenderer = () => {
  let component: VueRenderer | undefined;
  let popup: HTMLDivElement | undefined;
  let currentProps:
    | SuggestionProps<EditorMentionItem, MentionNodeAttrs>
    | undefined;
  let stopAutoUpdate: (() => void) | undefined;

  const updatePosition = async () => {
    const clientRect = currentProps?.clientRect?.();
    if (!clientRect || !popup) return;

    const reference = {
      getBoundingClientRect: () => clientRect,
      contextElement: currentProps?.editor.view.dom,
    };
    const { x, y } = await computePosition(reference, popup, {
      strategy: 'fixed',
      placement: 'bottom-start',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    });

    if (!popup) return;
    Object.assign(popup.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  };

  const destroy = () => {
    stopAutoUpdate?.();
    stopAutoUpdate = undefined;
    component?.destroy();
    component = undefined;
    popup?.remove();
    popup = undefined;
    currentProps = undefined;
  };

  return {
    onStart(props: SuggestionProps<EditorMentionItem, MentionNodeAttrs>) {
      currentProps = props;
      component = new VueRenderer(EditorMentionList, {
        props,
        editor: props.editor,
      });

      popup = document.createElement('div');
      popup.className = 'editor-mention-popup';
      const themeClass = getThemeClass(props.editor.view.dom);
      if (themeClass) popup.classList.add(themeClass);
      if (component.element) popup.append(component.element);
      document.body.append(popup);

      const reference = {
        getBoundingClientRect: () =>
          currentProps?.clientRect?.() ?? new DOMRect(),
        contextElement: props.editor.view.dom,
      };
      stopAutoUpdate = autoUpdate(reference, popup, updatePosition);
      void updatePosition();
    },

    onUpdate(props: SuggestionProps<EditorMentionItem, MentionNodeAttrs>) {
      currentProps = props;
      component?.updateProps(props);
      void updatePosition();
    },

    onKeyDown(props: SuggestionKeyDownProps) {
      if (props.event.key === 'Escape') {
        destroy();
        return true;
      }

      return (
        (component?.ref as EditorMentionListExpose | undefined)?.onKeyDown(
          props,
        ) ?? false
      );
    },

    onExit: destroy,
  };
};

export const createEditorMention = ({
  getItems,
  getLabel,
  enabled = () => true,
}: CreateEditorMentionOptions): AnyExtension =>
  Mention.configure({
    HTMLAttributes: {
      class: 'mention',
    },
    suggestion: {
      allow: () => enabled(),
      items: ({ query }) => getItems(query),
      render: createSuggestionRenderer,
    },
    renderText: ({ node }) => `@${getLabel(node.attrs as MentionNodeAttrs)}`,
    renderHTML: ({ options, node }) => [
      'span',
      mergeAttributes(options.HTMLAttributes, {
        'data-type': 'mention',
      }),
      `@${getLabel(node.attrs as MentionNodeAttrs)}`,
    ],
  });
