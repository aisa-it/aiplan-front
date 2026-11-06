import type { ComputedRef, InjectionKey } from 'vue';

import type {
  EditorAttachmentLinkResolver,
  EditorIssueLinkResolver,
} from './editor.types';

export const EDITOR_READONLY_KEY: InjectionKey<ComputedRef<boolean>> = Symbol(
  'editorReadonly',
);

export interface EditorAnchorContext {
  workspaceSlug?: string;
  documentSlug?: string;
}

export const EDITOR_ANCHOR_CONTEXT_KEY: InjectionKey<ComputedRef<EditorAnchorContext>> =
  Symbol('editorAnchorContext');

export interface EditorSpecialLinkResolvers {
  resolveIssueLink?: EditorIssueLinkResolver;
  resolveAttachmentLink?: EditorAttachmentLinkResolver;
}

export const EDITOR_SPECIAL_LINK_RESOLVERS_KEY: InjectionKey<EditorSpecialLinkResolvers> =
  Symbol('editorSpecialLinkResolvers');
