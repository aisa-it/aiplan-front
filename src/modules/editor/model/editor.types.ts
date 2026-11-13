import type { Extensions } from '@tiptap/core';
import type {
  DtoProjectMemberLight,
  DtoUser,
  DtoWorkspaceMemberLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import type { EditorIconName } from '../icons/editor-icons';

export interface EditorTipTapProps {
  modelValue?: string;
  editable?: boolean;
  canEdit?: boolean;
  disableImages?: boolean;
  loading?: boolean;
  saving?: boolean;
  showActions?: boolean;
  placeholder?: string;
  showHeadings?: boolean;
  enableAnchors?: boolean;
  fullscreen?: boolean;
  readOnlyEditor?: boolean;
  editorId?: string;
  canResize?: boolean;
  excludedTabs?: string[];
  classPrevent?: string;
  allowFullscreen?: boolean;
  members?: EditorMember[];
  getMembersForMention?: EditorMembersProvider;
  workspaceSlug?: string;
  documentSlug?: string;
  projectIdentifier?: string;
  mentionItems?: EditorMentionItem[];
  getMentionItems?: EditorMentionItemsProvider;
  resolveIssueLink?: EditorIssueLinkResolver;
  resolveAttachmentLink?: EditorAttachmentLinkResolver;
  navigateToDocumentAnchor?: (target: EditorDocumentAnchorTarget) => void;
  scrollToComments?: () => void;
}

export interface EditorDocumentAnchorTarget {
  workspaceSlug: string;
  documentSlug: string;
  anchorId: string;
}

export type EditorMentionItem = DtoUser & {
  id: string;
  username: string;
};

export type EditorMember = DtoProjectMemberLight | DtoWorkspaceMemberLight;
export type EditorMembersProvider = (
  query: string,
) => EditorMember[] | void | Promise<EditorMember[] | void>;

export type EditorMentionItemsProvider = (
  query: string,
) => EditorMentionItem[] | Promise<EditorMentionItem[]>;

export type EditorSpecialLinkKind = 'issue' | 'comment' | 'attachment';
export type EditorSpecialLinkContext = 'issue' | 'aidoc';

export interface EditorSpecialLink {
  kind: EditorSpecialLinkKind;
  contextType?: EditorSpecialLinkContext;
  workspaceSlug?: string;
  projectIdentifier?: string;
  issueId?: string;
  commentId?: string;
  documentId?: string;
  originalUrl?: string;
  title?: string;
}

export interface EditorIssueLinkPreview {
  identifier?: string;
  name?: string;
  statusName?: string;
  statusColor?: string;
}

export interface EditorAttachmentLinkPreview {
  sourceTitle?: string;
}

export type EditorIssueLinkResolver = (
  link: EditorSpecialLink,
) => Promise<EditorIssueLinkPreview | undefined>;

export type EditorAttachmentLinkResolver = (
  link: EditorSpecialLink,
) => Promise<EditorAttachmentLinkPreview | undefined>;

export interface EditorHeadingLink {
  id: string;
  anchorId?: string;
  index: string;
  level: number;
  position: number;
  text: string;
}

export interface UseEditorInstanceOptions {
  content: () => string;
  normalizeContent?: (html: string) => string;
  editable: () => boolean;
  extensions: () => Extensions;
  onUpdate: (html: string) => void;
}

export interface EditorSelectOption<
  Value extends string | number = string | number,
> {
  title: string;
  value: Value;
}

export type EditorTextAlignment = 'left' | 'center' | 'right' | 'justify';

export interface EditorAlignmentOption {
  value: EditorTextAlignment;
  icon: EditorIconName;
  tooltip: string;
}

export interface EditorThemeColor {
  light: string;
  dark: string;
}

export interface EditorColorOption extends EditorThemeColor {
  label: string;
}

export type EditorColorMode = 'text' | 'highlight';
