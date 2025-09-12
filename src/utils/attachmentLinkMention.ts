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
      type: { default: null },
      slug: { default: null },
      docId: { default: null },
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
        tag: 'span.attachment-link',
        getAttrs: (el) => {
          const element = el as HTMLElement;
          return {
            type: element.getAttribute('data-type'),
            slug: element.getAttribute('data-slug'),
            docId: element.getAttribute('data-doc-id'),
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
      'data-type': node.attrs.type,
      'data-slug': node.attrs.slug,
      'data-original-url': node.attrs.originalUrl,
      'data-doc-id': node.attrs.docId,
      'data-project-identifier': node.attrs.projectIdentifier,
      'data-current-issue-id': node.attrs.currentIssueId,
      'data-title': node.attrs.title,
      class: 'special-link-mention attachment-link',
    };

    return ['span', attrs, '#attachment'];
  },
});
