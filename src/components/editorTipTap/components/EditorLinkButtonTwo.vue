<template>
  <v-btn
    icon
    variant="text"
    size="small"
    density="compact"
    :class="{ 'format-active': isActive }"
    @click="toggleLinkTooltip"
  >
    <HintTooltip>Ссылка</HintTooltip>
    <component :is="ICONS.linkIcon" color="currentColor" />
  </v-btn>

  <v-menu
    v-model="showPicker"
    :target="linkTarget ?? undefined"
    location-strategy="connected"
    location="bottom start"
    :close-on-content-click="false"
  >
    <v-card class="pa-2 card-input" flat @click="close">
      <form @submit.prevent="pasteUrl">
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
            v-model="linkUrl"
            variant="underlined"
            density="compact"
            hide-details="auto"
            label="Введите ссылку"
            :rules="[
              (val: string) =>
                isValidURL(val) || 'Введите URL в формате schema://example.com',
            ]"
          />
        </div>
      </form>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { Editor } from '@tiptap/vue-3';
import { computed, nextTick, ref, watch } from 'vue';
import { ICONS } from '@/utils/icons';
import { isValidURL } from 'src/utils/validation';
import HintTooltip from './HintTooltip.vue';
// TODO: parseCommentLink is not migrated yet — pasted links are treated as plain URLs for now.
// import { parseCommentLink } from 'src/utils/links';

const props = defineProps<{
  editorInstance: Editor;
}>();

const showPicker = ref(false);
const linkUrl = ref('');
const linkTarget = ref<[number, number] | null>(null);

const isActive = computed(() => {
  return props.editorInstance.isActive('link');
});

const toggleLinkTooltip = (e: MouseEvent) => {
  e.stopPropagation();

  const { from, empty } = props.editorInstance.state.selection;

  if (empty && !props.editorInstance.isActive('link')) {
    return;
  }

  const coords = props.editorInstance.view.coordsAtPos(from);
  linkTarget.value = [coords.left, coords.bottom];
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
  // TODO: parseCommentLink is not migrated yet — treat the pasted value as a plain link for now.
  props.editorInstance
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: linkUrl.value })
    .run();

  close();
};

const close = () => {
  showPicker.value = false;
};

watch(showPicker, (val) => {
  if (!val) {
    linkTarget.value = null;
    linkUrl.value = '';
  }
});
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
