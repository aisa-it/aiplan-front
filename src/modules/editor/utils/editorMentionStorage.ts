import type { EditorMentionItem } from '../model/editor.types';

export const getEditorMentionStorageAttributes = (
  item: Pick<EditorMentionItem, 'username' | 'email'>,
) => ({
  id: item.username,
  label: item.email || item.username,
});

export const getStoredMentionLabel = (
  id?: string | null,
  label?: string | null,
) => (label?.includes('@') ? (id ?? label) : (label ?? id ?? ''));
