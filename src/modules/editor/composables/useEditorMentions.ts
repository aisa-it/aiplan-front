import { onBeforeUnmount, ref, watch } from 'vue';
import type { MentionNodeAttrs } from '@tiptap/extension-mention';
import type { EditorMentionItem, EditorTipTapProps } from '../model/editor.types';
import { createEditorMention } from '../extensions/EditorMention';
import { getStoredMentionLabel } from '../utils/editorMentionStorage';
import {
  loadEditorMentionMembers,
  searchEditorMembers,
  toEditorMentionItems,
} from '../utils/editorIntegration';

export const useEditorMentions = (props: EditorTipTapProps) => {
  const mentionCache = new Map<string, EditorMentionItem>();
  const mentionPreviewAnchor = ref<HTMLElement>();
  const mentionPreviewItem = ref<EditorMentionItem>();
  const mentionMenuOpen = ref(false);
  let mentionPreviewCloseTimer: ReturnType<typeof setTimeout> | undefined;
  let mentionPreviewRequest = 0;
  const cacheMentionItem = (item: EditorMentionItem) => {
    mentionCache.set(item.id, item);
    mentionCache.set(item.username, item);
    if (item.email) mentionCache.set(item.email, item);
  };

  const staticMentionItems = () => [
    ...(props.mentionItems ?? []),
    ...toEditorMentionItems(props.members),
  ];

  let loadedMentionMembersKey: string | undefined;
  let loadedMentionMembers: Promise<void> | undefined;
  watch(
    [() => props.workspaceSlug, () => props.projectIdentifier],
    () => {
      mentionCache.clear();
      loadedMentionMembersKey = undefined;
      loadedMentionMembers = undefined;
    },
    { flush: 'sync' },
  );

  const preloadMentionMembers = (
    workspaceSlug: string,
    projectIdentifier?: string,
  ) => {
    const key = `${workspaceSlug}\u0000${projectIdentifier ?? ''}`;
    if (loadedMentionMembersKey === key && loadedMentionMembers) {
      return loadedMentionMembers;
    }

    loadedMentionMembersKey = key;
    loadedMentionMembers = loadEditorMentionMembers(
      workspaceSlug,
      projectIdentifier,
    )
      .then((items) => {
        if (loadedMentionMembersKey === key) items.forEach(cacheMentionItem);
      })
      .catch(() => {
        if (loadedMentionMembersKey === key) {
          loadedMentionMembersKey = undefined;
          loadedMentionMembers = undefined;
        }
      });
    return loadedMentionMembers;
  };

  watch(
    [
      () => props.workspaceSlug,
      () => props.projectIdentifier,
      () => props.modelValue,
    ],
    ([workspaceSlug, projectIdentifier, html]) => {
      if (
        !workspaceSlug ||
        !html ||
        props.members?.length ||
        props.mentionItems?.length ||
        props.getMentionItems ||
        props.getMembersForMention ||
        !/data-type\s*=\s*["']mention["']/i.test(html)
      )
        return;
      void preloadMentionMembers(workspaceSlug, projectIdentifier);
    },
    { immediate: true },
  );

  const getMentionItems = async (query: string) => {
    const context = `${props.workspaceSlug ?? ''}\u0000${props.projectIdentifier ?? ''}`;
    const items = props.getMentionItems
      ? await props.getMentionItems(query)
      : props.getMembersForMention
        ? toEditorMentionItems((await props.getMembersForMention(query)) ?? [])
        : props.workspaceSlug
          ? await searchEditorMembers(
            props.workspaceSlug,
            query,
            props.projectIdentifier,
          )
          : staticMentionItems().filter((item) => {
            const search = query.trim().toLocaleLowerCase();
            if (!search) return true;

            return [item.first_name, item.last_name, item.username, item.email]
              .filter(Boolean)
              .some((value) => value?.toLocaleLowerCase().includes(search));
          });

    if (
      context ===
      `${props.workspaceSlug ?? ''}\u0000${props.projectIdentifier ?? ''}`
    ) {
      items.forEach(cacheMentionItem);
    }
    return items;
  };

  const findMentionItem = (id?: string | null, label?: string | null) =>
    (id ? mentionCache.get(id) : undefined) ??
    (label ? mentionCache.get(label) : undefined) ??
    staticMentionItems().find(
      (mention) =>
        mention.id === id || mention.username === id || mention.email === label,
    );

  const getMentionLabel = ({ id, label }: MentionNodeAttrs) => {
    const item = findMentionItem(id, label);

    return item?.username ?? getStoredMentionLabel(id, label);
  };

  const cancelMentionPreviewClose = () => {
    if (!mentionPreviewCloseTimer) return;

    clearTimeout(mentionPreviewCloseTimer);
    mentionPreviewCloseTimer = undefined;
  };

  const closeMentionPreview = () => {
    mentionPreviewRequest += 1;
    cancelMentionPreviewClose();
    mentionMenuOpen.value = false;
    mentionPreviewAnchor.value = undefined;
    mentionPreviewItem.value = undefined;
  };

  const scheduleMentionPreviewClose = () => {
    mentionPreviewRequest += 1;
    cancelMentionPreviewClose();
    mentionPreviewCloseTimer = setTimeout(closeMentionPreview, 150);
  };

  const handleEditorPointerOver = async (event: PointerEvent) => {
    if (props.loading) return;

    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-type="mention"]',
    );
    if (!target) return;

    cancelMentionPreviewClose();
    const request = ++mentionPreviewRequest;
    const id = target.dataset.id;
    const label = target.dataset.label;
    const visibleUsername = target.textContent?.trim().replace(/^@/, '');
    let item =
      findMentionItem(id, label) ??
      (visibleUsername ? mentionCache.get(visibleUsername) : undefined);

    if (
      !item &&
      props.workspaceSlug &&
      !props.members?.length &&
      !props.mentionItems?.length &&
      !props.getMentionItems &&
      !props.getMembersForMention
    ) {
      await preloadMentionMembers(props.workspaceSlug, props.projectIdentifier);
      if (request !== mentionPreviewRequest) return;
      item =
        findMentionItem(id, label) ??
        (visibleUsername ? mentionCache.get(visibleUsername) : undefined);
    }

    if (
      !item &&
      (props.getMentionItems || props.getMembersForMention || props.workspaceSlug)
    ) {
      try {
        const queries = [
          ...new Set(
            [visibleUsername, id, label].filter(
              (value): value is string => !!value,
            ),
          ),
        ];
        for (const query of queries) {
          const results = await getMentionItems(query);
          if (request !== mentionPreviewRequest) return;
          item =
            findMentionItem(id, label) ??
            results.find(
              (candidate) =>
                candidate.username.toLocaleLowerCase() ===
                visibleUsername?.toLocaleLowerCase(),
            );
          if (item) break;
        }
      } catch {
        return;
      }
    }

    if (
      !item ||
      !target.isConnected ||
      request !== mentionPreviewRequest ||
      props.loading
    )
      return;

    mentionPreviewAnchor.value = target;
    mentionPreviewItem.value = item;
    mentionMenuOpen.value = true;
  };

  const handleEditorPointerOut = (event: PointerEvent) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-type="mention"]',
    );
    if (!target) return;

    const relatedMention = (event.relatedTarget as HTMLElement | null)?.closest?.(
      '[data-type="mention"]',
    );
    if (relatedMention === target) return;

    scheduleMentionPreviewClose();
  };

  watch(
    () => props.mentionItems,
    (items) => items?.forEach(cacheMentionItem),
    { immediate: true },
  );

  watch(
    () => props.members,
    (members) => toEditorMentionItems(members).forEach(cacheMentionItem),
    { immediate: true },
  );

  const mention = createEditorMention({
    getItems: getMentionItems,
    getLabel: getMentionLabel,
    enabled: () =>
      !!(
        props.getMentionItems ||
        props.mentionItems ||
        props.getMembersForMention ||
        props.members ||
        props.workspaceSlug
      ),
  });

  watch(mentionMenuOpen, (open) => {
    if (!open) closeMentionPreview();
  });

  watch(
    () => props.loading,
    (loading) => {
      if (loading) closeMentionPreview();
    },
  );

  onBeforeUnmount(closeMentionPreview);

  return {
    mention,
    mentionPreviewAnchor,
    mentionPreviewItem,
    mentionMenuOpen,
    cancelMentionPreviewClose,
    scheduleMentionPreviewClose,
    closeMentionPreview,
    handleEditorPointerOver,
    handleEditorPointerOut,
  };
};