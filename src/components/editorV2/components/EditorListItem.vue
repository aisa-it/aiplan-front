<template>
  <node-view-wrapper
    as="li"
    class="list-item"
    :style="styleValueMark"
  >
    <span class="list-item__mark"></span>
    <node-view-content class="list-content"/>
  </node-view-wrapper>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import { NodeViewWrapper, NodeViewContent, Editor } from '@tiptap/vue-3';

export default defineComponent({
  name: 'EditorListItem',
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
    const styleValueMark = ref<string>('');
    const indentClass = ref<string>('');

    // function
    const getStyleMark = () => {
      let styleMark = '';
      const marks = props.node.content?.content[0].content?.content[0]?.marks ?? [];

      for (const mark of marks) {
        if (mark.type.name === 'textStyle') {
          styleMark += `color: ${mark.attrs.color};`;
          styleMark += `font-size: ${mark.attrs.fontSize};`;
        }
      }

      styleValueMark.value = styleMark;
    }

    // hook
    watch(
      () => props.node,
      () => {
        getStyleMark();
      },
      { immediate: true }
    );

    return {
      indentClass,
      styleValueMark,
    };
  },
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },
});
</script>
