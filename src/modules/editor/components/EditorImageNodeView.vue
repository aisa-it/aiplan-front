<template>
  <NodeViewWrapper
    as="span"
    class="editor-image"
    :class="{ 'editor-image--selected': selected && !isReadonly }"
    :style="wrapperStyle"
    @pointerdown="selectImage"
  >
    <span class="editor-image__content">
      <img
        ref="imageElement"
        :alt="node.attrs.alt || ''"
        :title="node.attrs.title || undefined"
        :width="node.attrs.width || undefined"
        :height="node.attrs.height || undefined"
        :draggable="node.attrs.draggable !== false"
        :src="node.attrs.src"
        :style="imageStyle"
        data-drag-handle
        :data-drawio="node.type.name === 'drawio' ? 'true' : undefined"
        @dblclick="openDiagram"
      />

      <template v-if="selected && !isReadonly">
        <span class="editor-image__toolbar" @mousedown.stop.prevent>
          <v-btn
            v-for="item in ALIGNMENT_ACTIONS"
            :key="item.value"
            :aria-label="t(item.tooltipKey)"
            :class="{ 'editor-image__align-button--active': isAligned(item.value) }"
            :icon="item.icon"
            size="x-small"
            variant="text"
            @click="toggleAlignment(item.value)"
          >
            <v-icon :icon="item.icon" />
            <v-tooltip activator="parent" location="top">
              {{
                isAligned(item.value)
                  ? t('editor.resetAlignment')
                  : t(item.tooltipKey)
              }}
            </v-tooltip>
          </v-btn>
        </span>

        <span
          v-for="handle in RESIZE_HANDLES"
          :key="handle.position"
          :class="`editor-image__resize-handle editor-image__resize-handle--${handle.position}`"
          @pointerdown.stop.prevent="startResize($event, handle.direction)"
        />
      </template>
    </span>
  </NodeViewWrapper>
  <EditorDrawioDialog
    v-if="diagramOpen && !isReadonly"
    :xml="node.attrs.xml || ''"
    :src="node.attrs.src"
    @close="diagramOpen = false"
    @save="updateAttributes($event)"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import { computed, inject, onBeforeUnmount, ref } from 'vue';

import { EDITOR_READONLY_KEY } from '../model/editor.injection';
import EditorDrawioDialog from './EditorDrawioDialog.vue';

const { t } = useI18n();

type ImageAlignment = 'left' | 'center' | 'right';
type ResizeDirection = 'left' | 'right';

const props = defineProps(nodeViewProps);
const diagramOpen = ref(false);
const openDiagram = () => {
  if (props.node.type.name === 'drawio' && !isReadonly.value) diagramOpen.value = true;
};

const ALIGNMENT_ACTIONS = [
  {
    value: 'left',
    icon: 'mdi-format-align-left',
    tooltipKey: 'editor.alignLeft',
  },
  {
    value: 'center',
    icon: 'mdi-format-align-center',
    tooltipKey: 'editor.alignCenter',
  },
  {
    value: 'right',
    icon: 'mdi-format-align-right',
    tooltipKey: 'editor.alignRight',
  },
] as const;

const RESIZE_HANDLES: Array<{
  position: string;
  direction: ResizeDirection;
}> = [
  { position: 'top-left', direction: 'left' },
  { position: 'bottom-left', direction: 'left' },
  { position: 'top-right', direction: 'right' },
  { position: 'bottom-right', direction: 'right' },
];

const imageElement = ref<HTMLImageElement>();
const startClientX = ref(0);
const startWidth = ref(0);
const activePointerId = ref<number>();
const resizeDirection = ref<ResizeDirection>('right');
const injectedReadonly = inject(EDITOR_READONLY_KEY);
const isReadonly = computed(
  () => injectedReadonly?.value ?? !props.editor.isEditable,
);

const parseStyle = () => {
  const styles = new Map<string, string>();

  for (const declaration of String(props.node.attrs.style || '').split(';')) {
    const separatorIndex = declaration.indexOf(':');
    if (separatorIndex === -1) continue;

    const property = declaration.slice(0, separatorIndex).trim();
    const value = declaration.slice(separatorIndex + 1).trim();
    if (property && value) styles.set(property, value);
  }

  return styles;
};

const serializeStyle = (styles: Map<string, string>) =>
  Array.from(styles, ([property, value]) => `${property}: ${value};`).join(' ');

const wrapperStyle = computed(() => {
  const styles = parseStyle();

  return {
    display: styles.get('display') || 'inline-block',
    float: styles.get('float') || 'none',
    margin: styles.get('margin') || '0px',
  };
});

const imageStyle = computed(() => {
  const styles = parseStyle();
  const width = styles.get('width') || styles.get('max-width') ||
    (props.node.attrs.width ? `${props.node.attrs.width}px` : undefined);

  return {
    width: width || undefined,
    maxWidth: '100%',
    height: styles.get('height') || 'auto',
  };
});

const selectImage = () => {
  if (isReadonly.value) return;

  const position = props.getPos();
  if (position === undefined) return;

  props.editor.chain().focus().setNodeSelection(position).run();
};

const getAlignment = (): ImageAlignment | undefined => {
  const styles = parseStyle();

  if (styles.get('margin') === '0 auto' || styles.get('margin') === '0px auto') {
    return 'center';
  }

  const float = styles.get('float');
  return float === 'left' || float === 'right' ? float : undefined;
};

const isAligned = (alignment: ImageAlignment) => getAlignment() === alignment;

const toggleAlignment = (alignment: ImageAlignment) => {
  const styles = parseStyle();
  const nextAlignment = getAlignment() === alignment ? undefined : alignment;

  styles.set(
    'float',
    nextAlignment === 'left' || nextAlignment === 'right'
      ? nextAlignment
      : 'none',
  );
  styles.set('display', nextAlignment === 'center' ? 'block' : 'inline-block');
  styles.set('margin', nextAlignment === 'center' ? '0 auto' : '0px');

  props.updateAttributes({ style: serializeStyle(styles) });
};

const handleResize = (event: PointerEvent) => {
  if (event.pointerId !== activePointerId.value) return;
  const delta =
    resizeDirection.value === 'left'
      ? startClientX.value - event.clientX
      : event.clientX - startClientX.value;
  const width = Math.max(80, Math.round(startWidth.value + delta));
  const styles = parseStyle();

  styles.set('width', `${width}px`);
  styles.set('max-width', `${width}px`);
  styles.set('height', 'auto');
  props.updateAttributes({ style: serializeStyle(styles) });
};

const stopResize = () => {
  activePointerId.value = undefined;
  window.removeEventListener('pointermove', handleResize);
  window.removeEventListener('pointerup', endResize);
  window.removeEventListener('pointercancel', endResize);
};

const endResize = (event: PointerEvent) => {
  if (event.pointerId === activePointerId.value) stopResize();
};

const startResize = (event: PointerEvent, direction: ResizeDirection) => {
  if (!event.isPrimary) return;
  stopResize();
  activePointerId.value = event.pointerId;
  startClientX.value = event.clientX;
  startWidth.value = imageElement.value?.getBoundingClientRect().width ?? 0;
  resizeDirection.value = direction;
  window.addEventListener('pointermove', handleResize);
  window.addEventListener('pointerup', endResize);
  window.addEventListener('pointercancel', endResize);
};

onBeforeUnmount(stopResize);
</script>

<style scoped>
.editor-image {
  position: relative;
  max-width: 100%;
  padding: 0 3px;
  vertical-align: top;
}

.editor-image__content {
  position: relative;
  display: inline-block;
  max-width: 100%;
  line-height: 0;
}

.editor-image__resize-handle {
  touch-action: none;
}

.editor-image img {
  display: block;
  cursor: pointer;
}

.editor-image--selected .editor-image__content {
  outline: 2px dashed rgb(var(--v-theme-text));
}

.editor-image__toolbar {
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 3;
  display: flex;
  padding: 2px 6px;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 6px;
  background-color: rgb(var(--v-theme-surface));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  line-height: normal;
  transform: translate(-50%, calc(-100% - 8px));
}

.editor-image__align-button--active {
  color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.12);
}

.editor-image__resize-handle {
  position: absolute;
  z-index: 2;
  width: 10px;
  height: 10px;
  border: 1px solid rgb(var(--v-theme-text));
  border-radius: 50%;
  background-color: rgb(var(--v-theme-background));
}

.editor-image__resize-handle--top-left {
  top: -5px;
  left: -5px;
  cursor: nwse-resize;
}

.editor-image__resize-handle--bottom-left {
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}

.editor-image__resize-handle--top-right {
  top: -5px;
  right: -5px;
  cursor: nesw-resize;
}

.editor-image__resize-handle--bottom-right {
  right: -5px;
  bottom: -5px;
  cursor: nwse-resize;
}
</style>
