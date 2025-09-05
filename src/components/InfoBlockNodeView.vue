<template>
  <NodeViewWrapper ref="nodeWrapper" as="div">
    <div class="info-block">
      <div class="info-header">
        <component :is="ICONS[icon]" :color="iconColor" class="info-icon" />
        <input
          v-model="title"
          :readonly="readonly"
          placeholder="Введите текст"
          class="title-input"
          @blur="updateTitle"
          @click.stop
          @keyup.enter.stop
          @keydown.enter.stop="insertNewRow"
        />
      </div>
      <div class="info-content">
        <NodeViewContent />
      </div>
    </div>
  </NodeViewWrapper>
</template>

<script setup>
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import { ICONS } from 'src/utils/icons';
import { ref, inject, computed } from 'vue';

const props = defineProps(nodeViewProps);

const title = ref(props.node.attrs.title);
const icon = computed(() => props.node.attrs.icon || 'infoIcon');
const iconColor = computed(() => props.node.attrs.iconColor || undefined);
const readonly = inject('isEditorReadOnly', ref(true));
const nodeWrapper = ref(null);

const updateTitle = () => {
  props.updateAttributes({ title: title.value });
};

const insertNewRow = () => {
  if (!readonly.value) {
    const { state, view } = props.editor;
    const { tr } = state;

    const pos = props.getPos?.();

    if (typeof pos === 'number') {
      const paragraph = state.schema.nodes.paragraph.create();
      const transaction = tr.insert(pos, paragraph);
      view.dispatch(transaction);
    }
  }
};
</script>
