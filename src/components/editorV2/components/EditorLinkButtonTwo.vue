<template>
  <q-btn
    dense
    flat
    @click="toggleLinkTooltip"
    :class="{ 'format-active': isActive }"
  >
    <HintTooltip>Ссылка</HintTooltip>
    <component :is="ICONS.linkIcon" color="currentColor" />
  </q-btn>

  <q-popup-proxy
    v-if="showPicker"
    v-model="showPicker"
    transition-show="scale"
    transition-hide="scale"
    :offset="[40, 0]"
    anchor="bottom left"
    self="top left"
    :target="popupTarget"
    style="box-shadow: none; background: transparent !important"
  >
    <q-card
      @click="showPicker = false"
      class="q-pa-sm card-input"
      style="box-shadow: none"
    >
      <q-form @submit="pasteUrl">
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
            v-model="linkUrl"
            dense
            class="full-w base-input"
            label="Введите ссылку"
            :rules="[
              (val) =>
                isValidURL(val) || 'Введите URL в формате schema://example.com',
            ]"
          />
        </div>
      </q-form>
    </q-card>
  </q-popup-proxy>
</template>

<script setup lang="ts">
import { Editor } from '@tiptap/vue-3';
import { computed, defineProps, ref, watch, nextTick } from 'vue';
import { ICONS } from 'src/utils/icons';
import { isValidURL } from 'src/utils/validation';
import { parseCommentLink } from 'src/utils/links';

const props = defineProps<{
  editorInstance: Editor;
}>();

const showPicker = ref(false);
const linkUrl = ref('');
const popupTarget = ref<HTMLElement | null>(null);
let virtualAnchor: HTMLElement | null = null;

const isActive = computed(() => {
  return props.editorInstance.isActive('link');
});

const toggleLinkTooltip = (e: MouseEvent) => {
  e.stopPropagation();

  if (virtualAnchor) {
    virtualAnchor.remove();
    virtualAnchor = null;
  }

  const { from, empty } = props.editorInstance.state.selection;

  if (empty && !props.editorInstance.isActive('link')) {
    return;
  }

  const coords = props.editorInstance.view.coordsAtPos(from);

  const virtualEl = document.createElement('div');
  virtualEl.style.position = 'absolute';
  virtualEl.style.left = `${coords.left + window.scrollX}px`;
  virtualEl.style.top = `${coords.bottom + window.scrollY}px`;
  virtualEl.style.width = '1px';
  virtualEl.style.height = '1px';
  virtualEl.style.pointerEvents = 'none';
  virtualEl.style.zIndex = '9999';

  document.body.appendChild(virtualEl);
  virtualAnchor = virtualEl;

  popupTarget.value = virtualEl;
  showPicker.value = true;

  nextTick(() => {
    if (props.editorInstance.isActive('link')) {
      const attrs = props.editorInstance.getAttributes('link');
      linkUrl.value = attrs.href || '';
    } else {
      linkUrl.value = '';
    }
  });
};

const pasteUrl = () => {
  const { from, to } = props.editorInstance.state.selection;
  const selectedText = props.editorInstance.state.doc.textBetween(from, to);
  const parsed = parseCommentLink(linkUrl.value, selectedText);
  if (parsed) {
    const node =
      props.editorInstance.state.schema.nodes.commentLinkMention?.create(
        parsed,
      );
    const tr = props.editorInstance.state.tr.replaceSelectionWith(node);
    props.editorInstance.view.dispatch(tr);
  } else {
    props.editorInstance
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: linkUrl.value })
      .run();
  }

  showPicker.value = false;
};

watch(showPicker, (val) => {
  if (!val && virtualAnchor) {
    virtualAnchor.remove();
    virtualAnchor = null;
    popupTarget.value = null;
    linkUrl.value = '';
  }
});
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
