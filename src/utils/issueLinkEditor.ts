import { Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import EditorTooltipIssueLink from 'src/components/editorV2/components/EditorTooltipIssueLink.vue';
export const IssueLinkMention = Node.create({
  name: 'issueLinkMention',

  inline: true,
  group: 'inline',
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      slug: { default: null },
      projectIdentifier: { default: null },
      currentIssueId: { default: null },
      originalUrl: { default: null },
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(EditorTooltipIssueLink);
  },
  
  parseHTML() {
    return [
      {
        tag: 'span[data-type="issueLinkMention"]',
        getAttrs: (el) => {
          const element = el as HTMLElement;
          return {
            slug: element.getAttribute('data-slug'),
            projectIdentifier: element.getAttribute('data-project-identifier'),
            currentIssueId: element.getAttribute('data-current-issue-id'),
            originalUrl: element.getAttribute('data-original-url'),
          };
        },
      },
    ];
  },
  renderHTML({ node }) {
    const attrs: Record<string, string> = {
      'data-type': 'issueLinkMention',
      'data-slug': node.attrs.slug,
      'data-original-url': node.attrs.originalUrl,
      'data-project-identifier': node.attrs.projectIdentifier,
      'data-current-issue-id': node.attrs.currentIssueId,
      class: 'special-link-mention issue-link',
    };

    return ['span', attrs, '#issue'];
  },
});
