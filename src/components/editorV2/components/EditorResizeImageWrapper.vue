<template>
  <NodeViewWrapper
    class="image-wrapper"
    :style="wrapperStyle"
    :class="classPrevent"
    @click="setActive"
  >
    <div
      class="image-wrapper__block"
      :class="{ 'resize-active': isActive && !isReadOnly }"
      :style="getStyle(node.attrs.style)"
    >
      <img
        ref="image"
        :src="node.attrs.src"
        :alt="node.attrs.alt"
        :style="getStyle(node.attrs.style)"
        :class="{ zoom: isReadOnly }"
        :draggable="node.attrs.draggable"
        :data-asset="node.attrs.src"
        :data-drag-handle="node.attrs.draggable"
      />
      <span
        class="image-wrapper__controller"
        :class="classPrevent"
        v-if="isActive && !isReadOnly"
      >
        <span
          class="image-wrapper__toolbar"
          :class="classPrevent"
          @mousedown.stop
        >
          <q-btn
            v-for="t in toolbar"
            :key="t.value"
            :class="{ 'align-active': isAlignActive(t.value) }"
            dense
            flat
            @mousedown.stop
            @click="handleAlign($event, t.value)"
          >
            <HintTooltip>{{
              isAlignActive(t.value) ? 'Сбросить выравнивание' : t.tooltip
            }}</HintTooltip>
            <component :is="t.icon" />
          </q-btn>
        </span>

        <span
          class="resize-handle resize-handle_top resize-handle_left nwse-resize"
          @mousedown="startResize($event, 'left')"
          @touchstart="startResize($event, 'left')"
        ></span>
        <span
          class="resize-handle resize-handle_bottom resize-handle_left nesw-resize"
          @mousedown="startResize($event, 'left')"
          @touchstart="startResize($event, 'left')"
        ></span>
        <span
          class="resize-handle resize-handle_top resize-handle_right nesw-resize"
          @mousedown="startResize"
          @touchstart="startResize"
        ></span>
        <span
          class="resize-handle resize-handle_bottom resize-handle_right nwse-resize"
          @mousedown="startResize"
          @touchstart="startResize"
        ></span>
      </span>
    </div>
  </NodeViewWrapper>
</template>

<script lang="ts">
// core
import {
  defineComponent,
  ref,
  computed,
  watch,
  shallowRef,
  PropType,
  inject,
} from 'vue';
import { Editor, NodeViewWrapper } from '@tiptap/vue-3';
// utils
import { ICONS } from 'src/utils/icons';

class Image {
  display = 'inline-block';
  'max-width' = '100%';
  height = 'auto';
  float = 'none';
  margin = '0px';
  width = '100%';
}

export default defineComponent({
  name: 'EditorResizeImageWrapper',
  props: {
    node: {
      type: Object,
      required: true,
    },
    updateAttributes: {
      type: Function,
      required: true,
    },
    editor: {
      type: Object as PropType<Editor | null>,
      required: true,
    },
  },
  setup(props) {
    // vars
    const image = ref<HTMLImageElement | null>(null);
    const startX = ref<number | undefined>();
    const isActive = ref<boolean>(false);
    const direction = ref<string | undefined>();
    const isResize = ref<boolean>(false);
    const imageStyle = ref<Image>(new Image());
    const startWidth = ref<number | undefined>();
    const injectedReadOnly = inject('isEditorReadOnly', ref(false));

    const toolbar = shallowRef([
      {
        value: 'left',
        icon: ICONS.paragraphLeftIcon,
        tooltip: 'Выровнять по левому краю',
      },
      {
        value: 'center',
        icon: ICONS.paragraphCenterIcon,
        tooltip: 'Выровнять по центру',
      },
      {
        value: 'right',
        icon: ICONS.paragraphRightIcon,
        tooltip: 'Выровнять по правому краю',
      },
    ]);

    const wrapperStyle = computed(() => {
      const style = getStyle(props.node.attrs.style);

      return {
        float: style.float,
        margin: style.margin,
        display: style.display,
      };
    });

    const isReadOnly = computed(() => {
      return injectedReadOnly.value || !props.editor?.isEditable;
    });

    const classPrevent = computed(() => {
      return props.editor?.options.classPrevent;
    });

    const getStyle = (style: string): object => {
      const stylesArray = style.split(';').filter((style) => style.trim());
      const styleObject = new Image();
      const arrayKey = Object.keys(styleObject);
      for (const style of stylesArray) {
        const [key, value] = style.split(':').map((s) => s.trim());
        const isKey = arrayKey.indexOf(key);

        if (isKey !== -1 && value) {
          if (key === 'width') {
            styleObject['max-width'] = value;
            styleObject['width'] = value;
          } else {
            styleObject[key] = value;
          }
        }
      }

      return styleObject;
    };

    const startResize = (event: MouseEvent | TouchEvent, dir?: string) => {
      if (event instanceof MouseEvent) {
        startX.value = event.clientX;
      } else {
        startX.value = event.touches[0].clientX;
      }

      direction.value = dir;
      isResize.value = true;
      startWidth.value = image.value?.offsetWidth;
      event.preventDefault();

      document.addEventListener('mousemove', onResize);
      document.addEventListener('touchmove', onResize);
      document.addEventListener('mouseup', stopResize);
      document.addEventListener('touchend', stopResize);
      document.addEventListener('touchcancel', stopResize);
    };

    const onResize = (event: MouseEvent | TouchEvent) => {
      if (!isResize.value) {
        return;
      }
      if (
        image.value &&
        startX.value !== undefined &&
        startWidth.value !== undefined
      ) {
        let clientX;
        if (event instanceof MouseEvent) {
          clientX = event.clientX;
        } else {
          clientX = event.touches[0].clientX;
        }
        const deltaX =
          direction.value === 'left'
            ? startX.value - clientX
            : clientX - startX.value;

        const width = startWidth.value + deltaX;
        imageStyle.value.width = `${width}px`;
        imageStyle.value['max-width'] = `${width}px`;
        props.updateAttributes({ width: `${width}`, style: styleString() });
      }
    };

    const stopResize = () => {
      isResize.value = false;
      document.removeEventListener('mousemove', onResize);
      document.removeEventListener('mouseup', stopResize);
      document.removeEventListener('touchmove', onResize);
      document.removeEventListener('touchend', stopResize);
      document.removeEventListener('touchcancel', stopResize);
    };

    const handleClickDocument = (event) => {
      if (
        props.editor &&
        !props.editor.view.dom.contains(event.target as Node)
      ) {
        handleUpdate();
        return;
      }
    };

    const setActive = () => {
      if (isReadOnly.value) {
        return;
      }

      if (image.value) {
        document.removeEventListener('click', handleClickDocument, false);
        document.addEventListener('click', handleClickDocument, false);
        imageStyle.value = getStyle(props.node.attrs.style);
        isActive.value = true;
      }
    };

    const handleAlign = (event, value: string) => {
      if (value === 'center') {
        if (
          imageStyle.value.margin === '0 auto' ||
          imageStyle.value.margin === '0px auto'
        ) {
          imageStyle.value.display = 'inline-block';
          imageStyle.value.margin = '0px';
        } else {
          imageStyle.value.display = 'block';
          imageStyle.value.margin = '0 auto';
        }

        imageStyle.value.float = 'none';
      } else if (value === 'left' || value === 'right') {
        if (imageStyle.value.float === value) {
          imageStyle.value.float = 'none';
        } else {
          imageStyle.value.float = value;
        }
        imageStyle.value.display = 'inline-block';
        imageStyle.value.margin = '0px';
      }

      props.updateAttributes({ style: styleString() });
    };

    const styleString = (): string => {
      imageStyle.value.width = imageStyle.value['max-width'];
      return Object.entries(imageStyle.value)
        .map(([key, value]) => `${key}: ${value};`)
        .join(' ');
    };

    const handleUpdate = () => {
      if (isReadOnly.value) {
        return;
      }

      if (!isResize.value) {
        isActive.value = false;
      }
    };

    const isAlignActive = (value: string) => {
      const style = getStyle(props.node.attrs.style);
      if (value === 'center') {
        return style.margin === '0px auto' || style.margin === '0 auto';
      }

      return value === style.float;
    };

    watch(
      () => props.editor,
      (newEditor, oldEditor) => {
        if (newEditor) {
          newEditor.on('selectionUpdate', handleUpdate);
        }
        if (oldEditor) {
          oldEditor.off('selectionUpdate', handleUpdate);
        }
      },
      {
        immediate: true,
      },
    );

    return {
      image,
      ICONS,
      toolbar,
      isActive,
      getStyle,
      setActive,
      isReadOnly,
      handleAlign,
      startResize,
      classPrevent,
      wrapperStyle,
      isAlignActive,
    };
  },
  components: { NodeViewWrapper },
});
</script>

<style lang="scss" scoped>
.image-wrapper {
  display: inline-block;
  width: fit-content;
  padding: 0 3px;
  position: relative;
  height: 100%;
  max-width: 100% !important;
  z-index: 1;

  &__block {
    position: relative;
    height: 100%;
    max-width: 100% !important;
    z-index: 1;

    &.resize-active {
      outline: 2px dashed #000000;
    }
  }

  img {
    cursor: pointer;
    max-width: 100% !important;
    &.zoom {
      cursor: zoom-in;
    }
  }

  &__controller {
    position: absolute;
    height: 100%;
    width: 100%;
    left: 0;
    top: 0;
  }

  &__toolbar {
    position: absolute;
    top: 0;
    left: 50%;
    width: 100px;
    height: 28px;
    z-index: 999;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 4px;
    border: 2px solid #6c6c6c;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;

    .q-btn {
      background: transparent;
      padding: 0;
      color: #000000;
      height: 24px;
      max-height: 24px;
      min-height: 24px;
    }

    .align-active {
      background-color: #dbeafe;
      color: #2563eb;
    }
  }

  .resize-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    border: 1px solid #000000;
    border-radius: 100%;
    background: $base;

    &_top {
      top: -5px;
    }

    &_bottom {
      bottom: -5px;
    }

    &_left {
      left: -5px;
    }

    &_right {
      right: -5px;
    }

    &.nesw-resize {
      cursor: nesw-resize;
    }

    &.nwse-resize {
      cursor: nwse-resize;
    }
  }
}
</style>
