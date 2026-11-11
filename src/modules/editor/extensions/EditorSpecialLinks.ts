import {
  Extension,
  mergeAttributes,
  Node,
  type AnyExtension,
} from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import type { Component } from 'vue';

import EditorIssueLinkNodeView from '../components/EditorIssueLinkNodeView.vue';
import EditorAttachmentLinkNodeView from '../components/EditorAttachmentLinkNodeView.vue';
import EditorCommentLinkNodeView from '../components/EditorCommentLinkNodeView.vue';

import {
  ATTACHMENT_LINK_NODE,
  COMMENT_LINK_NODE,
  ISSUE_LINK_NODE,
  parseEditorSpecialLink,
} from '../utils/editorSpecialLinks';

interface SpecialLinkNodeConfig {
  name: string;
  selector: string;
  className: string;
  attributes: Record<string, string>;
  textAttribute?: string;
  component?: Component;
  getLabel: (attributes: Record<string, string | null>) => string;
}

const createSpecialLinkNode = ({
  name,
  selector,
  className,
  attributes,
  textAttribute,
  component,
  getLabel,
}: SpecialLinkNodeConfig): AnyExtension =>
  Node.create({
    name,
    inline: true,
    group: 'inline',
    selectable: false,
    atom: true,

    ...(component
      ? {
          addNodeView() {
            return VueNodeViewRenderer(component);
          },
        }
      : {}),

    addAttributes() {
      return Object.fromEntries(
        Object.entries(attributes).map(([attribute, htmlAttribute]) => [
          attribute,
          {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.getAttribute(htmlAttribute),
            renderHTML: (nodeAttributes: Record<string, string | null>) =>
              nodeAttributes[attribute]
                ? { [htmlAttribute]: nodeAttributes[attribute] }
                : {},
          },
        ]),
      );
    },

    parseHTML() {
      return [
        {
          tag: selector,
          getAttrs: (node) => {
            const element = node as HTMLElement;
            const parsedAttributes = Object.fromEntries(
              Object.entries(attributes).map(([attribute, htmlAttribute]) => [
                attribute,
                element.getAttribute(htmlAttribute),
              ]),
            );

            if (textAttribute && !parsedAttributes[textAttribute]) {
              parsedAttributes[textAttribute] =
                element.textContent?.replace(/^#/, '') || null;
            }

            return parsedAttributes;
          },
        },
      ];
    },

    renderHTML({ node, HTMLAttributes }) {
      return [
        'span',
        mergeAttributes(
          HTMLAttributes,
          name === ISSUE_LINK_NODE ? { 'data-type': name } : {},
          {
            class: `special-link-mention ${className}`,
            'data-special-link': name,
          },
        ),
        getLabel(node.attrs),
      ];
    },

    renderText({ node }) {
      return getLabel(node.attrs);
    },
  });

const IssueLinkMention = createSpecialLinkNode({
  name: ISSUE_LINK_NODE,
  component: EditorIssueLinkNodeView,
  selector: 'span[data-type="issueLinkMention"], span.issue-link',
  className: 'issue-link',
  attributes: {
    slug: 'data-slug',
    projectIdentifier: 'data-project-identifier',
    currentIssueId: 'data-current-issue-id',
    originalUrl: 'data-original-url',
  },
  getLabel: ({ projectIdentifier, currentIssueId }) =>
    projectIdentifier && currentIssueId
      ? `${projectIdentifier}-${currentIssueId}`
      : '#issue',
});

const CommentLinkMention = createSpecialLinkNode({
  name: COMMENT_LINK_NODE,
  component: EditorCommentLinkNodeView,
  selector: 'span.comment-link',
  className: 'comment-link',
  attributes: {
    type: 'data-type',
    slug: 'data-slug',
    commentId: 'data-comment-id',
    projectIdentifier: 'data-project-identifier',
    currentIssueId: 'data-current-issue-id',
    docId: 'data-doc-id',
    originalUrl: 'data-original-url',
    title: 'data-title',
  },
  textAttribute: 'title',
  getLabel: ({ title, commentId }) => `#${title || commentId || 'comment'}`,
});

const AttachmentLinkMention = createSpecialLinkNode({
  name: ATTACHMENT_LINK_NODE,
  component: EditorAttachmentLinkNodeView,
  selector: 'span.attachment-link',
  className: 'attachment-link',
  attributes: {
    type: 'data-type',
    slug: 'data-slug',
    docId: 'data-doc-id',
    projectIdentifier: 'data-project-identifier',
    currentIssueId: 'data-current-issue-id',
    originalUrl: 'data-original-url',
    title: 'data-title',
  },
  textAttribute: 'title',
  getLabel: ({ title }) => title || '#attachment',
});

const EditorSpecialLinkPaste = Extension.create({
  name: 'editorSpecialLinkPaste',
  priority: 1_000,

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('editorSpecialLinkPaste'),
        props: {
          handlePaste: (view, event) => {
            if (
              !view.editable ||
              view.state.selection.$from.parent.type.spec.code
            ) {
              return false;
            }

            if (
              /<table(?:\s|>)/i.test(
                event.clipboardData?.getData('text/html') ?? '',
              )
            ) {
              return false;
            }
            const value = event.clipboardData?.getData('text/plain');
            if (!value) return false;

            const parsedLink = parseEditorSpecialLink(value);
            if (!parsedLink) return false;

            const node = view.state.schema.nodes[parsedLink.nodeName]?.create(
              parsedLink.attributes,
            );
            if (!node) return false;

            event.preventDefault();
            view.dispatch(view.state.tr.replaceSelectionWith(node));
            return true;
          },
        },
      }),
    ];
  },
});

export const EditorSpecialLinks: AnyExtension[] = [
  IssueLinkMention,
  CommentLinkMention,
  AttachmentLinkMention,
  EditorSpecialLinkPaste,
];
