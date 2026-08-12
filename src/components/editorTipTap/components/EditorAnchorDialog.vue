<template>
  <v-menu
    v-model="isOpen"
    :target="anchorTarget ?? undefined"
    location-strategy="connected"
    location="bottom start"
    :close-on-content-click="false"
  >
    <v-card class="pa-2 card-input" flat @click="close">
      <form @submit.prevent="renameAnchor">
        <div class="d-flex justify-end mb-1">
          <v-btn
            class="button-link mr-1"
            icon
            color="primary"
            size="x-small"
            type="submit"
            @click.stop
          >
            <v-icon size="14">mdi-content-save</v-icon>
          </v-btn>
          <v-btn
            class="button-link"
            icon
            color="error"
            size="x-small"
            @click="close"
          >
            <v-icon size="14">mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="input-link pa-2" @click.stop>
          <v-text-field
            v-model="anchorTitle"
            variant="underlined"
            density="compact"
            hide-details="auto"
            label="Введите название"
          />
        </div>
      </form>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { Editor } from '@tiptap/vue-3';
import { computed, nextTick, ref, watch } from 'vue';

const props = defineProps<{
  editorInstance: Editor;
  modelValue?: boolean;
}>();

const emits = defineEmits<{
  'update:modelValue': [boolean];
}>();

const anchorTitle = ref('');
const anchorTarget = ref<[number, number] | null>(null);

const isOpen = computed({
  get: () => !!props.modelValue,
  set: (value: boolean) => emits('update:modelValue', value),
});

const setupAnchorPosition = () => {
  const { view, state } = props.editorInstance;
  const { from } = state.selection;

  const node = state.doc.nodeAt(from);
  anchorTitle.value = node?.attrs?.title || '';

  const coords = view.coordsAtPos(from);
  anchorTarget.value = [coords.left, coords.bottom];
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
  close();
};

const close = () => {
  isOpen.value = false;
};

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      nextTick(setupAnchorPosition);
    } else {
      anchorTarget.value = null;
      anchorTitle.value = '';
    }
  },
);
</script>

<style lang="scss" scoped>
.button-link {
  height: 24px !important;
  width: 28px !important;
}

.card-input {
  min-width: 300px;
  height: auto;
}

.input-link {
  display: flex;
  align-items: center;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.3);
  border-radius: 8px;
  background: var(--bg-color, transparent);
}
</style>
