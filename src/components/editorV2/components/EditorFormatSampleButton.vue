<template>
  <q-btn
    dense
    flat
    @click="toggleFormatSample"
    :class="{ 'format-active': isActive }"
  >
    <HintTooltip>Форматирование по образцу</HintTooltip>
    <component :is="ICONS.formatIcon" />
  </q-btn>
</template>

<script setup lang="ts">
// core
import { Editor } from '@tiptap/vue-3';
import { ref, watch } from 'vue';

// utils
import { ICONS } from 'src/utils/icons';

const props = defineProps<{
  editorInstance: Editor;
  isFormatSampleActive: boolean;
  isMobile?: boolean;
}>();

const emits = defineEmits<{
  toggleFormatSample: [];
}>();

// computed
const isActive = ref(false);
const toggleFormatSample = () => {
  if (isActive.value) {
    if (props.isMobile) {
      props.editorInstance.chain().clearSample().run();
    } else {
      props.editorInstance.chain().focus().clearSample().run();
    }
  } else {
    if (props.isMobile) {
      props.editorInstance.chain().storeSample().run();
    } else {
      props.editorInstance.chain().focus().storeSample().run();
    }
  }
  isActive.value = !isActive.value;
  emits('toggleFormatSample');
};

watch(
  () => props.isFormatSampleActive,
  (newValue) => {
    isActive.value = newValue;
  },
);
</script>
