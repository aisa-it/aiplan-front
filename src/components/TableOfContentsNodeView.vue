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
          :href="`#${link.anchorId || link.id}`"
          :style="'padding-left:' + `${30 * (link.originalLevel - 1)}px`"
          class="html-editor__toc-link"
          @click.prevent="onItemClick(link)"
        >
          {{ !hasOwnNumeration(link.text) ? link.index + ' ' : ''
          }}{{ link.text }}
        </a>
      </div>
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import { ref, inject } from 'vue';
import CloseIcon from 'components/icons/CloseIcon.vue';
import {
  scrollToAnchorId,
  scrollToAnchorElement,
} from 'src/utils/scrollToAnchor';

const props = defineProps(nodeViewProps);

const links = ref(props.node.attrs.links);
const readonly = inject('isEditorReadOnly', ref(true));
const nodeWrapper = ref(null);

const hasOwnNumeration = (heading) => {
  const firstChar = heading[0];
  return /\d/.test(firstChar);
};

const onItemClick = (link) => {
  if (!props.editor || props.editor.options.editable) return;

  // Основной путь: постоянный id заголовка, сохранённый в документе.
  if (
    link.anchorId &&
    scrollToAnchorId(props.editor, link.anchorId, {
      focus: true,
    })
  ) {
    return;
  }

  // Запасной путь для старых документов, где заголовки ещё без id: ищем цель
  // сопоставлением текста и уровня. Способ ненадёжный (два одинаковых
  // заголовка уводят не туда), поэтому он именно запасной.
  const targetLink = props.editor.extensionStorage.tableOfContents.content.find(
    (el) =>
      el.textContent === link.text && el.originalLevel === link.originalLevel,
  );

  if (!targetLink) return;

  const element = props.editor.view.dom.querySelector(
    `[data-toc-id="${targetLink.id}"]`,
  );

  if (element) scrollToAnchorElement(props.editor, element, { focus: true });
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
