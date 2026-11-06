<template>
  <div class="editor-emoji-menu">
    <v-tooltip text="Добавить реакцию" location="bottom">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          :disabled="disabled"
          :aria-label="`Добавить реакцию ${selectedEmoji}`"
          color="text"
          size="small"
          variant="text"
          class="editor-emoji-menu__emoji"
          @click="insertEmoji(selectedEmoji)"
        >
          {{ selectedEmoji }}
        </v-btn>
      </template>
    </v-tooltip>

    <v-menu v-model="isOpen" :close-on-content-click="false">
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          :disabled="disabled"
          aria-label="Выбрать реакцию"
          color="text"
          icon="mdi-chevron-down"
          size="x-small"
          variant="text"
          class="editor-emoji-menu__toggle"
        />
      </template>

      <v-card class="editor-emoji-menu__card" elevation="4">
        <button
          v-for="emoji in EMOJIS"
          :key="emoji"
          type="button"
          :aria-label="`Добавить ${emoji}`"
          class="editor-emoji-menu__option"
          @click="selectEmoji(emoji)"
        >
          {{ emoji }}
        </button>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Editor } from '@tiptap/vue-3';

const EMOJIS = [
  '🙂',
  '🙁',
  '😋',
  '😁',
  '😉',
  '👍',
  '👎',
  '✅',
  '❌',
  '💡',
  'ℹ️',
  '⚠️',
  '❓',
  '❗',
  '🚩',
  '🔎',
  '⭐',
  '🔔',
  '🔕',
  '🕗',
];

const props = withDefaults(
  defineProps<{
    editor: Editor;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const isOpen = ref(false);
const selectedEmoji = ref(EMOJIS[0]);

const insertEmoji = (emoji: string) => {
  props.editor.chain().focus().insertContent(emoji).run();
};

const selectEmoji = (emoji: string) => {
  selectedEmoji.value = emoji;
  insertEmoji(emoji);
  isOpen.value = false;
};
</script>

<style scoped>
.editor-emoji-menu {
  display: flex;
  height: 30px;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 5px;
}

.editor-emoji-menu__emoji {
  min-width: 28px;
  padding: 0 4px;
  border-right: 1px solid rgb(var(--v-theme-border));
  border-radius: 4px 0 0 4px;
  line-height: 1;
}

.editor-emoji-menu__toggle {
  width: 24px;
  min-width: 24px;
  height: 28px;
  border-radius: 0 4px 4px 0;
}

.editor-emoji-menu__card {
  display: grid;
  grid-template-columns: repeat(7, 30px);
  gap: 4px;
  padding: 8px;
}

.editor-emoji-menu__option {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  font-size: 18px;
  line-height: 1;
}

.editor-emoji-menu__option:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.08);
}
</style>
