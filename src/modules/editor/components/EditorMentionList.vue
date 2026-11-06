<template>
  <div class="editor-mention-list" role="listbox">
    <template v-if="items.length">
      <button
        v-for="(item, index) in items"
        :key="item.id"
        type="button"
        class="editor-mention-list__item"
        :class="{
          'editor-mention-list__item--selected': index === selectedIndex,
        }"
        role="option"
        :aria-selected="index === selectedIndex"
        @mouseenter="selectedIndex = index"
        @mousedown.prevent="selectItem(index)"
      >
        <UserAvatar :user="item" size="small" no-hat />

        <span class="editor-mention-list__text">
          <span class="editor-mention-list__name">
            {{ getUserName(item, false) }}
          </span>
          <span class="editor-mention-list__username">
            ({{ item.username }})
          </span>
        </span>
      </button>
    </template>

    <div v-else class="editor-mention-list__empty">Нет результатов</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import UserAvatar from '@/components/user-avatar/UserAvatar.vue';
import { getUserName } from '@/utils/helpers';
import type { EditorMentionItem } from '../model/editor.types';
import { getEditorMentionStorageAttributes } from '../utils/editorMentionStorage';

const props = defineProps<{
  items: EditorMentionItem[];
  command: (attributes: { id: string; label: string }) => void;
}>();

const selectedIndex = ref(0);

const selectItem = (index: number) => {
  const item = props.items[index];
  if (!item) return;

  props.command(getEditorMentionStorageAttributes(item));
};

const onKeyDown = ({ event }: { event: KeyboardEvent }) => {
  if (!props.items.length) return false;

  if (event.key === 'ArrowUp') {
    selectedIndex.value =
      (selectedIndex.value + props.items.length - 1) % props.items.length;
    return true;
  }

  if (event.key === 'ArrowDown') {
    selectedIndex.value = (selectedIndex.value + 1) % props.items.length;
    return true;
  }

  if (event.key === 'Enter') {
    selectItem(selectedIndex.value);
    return true;
  }

  return false;
};

watch(
  () => props.items,
  () => {
    selectedIndex.value = 0;
  },
);

defineExpose({ onKeyDown });
</script>

<style scoped>
.editor-mention-list {
  display: flex;
  max-width: min(400px, calc(100vw - 16px));
  max-height: 240px;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  padding: 6px;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 10px;
  background-color: rgb(var(--v-theme-surface));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  color: rgb(var(--v-theme-text));
  font-size: 12px;
}

.editor-mention-list__item {
  display: flex;
  width: 100%;
  min-width: 220px;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.editor-mention-list__item:hover,
.editor-mention-list__item--selected {
  background-color: rgba(var(--v-theme-on-surface), 0.1);
}

.editor-mention-list__text {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  line-height: 1.4;
}

.editor-mention-list__name {
  font-weight: 500;
}

.editor-mention-list__username {
  margin-left: 4px;
  color: rgb(var(--v-theme-text), 0.65);
}

.editor-mention-list__empty {
  padding: 6px 8px;
  white-space: nowrap;
}
</style>
