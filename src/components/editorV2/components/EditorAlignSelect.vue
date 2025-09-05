<template>
  <q-select
    v-model="alignValue"
    :options="alignOptions"
    hide-dropdown-icon
    options-dense
    class="html-editor__select-sm"
    :popup-content-class="`html-editor__select-option scrollable-content ${classPrevent}`"
    :disable="canChangeAlign"
    @update:model-value="updateAlign($event)"
  >
    <HintTooltip>{{ alignValue.tooltip }}</HintTooltip>

    <template #selected>
      <component :is="alignValue.icon" />
    </template>

    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <HintTooltip>{{ scope.opt.tooltip }}</HintTooltip>
        <q-item-section>
          <component :is="scope.opt.icon" />
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
// core
import { Editor } from '@tiptap/vue-3';
import { computed, defineComponent, PropType, shallowRef, watch } from 'vue';

// utils
import { ListAlign } from 'src/components/editorV2/utils/tiptap';

export default defineComponent({
  name: 'EditorAlignSelect',
  props: {
    editorInstance: {
      type: Object as PropType<Editor | null>,
      required: true,
    },
    classPrevent: {
      type: String,
      required: false,
    },
    isMobile: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    // vars
    const alignOptions = ListAlign;
    const alignValue = shallowRef(alignOptions[0]);

    const canChangeAlign = computed(() => {
      return props.editorInstance.isActive('codeBlock');
    });

    // function
    const updateAlign = (value: any) => {
      alignValue.value = value;

      let align = value.value;

      if (align === '') {
        align = 'left';
      }

      if (props.isMobile) {
        props.editorInstance.chain().setTextAlign(align).run();
      } else {
        props.editorInstance.chain().focus().setTextAlign(align).run();
      }
    };

    const updateAlignValue = () => {
      const currentAlign = props.editorInstance.isActive({
        textAlign: 'center',
      })
        ? 'center'
        : props.editorInstance.isActive({ textAlign: 'right' })
        ? 'right'
        : props.editorInstance.isActive({ textAlign: 'justify' })
        ? 'justify'
        : 'left';

      const alignOption = alignOptions.find(
        (option) => option.value === currentAlign,
      );
      if (alignOption) {
        alignValue.value = alignOption;
      }
    };

    // hook
    watch(
      () => props.editorInstance,
      (newEditor, oldEditor) => {
        if (newEditor) {
          newEditor.on('selectionUpdate', updateAlignValue);
        }
        if (oldEditor) {
          oldEditor.off('selectionUpdate', updateAlignValue);
        }
      },
      {
        immediate: true,
      },
    );

    return {
      alignValue,
      updateAlign,
      alignOptions,
      canChangeAlign,
    };
  },
});
</script>
