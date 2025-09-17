// Mention List
import EditorMentionList from '../../components/EditorMentionList.vue';
import tippy from 'tippy.js';

// TipTap
import { Mention } from '@tiptap/extension-mention';
import { VueRenderer } from '@tiptap/vue-3';
import { mergeAttributes } from '@tiptap/core';
// import MentionNode from './MentionNode.vue'; //TODO Удалить компонент, рендер списка уже в EditorMentionList

// Stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { storeToRefs } from 'pinia';
// types
import { DtoProjectMemberLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { projectMembers } = storeToRefs(projectStore);
const { workspaceUsers } = storeToRefs(workspaceStore);

function filterValidMembers(list: DtoProjectMemberLight[]) {
  return list.filter((m) => m.member?.is_active && m.member?.username);
}

const members = [...projectMembers.value, ...workspaceUsers.value];

export const useMention = (
  getMembers?: (search: string) => Promise<Array<DtoProjectMemberLight> | void>,
) => {
  const suggestion = {
    items: async ({ query }) => {
      let items: Array<DtoProjectMemberLight> = [];

      if (getMembers) {
        try {
          const result = await getMembers(query);

          if (result) {
            items = filterValidMembers(result);
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

          popup[0]?.setProps({
            getReferenceClientRect: props.clientRect,
          });

          if (!popup[0]?.state?.isVisible || !popup[0]?.state?.isShown) {
            popup[0]?.show();
          }
        },

        onKeyDown(props: any) {
          if (props.event.key === 'Escape') {
            popup[0]?.hide();

            return true;
          }

          if (!popup[0]?.state?.isVisible || !popup[0]?.state?.isShown) {
            popup[0]?.show();
          }

          return component?.ref?.onKeyDown(props);
        },

        onExit() {
          popup[0]?.destroy();
          component?.destroy();
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
          u.member?.id === node.attrs.id ||
          u.member?.email === node.attrs.label,
      );

      return `${options.suggestion.char}${
        userName?.member?.username ?? node.attrs.id
      }`;
    },
    renderHTML({ options, node }) {
      const userName = members?.find(
        (u) =>
          u.member?.id === node.attrs.id ||
          u.member?.email === node.attrs.label,
      );
      // options.suggestion.char почему-то стал отдавать undefined, временно закрыл @
      // return [
      //   'span',
      //   mergeAttributes(this.HTMLAttributes, options.HTMLAttributes),
      //   `${options.suggestion.char}${
      //     userName?.member?.username ?? node.attrs.id
      //   }`,
      // ];
      return [
        'span',
        mergeAttributes(this.HTMLAttributes, options.HTMLAttributes),
        `@${userName?.member?.username ?? node.attrs.id}`,
      ];
    },
  });

  // TODO Удалить вместе с Mention Node
  // const mention = Mention.extend({
  //   addNodeView() {
  //     return VueNodeViewRenderer(MentionNode);
  //   },
  // }).configure({
  //   suggestion,
  //   HTMLAttributes: {
  //     class: 'mention',
  //   },
  // });

  return { mention };
};
