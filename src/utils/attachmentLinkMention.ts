import { Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';

import EditorTooltipAttachmentLink from 'src/components/editorV2/components/EditorTooltipAttachmentLink.vue';
export const AttachmentLinkMention = Node.create({
  name: 'attachmentLinkMention',

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
      title: { default: null },
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(EditorTooltipAttachmentLink);
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="attachmentLinkMention"]',
        getAttrs: (el) => {
          const element = el as HTMLElement;
          return {
            slug: element.getAttribute('data-slug'),
            projectIdentifier: element.getAttribute('data-project-identifier'),
            currentIssueId: element.getAttribute('data-current-issue-id'),
            originalUrl: element.getAttribute('data-original-url'),
            title: element.getAttribute('data-title'),
          };
        },
      },
    ];
  },
  renderHTML({ node }) {
    const attrs: Record<string, string> = {
      'data-type': 'attachmentLinkMention',
      'data-slug': node.attrs.slug,
      'data-original-url': node.attrs.originalUrl,
      'data-project-identifier': node.attrs.projectIdentifier,
      'data-current-issue-id': node.attrs.currentIssueId,
      'data-title': node.attrs.title,
      class: 'special-link-mention issue-link',
    };

    return ['span', attrs, '#issue'];
  },
});
