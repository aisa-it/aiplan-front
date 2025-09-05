<template>
  <node-view-wrapper as="li" class="task-item">
    <q-checkbox
      :model-value="isChecked"
      dense
      :disable="isDisabled"
      @update:model-value="toggleChecked"
    />
    <node-view-content class="content" />
  </node-view-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, ref } from 'vue';
import { NodeViewWrapper, NodeViewContent, Editor } from '@tiptap/vue-3';

export default defineComponent({
  name: 'EditorTaskItem',
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
    // computed
    const isChecked = computed(() => props.node.attrs.checked);

    const isDisabled = inject('isEditorReadOnly', ref(true));

    // function
    const toggleChecked = (value: boolean) => {
      props.updateAttributes({ checked: value });
    };

    return {
      isChecked,
      isDisabled,
      toggleChecked,
    };
  },
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },
});
</script>

<style lang="scss" scoped>
.task-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: baseline;

  .q-checkbox.disabled {
    opacity: 1 !important;
  }

  .q-checkbox {
    position: relative;
    top: 5px;
  }

  .content {
    width: 100%;
  }
}
</style>
