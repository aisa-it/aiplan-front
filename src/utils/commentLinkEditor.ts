import { Node } from '@tiptap/core';
export const CommentLinkMention = Node.create({
  name: 'commentLinkMention',

  inline: true,
  group: 'inline',
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      type: { default: null },
      slug: { default: null },
      commentId: { default: null },
      projectIdentifier: { default: null },
      currentIssueId: { default: null },
      docId: { default: null },
      originalUrl: { default: null },
      title: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type]',
        getAttrs: (el) => {
          const element = el as HTMLElement;
          return {
            type: element.getAttribute('data-type'),
            slug: element.getAttribute('data-slug'),
            commentId: element.getAttribute('data-comment-id'),
            projectIdentifier: element.getAttribute('data-project-identifier'),
            currentIssueId: element.getAttribute('data-current-issue-id'),
            docId: element.getAttribute('data-doc-id'),
            originalUrl: element.getAttribute('data-original-url'),
            title: element.textContent?.replace(/^#/, '') || null,
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const attrs: Record<string, string> = {
      'data-type': node.attrs.type,
      'data-slug': node.attrs.slug,
      'data-comment-id': node.attrs.commentId,
      'data-original-url': node.attrs.originalUrl,
      class: 'special-link-mention comment-link',
    };

    if (node.attrs.projectIdentifier) {
      attrs['data-project-identifier'] = node.attrs.projectIdentifier;
    }
    if (node.attrs.currentIssueId) {
      attrs['data-current-issue-id'] = node.attrs.currentIssueId;
    }
    if (node.attrs.docId) {
      attrs['data-doc-id'] = node.attrs.docId;
    }

    return ['span', attrs, `#${node.attrs.title ? node.attrs.title : node.attrs.commentId}`];
  },
});
