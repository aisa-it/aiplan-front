<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        icon
        variant="text"
        size="small"
        density="compact"
        :style="{
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.30))',
        }"
        :disabled="disable"
        :class="`tiptap-fill-dropdown-btn-${colorName}`"
      >
        <HintTooltip>Заливка ячейки</HintTooltip>
        <ColorFillIcon />
      </v-btn>
    </template>

    <v-card :class="classPrevent">
      <ColorPicker
        :model-value="color"
        :is-bg-color="true"
        :is-spoiler="false"
        :isTableCell="true"
        @selectBgColor="(key) => selectColor(key)"
        :class-prevent="classPrevent"
      />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
//core
import { ref, onMounted, onBeforeUnmount, inject } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import type { EditorEventBus } from '../utils/eventBus';
//icons
import ColorFillIcon from '@/components/icons/ColorFillIcon.vue';
import ColorPicker from './ColorPicker.vue';
import HintTooltip from './HintTooltip.vue';

const props = defineProps<{
  editorInstance: Editor;
  classPrevent?: string;
  disable?: boolean;
  isMobile?: boolean;
}>();

const bus = inject('bus') as EditorEventBus | undefined;

//state
const colorName = ref<string | null>(null);
const color = ref('');

//methods
function updateFillColorFromSelection() {
  if (props.editorInstance.isActive('tableHeader')) {
    colorName.value =
      props.editorInstance.getAttributes('tableHeader')['data-bgcolor'];
  } else if (props.editorInstance.isActive('tableCell')) {
    colorName.value =
      props.editorInstance.getAttributes('tableCell')['data-bgcolor'];
  } else {
    colorName.value = null;
  }
}

const selectColor = (name: string | null) => {
  colorName.value = name;

  if (
    props.editorInstance.isActive('tableCell') ||
    props.editorInstance.isActive('tableHeader')
  ) {
    if (!props.isMobile) {
      props.editorInstance
        .chain()
        .focus()
        .setCellAttribute('data-bgcolor', name)
        .run();
    } else {
      props.editorInstance.chain().setCellAttribute('data-bgcolor', name).run();
    }
  }
};

onMounted(() => {
  props.editorInstance.on('selectionUpdate', updateFillColorFromSelection);
  bus?.on('clearEditor', () => selectColor(null));
});

onBeforeUnmount(() => {
  props.editorInstance.off('selectionUpdate', updateFillColorFromSelection);
  bus?.off('clearEditor', () => selectColor(null));
});
</script>

<style lang="scss">
$color-names: 'red', 'blue', 'cyan', 'green', 'orange', 'yellow', 'pink';

.v-theme--dark {
  @each $color in $color-names {
    .tiptap-fill-dropdown-btn-#{$color} {
      color: map-get($tiptap-color-picker-dark-bg, $color);
    }
  }
}

.v-theme--light {
  @each $color in $color-names {
    .tiptap-fill-dropdown-btn-#{$color} {
      color: map-get($tiptap-color-picker-light-bg, $color);
    }
  }
}
</style>
