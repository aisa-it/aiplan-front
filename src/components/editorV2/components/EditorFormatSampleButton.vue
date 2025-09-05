<template>
  <q-btn
    dense
    flat
    @click="toggleFormatSample"
    :class="{ 'format-active': isActive }"
  >
    <HintTooltip>{{ tooltip }}</HintTooltip>
    <component :is="ICONS.formatIcon" />
  </q-btn>
</template>

<script lang="ts">
// core
import { Editor } from '@tiptap/vue-3';
import { defineComponent, PropType, ref, watch } from 'vue';

// utils
import { ICONS } from 'src/utils/icons';

export default defineComponent({
  name: 'EditorFormatSampleButton',
  props: {
    editorInstance: {
      type: Object as PropType<Editor>,
      required: true,
    },
    tooltip: {
      type: String,
      default: 'Форматирование по образцу',
    },
    isFormatSampleActive: {
      type: Boolean,
      default: false,
    },
    isMobile: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['toggleFormatSample'],
  setup(props, { emit }) {
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
      emit('toggleFormatSample');
    };

    watch(
      () => props.isFormatSampleActive,
      (newValue) => {
        isActive.value = newValue;
      },
    );

    return {
      ICONS,
      isActive,
      toggleFormatSample,
    };
  },
});
</script>
