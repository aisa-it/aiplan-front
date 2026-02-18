<template>
  <NodeViewWrapper ref="nodeWrapper" as="div">
    <div v-if="!readonly">
      <div class="html-editor__toc-placoholder">
        <div class="q-pr-xs">Оглавление</div>
        <q-btn flat padding="xs" @click.stop="removeNode">
          <CloseIcon />
        </q-btn>
      </div>
    </div>
    <div v-else>
      <div v-for="link in links" :key="link.id">
        <a
          :href="`#${link.id}`"
          :style="'padding-left:' + `${30 * (link.originalLevel - 1)}px`"
          class="html-editor__toc-link"
          @click.prevent="onItemClick(link)"
        >
          {{ !hasOwnNumeration(link.text) ? link.index + ' ' : '' }}{{ link.text }}
        </a>
      </div>
    </div>
  </NodeViewWrapper>
</template>

<script setup>
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import { TextSelection } from '@tiptap/pm/state';
import { ref, inject } from 'vue';
import CloseIcon from 'components/icons/CloseIcon.vue';

const props = defineProps(nodeViewProps);

const links = ref(props.node.attrs.links);
const readonly = inject('isEditorReadOnly', ref(true));
const nodeWrapper = ref(null);

const hasOwnNumeration = (heading) => {
  const firstChar = heading[0];
  return /\d/.test(firstChar);
}

const onItemClick = (link) => {
  if (props.editor && !props.editor.options.editable) {
    const targetLink =
      props.editor.extensionStorage.tableOfContents.content.find(
        (el) =>
          el.textContent === link.text &&
          el.originalLevel === link.originalLevel,
      );

    if (targetLink) {
      const element = props.editor.view.dom.querySelector(
        `[data-toc-id="${targetLink.id}"]`,
      );
      const pos = props.editor.view.posAtDOM(element, 0);
      const tr = props.editor.view.state.tr;
      tr.setSelection(new TextSelection(tr.doc.resolve(pos)));
      props.editor.view.dispatch(tr);
      props.editor.view.focus();

      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - 60,
        behavior: 'smooth',
      });
    }
  }
};

const removeNode = () => {
  const pos = props.getPos?.();
  if (typeof pos !== 'number') {
    return;
  }
  const { state, view } = props.editor;
  const node = state.doc.nodeAt(pos);
  if (!node || node.type.name !== 'heading-links') {
    return;
  }
  const paragraph = state.schema.nodes.paragraph.create();
  const transaction = state.tr.replaceWith(pos, pos + node.nodeSize, paragraph);
  view.dispatch(transaction);
};
</script>
