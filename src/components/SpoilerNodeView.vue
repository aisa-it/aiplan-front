<template>
  <node-view-wrapper ref="nodeWrapper" as="div">
    <div class="spoiler-wrapper">
      <div
        :class="['spoiler-header', { activeSpoiler: isCollapsed }]"
        :style="node.attrs.style"
        @click="toggleCollapse"
      >
        <q-input
          v-model="title"
          :readonly="readonly"
          :input-style="{ color: `${styleColors.color} !important` }"
          class="title-input-spoiler"
          placeholder="Спойлер"
          dense
          borderless
          @blur="updateTitle"
          @focus="emitFocusSpoiler"
          @click.stop
          @keyup.enter.stop
        />
        <!-- @keydown.enter.stop="insertNewRow" -->
        <q-btn
          v-if="!readonly"
          class="q-mr-xs"
          padding="xs"
          flat
          @click.stop="deleteSpoiler"
        >
          <CloseIcon :color="styleColors.color" />
        </q-btn>
      </div>
      <transition name="fade-slide">
        <div v-show="isCollapsed" class="spoiler-content">
          <div v-if="isEmptyContent" class="spoiler-placeholder">
            Скрытый контент
          </div>
          <node-view-content @click="toggleEditingMode" />
        </div>
      </transition>
    </div>
  </node-view-wrapper>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch, inject } from 'vue';
import { NodeViewWrapper, nodeViewProps, NodeViewContent } from '@tiptap/vue-3';
import { QInput, QBtn } from 'quasar';
import CloseIcon from './icons/CloseIcon.vue';

const props = defineProps(nodeViewProps);
const bus = inject('bus');

const getStyleColors = (styleString) => {
  if (!styleString) return { backgroundColor: null, color: null };

  const styles = styleString.split(';').reduce((acc, style) => {
    const [property, value] = style.split(':').map((s) => s.trim());
    if (property && value) {
      acc[property] = value;
    }
    return acc;
  }, {});
  return {
    backgroundColor: styles['background-color'] || null,
    color: styles['color'] || null,
  };
};

const isCollapsed = ref(false);
const title = ref(props.node.attrs.title);
const readonly = inject('isEditorReadOnly', ref(true));
const nodeWrapper = ref(null);

const styleColors = computed(() => getStyleColors(props.node.attrs.style));

const isEmptyContent = computed(() => {
  const content = props.node.content;
  return (
    content.childCount === 1 &&
    content.firstChild?.type.name === 'paragraph' &&
    content.firstChild.content.size === 0
  );
});

watch(
  () => props.node.attrs.collapsed,
  (newValue) => {
    isCollapsed.value = newValue;
  },
);

watch(
  () => props.node.attrs.title,
  (newValue) => {
    title.value = newValue;
  },
);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// А функция и не работала

// const insertNewRow = () => {
//   console.log('Строка')
//   if (readonly.value) return;

//   const spoilerNode = props.node;
//   if (spoilerNode.type.name !== 'spoiler') return;

//   const { state, view } = props.editor;
//   const { $from } = state.selection;

//   const isLastEmptyParagraph = state.doc.nodeAt($from.pos).size;
//   console.log('Строка', isLastEmptyParagraph)

//   const paragraph = schema.nodes.paragraph.create();
//   const transaction = state.tr.insert($from.pos, paragraph);

//   view.dispatch(transaction);
//   view.focus();
// };

const deleteSpoiler = () => {
  const pos = props.getPos?.();
  if (typeof pos !== 'number') return;

  const { state, view } = props.editor;
  const node = state.doc.nodeAt(pos);
  if (!node || node.type.name !== 'spoiler') return;

  // Очищаем переменные, чтобы избежать блокирования на редактировании
  if (bus && typeof props.getPos === 'function') {
    bus.emit('focusSpoiler', props.getPos(), styleColors.value, false, false);
  }

  const paragraph = state.schema.nodes.paragraph.create();
  const transaction = state.tr.replaceWith(pos, pos + node.nodeSize, paragraph);
  view.dispatch(transaction);
  view.focus();
};

const updateTitle = () => {
  props.updateAttributes({ title: title.value });
  bus.emit('focusSpoiler', props.getPos(), styleColors.value, false, true);
};

function emitFocusSpoiler() {
  if (bus && typeof props.getPos === 'function') {
    bus.emit('focusSpoiler', props.getPos(), styleColors.value, true, true);
  }
}

function toggleEditingMode() {
  if (bus && typeof props.getPos === 'function') {
    bus.emit('focusSpoiler', props.getPos(), styleColors.value, false, false);
  }
}

onMounted(() => {
  nextTick(() => {
    if (!readonly.value) {
      isCollapsed.value = true;
    }
  });
});
</script>

<style scoped>
.spoiler-wrapper {
  margin-bottom: 10px;
}

.spoiler-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-left: 10px;
  transition: background-color 0.2s ease;
  border-radius: 6px;
}

.spoiler-header::before {
  content: '❯';
  display: inline-block;
  margin-right: 8px;
  transition: transform 0.2s;
}

.spoiler-header.activeSpoiler::before {
  transform: rotate(90deg);
}

.title-input-spoiler {
  flex-grow: 1;
}

.title-input-spoiler :deep(.q-field__native) {
  color: var(--text-color);
}

.title-input-spoiler :deep(.q-field__control) {
  min-height: 24px !important;
  padding: 0;
}

.delete-btn {
  background-color: transparent;
}

.spoiler-content {
  padding: 0px 8px 0px 20px;
}

.spoiler-placeholder {
  position: absolute;
  color: #696a6b;
  pointer-events: none;
  padding-left: 4px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
