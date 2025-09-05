<template>
  <q-popup-proxy
    ref="popup"
    transition-show="scale"
    transition-hide="scale"
    :offset="[40, 0]"
    no-parent-event
    self="top left"
    :target="popupTarget ?? true"
    style="box-shadow: none; background: transparent !important"
    @before-show="onBeforeShow"
    @hide="hide"
  >
    <q-card
      @click="popup?.hide"
      class="q-pa-sm card-input"
      style="box-shadow: none"
    >
      <q-form @submit="renameAnchor">
        <div class="flex justify-end q-mb-xs">
          <q-btn
            @click.stop
            class="button-link button-link-save"
            icon="save"
            flat
            dense
            no-caps
            type="submit"
          />
          <q-btn
            class="button-link button-link-delete q-ml-xs"
            icon="close"
            flat
            dense
            no-caps
          />
        </div>
        <div @click.stop class="q-pb-sm q-px-sm input-link">
          <q-input
            v-model="anchorTitle"
            dense
            class="full-w base-input"
            label="Введите название"
          />
        </div>
      </q-form>
    </q-card>
  </q-popup-proxy>
</template>

<script setup lang="ts">
import { Editor } from '@tiptap/vue-3';
import { QPopupProxy } from 'quasar';
import { defineProps, ref } from 'vue';
import { useMenuHandler } from 'src/composables/useMenuHandler';

const props = defineProps<{
  editorInstance: Editor;
}>();

const popup = ref<QPopupProxy | null>(null);
const anchorTitle = ref('');
const popupTarget = ref<HTMLElement | null>(null);

let virtualAnchor: HTMLElement | null = null;

useMenuHandler(popup);

const onBeforeShow = () => {
  if (virtualAnchor) {
    virtualAnchor.remove();
    virtualAnchor = null;
  }

  const { view, state } = props.editorInstance;

  const { from } = state.selection;

  const node = state.doc.nodeAt(from);
  anchorTitle.value = node?.attrs?.title || '';
  const coords = view.coordsAtPos(from);
  const virtualEl = document.createElement('div');
  virtualEl.style.position = 'fixed';
  virtualEl.style.left = `${coords.left}px`;
  virtualEl.style.top = `${coords.bottom}px`;
  virtualEl.style.width = '1px';
  virtualEl.style.height = '1px';
  virtualEl.style.pointerEvents = 'none';
  virtualEl.style.zIndex = '9999';

  document.body.appendChild(virtualEl);
  virtualAnchor = virtualEl;

  popupTarget.value = virtualEl;
};

const renameAnchor = () => {
  const { state, view } = props.editorInstance;
  const { from } = state.selection;
  const node = state.doc.nodeAt(from);

  if (!node || !anchorTitle.value) return;

  const newNode = state.schema.nodes.commentLinkMention.create({
    ...node.attrs,
    title: anchorTitle.value,
  });

  const tr = state.tr.replaceWith(from, from + node.nodeSize, newNode);

  view.dispatch(tr);
  popup.value?.hide();
};

const hide = () => {
  if (virtualAnchor) {
    virtualAnchor.remove();
    virtualAnchor = null;
  }
  popupTarget.value = null;
  anchorTitle.value = '';
};
</script>

<style lang="scss" scoped>
.button-link {
  height: 24px !important;
  width: 28px !important;
  border-radius: 50%;
}

.button-link-save {
  background-color: $primary;
  color: white;
}

.button-link-delete {
  background-color: rgb(163, 75, 75);
  color: white;
}

.card-input {
  min-width: 300px;
  height: auto;
  background: transparent !important;
}

.input-link {
  display: flex;
  align-items: center;
  border: 1px solid gray;
  border-radius: 8px;
  background: var(--bg-color) !important;
}
</style>
