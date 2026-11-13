<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    location="bottom end"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        :aria-label="t('editor.tableOfContents')"
        color="text"
        icon
        size="small"
        :title="t('editor.tableOfContents')"
        variant="text"
        class="editor-table-of-contents__activator"
      >
        <EditorIcon name="headings" :size="22" />
      </v-btn>
    </template>

    <v-card class="editor-table-of-contents" max-width="360">
      <v-card-title class="text-base font-medium">{{ t('editor.tableOfContents') }}</v-card-title>
      <v-divider />
      <v-list density="compact" max-height="300">
        <v-list-item
          v-for="link in links"
          :key="link.id"
          :style="{ paddingInlineStart: `${12 + (link.level - 1) * 18}px` }"
          @click="select(link)"
        >
          <v-list-item-title class="editor-table-of-contents__title">
            {{ hasOwnNumeration(link.text) ? '' : `${link.index} `
            }}{{ link.text }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { computed } from 'vue';

import type { EditorHeadingLink } from '../model/editor.types';
import EditorIcon from './EditorIcon.vue';

const { t } = useI18n();

const props = defineProps<{
  links: EditorHeadingLink[];
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  select: [link: EditorHeadingLink];
}>();

const open = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

const hasOwnNumeration = (text: string) => /^\d/.test(text.trim());

const select = (link: EditorHeadingLink) => {
  emit('select', link);
  open.value = false;
};
</script>

<style scoped>
.editor-table-of-contents {
  overflow: hidden;
}

.editor-table-of-contents__activator {
  width: 28px;
  min-width: 28px;
  height: 28px;
  border-radius: 6px;
}

.editor-table-of-contents__title {
  overflow: visible;
  color: rgb(var(--v-theme-primary));
  font-size: 14px;
  white-space: normal;
}
</style>
