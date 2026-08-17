<template>
  <node-view-wrapper as="li" class="task-item">
    <v-checkbox-btn
      :model-value="isChecked"
      color="primary"
      density="compact"
      :disabled="isDisabled"
      @update:model-value="toggleChecked"
    />
    <node-view-content class="content" />
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { NodeViewWrapper, NodeViewContent, Editor } from '@tiptap/vue-3';

const props = defineProps<{
  node: any;
  updateAttributes: (data: any) => any;
  editor: Editor | null;
}>();

// computed
const isChecked = computed(() => props.node.attrs.checked);

const isDisabled = inject('isEditorReadOnly', ref(true));

// function
const toggleChecked = (value: boolean) => {
  props.updateAttributes({ checked: value });
};
</script>

<style lang="scss" scoped>
.task-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  align-items: center;

  .v-checkbox-btn {
    flex: none;
    width: 18px;
    height: 18px;
    min-width: 18px;
    transform: translateY(-2px);
  }

  :deep(.v-selection-control) {
    min-height: 18px;
    height: 18px;
  }

  .content {
    flex: 1;
    min-width: 0;
  }
}
</style>
