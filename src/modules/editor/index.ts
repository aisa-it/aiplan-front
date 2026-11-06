export { default as EditorTipTap } from './components/EditorTipTap.vue';
export type {
  EditorIssueLinkPreview,
  EditorIssueLinkResolver,
  EditorAttachmentLinkPreview,
  EditorAttachmentLinkResolver,
  EditorMentionItem,
  EditorMentionItemsProvider,
  EditorMember,
  EditorMembersProvider,
  EditorSpecialLink,
  EditorSpecialLinkContext,
  EditorSpecialLinkKind,
  EditorDocumentAnchorTarget,
  EditorTipTapProps,
} from './model/editor.types';
export type { ScrollEditorToAnchorOptions } from './utils/editorAnchorNavigation';
export {
  downloadEditorAttachment,
  resolveEditorAttachmentLink,
  resolveEditorIssueLink,
  searchEditorMembers,
  toEditorMentionItem,
  toEditorMentionItems,
} from './utils/editorIntegration';
export { prepareEditorContentForSave } from './utils/editorDocumentApi';
