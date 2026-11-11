<template>
  <EditorToolbarButton
    :active="active"
    icon="format"
    :tooltip="t('editor.copyFormatting')"
    @click="emit('click')"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import EditorToolbarButton from './EditorToolbarButton.vue';

const { t } = useI18n();

defineProps<{
  active: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>
